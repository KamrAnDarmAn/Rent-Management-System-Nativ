import type { Expense } from "../types/expense";
import type { RentCalendar, Shop } from "../types/shop";
import {
  addCalendarMonths,
  calendarMonthStart,
  calendarParts,
  parseCalendarDate,
  supportedCalendarDate,
} from "../utils/calendar";
import { ledgerStartDate, rentAccount } from "./rentAccount";
import { rentCollections } from "./rentCollections";
import { kabulDate, rentalPeriod, validDate } from "./rentSchedule";

export type ReportMode = "monthly" | "yearly";
export type ReportOptions = {
  date: string;
  calendar: RentCalendar;
  mode: ReportMode;
  shopId?: number;
  today?: string;
};
export const reportPercent = (part: bigint, total: bigint) =>
  total > 0n ? Number((part * 10000n + total / 2n) / total) / 100 : 0;
const sum = (values: number[]) =>
  values.reduce((total, value) => total + BigInt(value), 0n);
const compare = (a: bigint, b: bigint) => (a > b ? -1 : a < b ? 1 : 0);

/** Charges are grouped by rent period; receipts/expenses by their actual civil dates. */
export function buildRentReport(
  records: readonly Shop[],
  expenses: readonly Expense[],
  options: ReportOptions,
) {
  const { calendar, mode, date, shopId, today = kabulDate() } = options;
  const monthStart = calendarMonthStart(date, calendar);
  const year = calendarParts(date, calendar).year;
  const start =
    mode === "monthly"
      ? monthStart
      : parseCalendarDate(`${String(year).padStart(4, "0")}-01-01`, calendar)!;
  const end = addCalendarMonths(start, mode === "monthly" ? 1 : 12, calendar);
  const eligible = records.filter(
    (shop) => (shop.rentCalendar ?? "gregorian") === calendar,
  );
  const shops = eligible.filter(
    (shop) => shopId === undefined || shop.id === shopId,
  );
  const ids = new Set(shops.map((shop) => shop.id));
  // Pin legacy opening balances to their known current period, never repeat them in old months.
  const accounts = shops.map((shop) => ({
    shop,
    account: rentAccount(
      {
        ...shop,
        rentLedgerStartDate: ledgerStartDate(shop, today),
        openingRentPeriod:
          shop.openingRentPeriod ??
          rentalPeriod(shop.startDate, today, calendar).dueDate ??
          shop.startDate,
      },
      today,
    ),
  }));
  const scopedExpenses = expenses.filter((expense) =>
    expense.shopId === undefined
      ? shopId === undefined
      : ids.has(expense.shopId),
  );
  const validExpenses = scopedExpenses.filter(
    (expense) =>
      Number.isSafeInteger(expense.amount) &&
      expense.amount > 0 &&
      !!expense.date &&
      validDate(expense.date),
  );
  const summarize = (from: string, to: string) => {
    const received = rentCollections(shops, from, to, today);
    const periodExpenses = validExpenses.filter(
      (expense) =>
        expense.date! >= from && expense.date! < to && expense.date! <= today,
    );
    const spent = sum(
      periodExpenses
        .filter(
          (expense) =>
            expense.method !== "Credit" && expense.method !== "Rent Offset",
        )
        .map((expense) => expense.amount),
    );
    const expenseTotal = sum(
      periodExpenses
        .filter((expense) => !expense.settlementFor)
        .map((expense) => expense.amount),
    );
    const categories = new Map<string, bigint>();
    for (const expense of periodExpenses.filter(
      (expense) => !expense.settlementFor,
    ))
      categories.set(
        expense.category || "Other",
        (categories.get(expense.category || "Other") ?? 0n) +
          BigInt(expense.amount),
      );
    const performance = accounts.map(({ shop, account }) => {
      const issued =
        shop.occupied || shop.tenancyEndDate
          ? account.periods.filter((row) => row.date < to && row.date <= today)
          : [];
      const selected = issued.filter((row) => row.date >= from);
      const expected = sum(selected.map((row) => row.charge));
      const settled = sum(selected.map((row) => row.paid));
      return {
        shop,
        expected,
        settled,
        due: expected - settled,
        outstanding: sum(issued.map((row) => row.due)),
        arrears: sum(
          issued.filter((row) => row.date < from).map((row) => row.due),
        ),
        received: rentCollections([shop], from, to, today).total,
        prepaid: sum(selected.map((row) => row.prepaidApplied)),
        credits: sum(
          (shop.rentTransactions ?? [])
            .filter(
              (entry) =>
                entry.kind === "credit" &&
                entry.source !== "goods" &&
                validDate(entry.date) &&
                entry.date >= from &&
                entry.date < to &&
                entry.date <= today &&
                Number.isSafeInteger(entry.amount) &&
                entry.amount > 0,
            )
            .map((entry) => entry.amount),
        ),
        goodsOffsets: sum(
          (shop.rentTransactions ?? [])
            .filter(
              (entry) =>
                entry.source === "goods" &&
                entry.kind === "credit" &&
                validDate(entry.date) &&
                entry.date >= from &&
                entry.date < to &&
                entry.date <= today &&
                Number.isSafeInteger(entry.amount) &&
                entry.amount > 0,
            )
            .map((entry) => entry.amount),
        ),
        status:
          expected === 0n
            ? "No rent due"
            : settled === expected
              ? "Paid"
              : settled > 0n
                ? "Partial"
                : "Unpaid",
        periods: selected.length,
      };
    });
    const expected = performance.reduce(
      (total, row) => total + row.expected,
      0n,
    );
    const settled = performance.reduce((total, row) => total + row.settled, 0n);
    const outstanding = performance.reduce(
      (total, row) => total + row.outstanding,
      0n,
    );
    const credits = performance.reduce((total, row) => total + row.credits, 0n);
    const prepaid = performance.reduce((total, row) => total + row.prepaid, 0n);
    return {
      start: from,
      end: to,
      expected,
      settled,
      due: expected - settled,
      outstanding,
      arrears: performance.reduce((total, row) => total + row.arrears, 0n),
      cash: received.cash,
      other: received.other,
      received: received.total,
      expenses: expenseTotal,
      spent,
      unpaidExpenses: sum(
        periodExpenses
          .filter((expense) => expense.method === "Credit")
          .map((expense) =>
            Math.max(
              0,
              expense.amount -
                validExpenses
                  .filter(
                    (s) =>
                      expense.id &&
                      s.settlementFor !== undefined &&
                      s.settlementFor === expense.id?.replace(/^goods:/, "") &&
                      s.date! <= today,
                  )
                  .reduce((n, s) => n + s.amount, 0),
            ),
          ),
      ),
      net: received.total - spent,
      credits,
      goodsTaken: sum(
        periodExpenses
          .filter((e) => e.category === "Goods Taken" && !e.settlementFor)
          .map((e) => e.amount),
      ),
      goodsOffsets: performance.reduce((n, row) => n + row.goodsOffsets, 0n),
      prepaid,
      percent: reportPercent(settled, expected),
      hasData:
        performance.some((row) => row.periods > 0) ||
        received.total > 0n ||
        periodExpenses.length > 0 ||
        credits > 0n,
      future: from > today,
      categories: [...categories]
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => compare(a.value, b.value)),
      shops: performance.sort(
        (a, b) =>
          compare(a.outstanding, b.outstanding) ||
          a.shop.number.localeCompare(b.shop.number, undefined, {
            numeric: true,
          }),
      ),
      statuses: ["Paid", "Partial", "Unpaid", "No rent due"].map((label) => ({
        label,
        count: performance.filter(
          (row) => row.shop.occupied && row.status === label,
        ).length,
      })),
    };
  };
  const current = summarize(start, end);
  const shiftMonth = (offset: number) => {
    try {
      const shifted = addCalendarMonths(start, offset, calendar);
      return supportedCalendarDate(shifted, calendar) ? shifted : null;
    } catch {
      return null;
    }
  };
  const previousStart = shiftMonth(mode === "monthly" ? -1 : -12);
  const previous = summarize(previousStart ?? start, start);
  const series = Array.from(
    { length: mode === "monthly" ? 6 : 12 },
    (_, index) => {
      const pointStart = shiftMonth(mode === "monthly" ? index - 5 : index);
      return pointStart
        ? summarize(pointStart, addCalendarMonths(pointStart, 1, calendar))
        : null;
    },
  ).filter((point) => point !== null);
  return {
    ...current,
    previous,
    series,
    calendar,
    mode,
    date,
    today,
    occupied: shops.filter((shop) => shop.occupied && !shop.archivedAt).length,
    vacant: shops.filter((shop) => !shop.occupied && !shop.archivedAt).length,
    unknownExpenseDates: scopedExpenses.filter(
      (expense) => !expense.date || !validDate(expense.date),
    ).length,
    scopeId: shopId,
  };
}
export type RentReport = ReturnType<typeof buildRentReport>;

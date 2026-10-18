import type { RentAllocation, RentReceipt, Shop } from "../types/shop";
import {
  calendarMonthDifference,
  supportedCalendarDate,
} from "../utils/calendar";
import {
  periodRentCharge,
  kabulDate,
  rentalPeriod,
  rentDueDate,
  validDate,
} from "./rentSchedule";

export type RentPeriodBalance = {
  date: string;
  charge: number;
  paid: number;
  due: number;
  prepaidApplied: number;
  fixedPaid: number;
};

export function ledgerStartDate(shop: Shop, asOf = kabulDate()): string {
  const calendar = shop.rentCalendar ?? "gregorian";
  const requested =
    shop.rentLedgerStartDate ??
    (shop.rentCalendar
      ? shop.startDate
      : (shop.prepaidRent?.startDate ?? shop.openingRentPeriod ?? asOf));
  return (
    rentalPeriod(
      shop.startDate,
      requested < shop.startDate ? shop.startDate : requested,
      calendar,
    ).dueDate ?? shop.startDate
  );
}

function total(values: number[]) {
  const result = values.reduce((sum, value) => sum + BigInt(value), 0n);
  if (result > BigInt(Number.MAX_SAFE_INTEGER))
    throw new RangeError(
      "Rent total exceeds the supported whole-afghani range.",
    );
  return Number(result);
}

/** Replays immutable receipts and issued charges in date order, without writes. */
export function rentAccount(shop: Shop, asOf = kabulDate()) {
  const calendar = shop.rentCalendar ?? "gregorian";
  const trackingStart = ledgerStartDate(shop, asOf);
  const trackingOffset = Math.max(
    0,
    calendarMonthDifference(shop.startDate, trackingStart, calendar),
  );
  // Archiving hides a record and freezes future accrual; the current invoice and
  // all historical charges remain intact. Ending a tenancy explicitly prorates.
  const archivedDate = shop.archivedAt
    ? kabulDate(new Date(shop.archivedAt))
    : undefined;
  const cutoff = [asOf, shop.tenancyEndDate, archivedDate]
    .filter((d): d is string => !!d)
    .sort()[0];
  const current = rentalPeriod(shop.startDate, cutoff, calendar);
  const plan =
    (shop.occupied || shop.tenancyEndDate) && shop.rentalType === "prepaid"
      ? shop.prepaidRent
      : undefined;
  const advanceOffset = plan
    ? Math.max(
        0,
        calendarMonthDifference(shop.startDate, plan.startDate, calendar),
      )
    : trackingOffset;
  // Consume earlier prepaid months without inventing unknown historical cash arrears.
  const firstOffset = Math.min(trackingOffset, advanceOffset);
  const fixedMap: Record<string, number> = {};
  const legacy = plan ? shop.prepaidPayments : shop.rentPayments;
  for (const [date, amount] of Object.entries(legacy ?? {})) {
    if (!validDate(date) || !Number.isSafeInteger(amount) || amount < 0)
      continue;
    const due = rentalPeriod(shop.startDate, date, calendar).dueDate;
    if (due) fixedMap[due] = (fixedMap[due] ?? 0) + amount;
  }
  const openingPeriod = shop.openingRentPeriod ?? current.dueDate;
  if (!plan && openingPeriod && shop.paid > 0)
    fixedMap[openingPeriod] = (fixedMap[openingPeriod] ?? 0) + shop.paid;
  const rows: (RentPeriodBalance & { tracked: boolean; offset: number })[] = [];
  for (
    let offset = firstOffset;
    offset <=
    (shop.occupied || shop.tenancyEndDate || shop.archivedAt
      ? current.offset
      : -1);
    offset++
  ) {
    const date = rentDueDate(shop.startDate, offset, calendar);
    const charge = periodRentCharge(shop, date);
    const fixedPaid = Math.min(charge, fixedMap[date] ?? 0);
    rows.push({
      date,
      charge,
      fixedPaid,
      paid: fixedPaid,
      due: charge - fixedPaid,
      prepaidApplied: 0,
      tracked: offset >= trackingOffset,
      offset,
    });
  }
  const receiptIds = new Set<string>();
  const receipts = (shop.rentReceipts ?? [])
    .filter((receipt) => {
      if (
        receiptIds.has(receipt.id) ||
        receipt.reversedAt ||
        receipt.date > asOf ||
        !validDate(receipt.date) ||
        !Number.isSafeInteger(receipt.amount) ||
        receipt.amount <= 0
      )
        return false;
      receiptIds.add(receipt.id);
      return true;
    })
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));
  const allocations: Record<string, RentAllocation[]> = {};
  const funds: { id: string; remaining: number }[] = [];
  const events = [
    ...new Set([
      ...rows.map((row) => row.date),
      ...receipts.map((receipt) => receipt.date),
      ...(plan && plan.startDate <= asOf ? [plan.startDate] : []),
    ]),
  ].sort();
  let prepaidRemaining = plan?.amount ?? 0;
  let opened = 0,
    prepaidCursor = 0,
    cashCursor = 0,
    fundCursor = 0,
    receiptCursor = 0;
  const spendCash = () => {
    while (cashCursor < opened && fundCursor < funds.length) {
      const row = rows[cashCursor];
      const fund = funds[fundCursor];
      if (!row.tracked || row.due === 0) {
        cashCursor++;
        continue;
      }
      if (fund.remaining === 0) {
        fundCursor++;
        continue;
      }
      const amount = Math.min(fund.remaining, row.due);
      row.due -= amount;
      row.paid += amount;
      fund.remaining -= amount;
      (allocations[fund.id] ??= []).push({ period: row.date, amount });
    }
  };
  for (const date of events) {
    while (opened < rows.length && rows[opened].date === date) {
      const row = rows[opened++];
      const excess = Math.max(0, (fixedMap[row.date] ?? 0) - row.charge);
      if (excess) funds.push({ id: `opening:${row.date}`, remaining: excess });
    }
    if (plan && date >= plan.startDate) {
      while (prepaidCursor < opened && prepaidRemaining > 0) {
        const row = rows[prepaidCursor];
        if (row.offset < advanceOffset || row.due === 0) {
          prepaidCursor++;
          continue;
        }
        const amount = Math.min(prepaidRemaining, row.due);
        row.due -= amount;
        row.paid += amount;
        row.prepaidApplied += amount;
        prepaidRemaining -= amount;
      }
    }
    spendCash();
    while (
      receiptCursor < receipts.length &&
      receipts[receiptCursor].date === date
    ) {
      const receipt = receipts[receiptCursor++];
      funds.push({ id: receipt.id, remaining: receipt.amount });
      spendCash();
    }
  }
  const periods = rows
    .filter((row) => row.tracked)
    .map(({ tracked, offset, ...row }) => row);
  const currentPeriod = periods.find((row) => row.date === current.dueDate);
  const arrears = total(
    periods.filter((row) => row.date !== current.dueDate).map((row) => row.due),
  );
  return {
    periods,
    trackingStart,
    currentPeriod,
    arrears,
    outstanding: total(periods.map((row) => row.due)),
    advanceBalance: total(funds.map((fund) => fund.remaining)),
    allocations,
    advanceByReceipt: Object.fromEntries(
      funds.map((fund) => [fund.id, fund.remaining]),
    ),
    prepaidPeriods: rows
      .filter((row) => row.prepaidApplied > 0)
      .map(({ tracked, offset, ...row }) => row),
    prepaidApplied: (plan?.amount ?? 0) - prepaidRemaining,
    prepaidRemaining,
    nextDueDate: current.nextDueDate,
  };
}

export type ReceiptResult =
  { ok: true; duplicate: boolean; shop: Shop } | { ok: false; error: string };

/** Shared by preview and the store's single atomic update. */
export function receiveRent(
  shop: Shop,
  receipt: RentReceipt,
  today = kabulDate(),
): ReceiptResult {
  const previous = (shop.rentReceipts ?? []).find(
    (previous) => previous.id === receipt.id,
  );
  if (previous)
    return previous.amount === receipt.amount &&
      previous.date === receipt.date &&
      previous.method === receipt.method &&
      (previous.note ?? "") === (receipt.note ?? "")
      ? { ok: true, duplicate: true, shop }
      : {
          ok: false,
          error:
            "This payment was already saved with different details. Start a new payment.",
        };
  if (!shop.occupied && !shop.tenancyEndDate)
    return {
      ok: false,
      error: "This shop is vacant. Start a tenancy before collecting rent.",
    };
  if (
    !receipt.id ||
    !Number.isSafeInteger(receipt.amount) ||
    receipt.amount <= 0
  )
    return { ok: false, error: "Enter a positive whole-AFN payment amount." };
  if (!supportedCalendarDate(receipt.date, shop.rentCalendar ?? "gregorian"))
    return { ok: false, error: "Enter a valid date in the selected calendar." };
  if (receipt.date > today)
    return { ok: false, error: "Payment date cannot be in the future." };
  const base: Shop = {
    ...shop,
    rentCalendar: shop.rentCalendar ?? "gregorian",
    rentLedgerStartDate: ledgerStartDate(shop, today),
    openingRentPeriod:
      shop.openingRentPeriod ??
      rentalPeriod(shop.startDate, today, shop.rentCalendar).dueDate ??
      shop.startDate,
  };
  const next = {
    ...base,
    rentReceipts: [...(base.rentReceipts ?? []), receipt],
  };
  try {
    rentAccount(next, today);
  } catch {
    return {
      ok: false,
      error: "Rent total exceeds the supported whole-afghani range.",
    };
  }
  return { ok: true, duplicate: false, shop: next };
}

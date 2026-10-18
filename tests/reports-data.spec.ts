import { expect, test } from "@playwright/test";
import { initialShops } from "../src/data/shops";
import { buildRentReport, reportPercent } from "../src/domain/reports";
import { reportCsv } from "../src/utils/reports/csv";
import type { Shop } from "../src/types/shop";
import type { Expense } from "../src/types/expense";
import { parseCalendarDate } from "../src/utils/calendar";

const fixture = (changes: Partial<Shop> = {}): Shop => ({
  ...initialShops[0],
  rent: 1000,
  paid: 0,
  startDate: "2026-09-01",
  rentCalendar: "gregorian",
  rentLedgerStartDate: "2026-09-01",
  openingRentPeriod: "2026-09-01",
  ...changes,
});
const options = {
  date: "2026-10-17",
  calendar: "gregorian" as const,
  mode: "monthly" as const,
  today: "2026-10-17",
};
const expense = (amount: number, changes: Partial<Expense> = {}): Expense => ({
  amount,
  category: "Repairs",
  description: "Repair",
  date: "2026-10-17",
  method: "Cash",
  ...changes,
});
const paidShop = () =>
  fixture({
    rentReceipts: [
      { id: "cash", amount: 400, date: options.today, method: "Cash" },
      { id: "bank", amount: 250, date: options.today, method: "Other" },
    ],
    rentPayments: { "2026-10-01": 200 },
    rentTransactions: [
      {
        id: "cash",
        receiptId: "cash",
        amount: 400,
        date: options.today,
        period: "2026-09-01",
        calendar: "gregorian",
        kind: "cash",
      },
      {
        id: "credit",
        amount: 200,
        date: options.today,
        period: "2026-10-01",
        calendar: "gregorian",
        kind: "credit",
      },
    ],
  });

test("monthly reports reconcile partial receipts, old debt, noncash credits and paid/unpaid expenses", () => {
  const result = buildRentReport(
    [paidShop()],
    [
      expense(100),
      expense(50, { method: "Bank Transfer" }),
      expense(75, { method: "Credit" }),
    ],
    options,
  );
  expect(result).toMatchObject({
    expected: 1000n,
    settled: 200n,
    due: 800n,
    arrears: 350n,
    outstanding: 1150n,
    cash: 400n,
    other: 250n,
    received: 650n,
    expenses: 225n,
    spent: 150n,
    unpaidExpenses: 75n,
    net: 500n,
    credits: 200n,
    percent: 20,
  });
  expect(result.categories).toEqual([{ label: "Repairs", value: 225n }]);
  expect(result.shops[0]).toMatchObject({ received: 650n, status: "Partial" });
});

test("past-month coverage includes late payments while incoming money retains its real receipt date", () => {
  const result = buildRentReport([paidShop()], [], {
    ...options,
    date: "2026-09-15",
  });
  expect(result).toMatchObject({
    expected: 1000n,
    settled: 650n,
    received: 0n,
    outstanding: 350n,
    credits: 0n,
  });
});

test("legacy opening balances appear once and unknown history never becomes twelve copies of current rent", () => {
  const shop = fixture({
    startDate: "2024-01-01",
    rentCalendar: undefined,
    rentLedgerStartDate: undefined,
    openingRentPeriod: undefined,
    rent: 25000,
    paid: 15000,
  });
  const result = buildRentReport([shop], [], { ...options, mode: "yearly" });
  expect(result).toMatchObject({
    expected: 25000n,
    settled: 15000n,
    received: 0n,
    outstanding: 10000n,
  });
  expect(result.series.filter((point) => point.hasData)).toHaveLength(1);
  expect(
    buildRentReport([shop], [], {
      ...options,
      date: "2025-01-01",
      mode: "yearly",
    }),
  ).toMatchObject({ expected: 0n, received: 0n, hasData: false });
});

test("prepaid coverage is rent settlement and never new money received", () => {
  const shop = fixture({
    startDate: "2026-08-01",
    rentLedgerStartDate: "2026-08-01",
    rentalType: "prepaid",
    prepaidRent: { amount: 4000, monthlyRent: 1000, startDate: "2026-08-01" },
  });
  expect(buildRentReport([shop], [expense(100)], options)).toMatchObject({
    expected: 1000n,
    settled: 1000n,
    prepaid: 1000n,
    received: 0n,
    net: -100n,
  });
});

test("scope filters preserve unassigned expenses only for All Shops and retain receipts from vacant shops", () => {
  const shops = [
    paidShop(),
    fixture({
      id: 2,
      occupied: false,
      rentReceipts: [
        { id: "vacant", date: options.today, method: "Cash", amount: 100 },
      ],
    }),
    fixture({ id: 3, rentCalendar: "shamsi" }),
  ];
  const expenses = [
    expense(10, { shopId: 1 }),
    expense(20),
    expense(30, { type: "Personal Expense" }),
    expense(999, { shopId: 3 }),
  ];
  expect(buildRentReport(shops, expenses, options)).toMatchObject({
    expected: 1000n,
    received: 750n,
    expenses: 60n,
    occupied: 1,
    vacant: 1,
  });
  expect(
    buildRentReport(shops, expenses, { ...options, shopId: 1 }),
  ).toMatchObject({ expected: 1000n, received: 650n, expenses: 10n });
});

test("Shamsi and Gregorian year ranges use actual calendar boundaries without projecting future income", () => {
  const start = parseCalendarDate("1405-06-01", "shamsi")!;
  const shop = fixture({
    rentCalendar: "shamsi",
    startDate: start,
    rentLedgerStartDate: start,
    rentReceipts: [
      { id: "sunbula", date: "2026-09-22", method: "Cash", amount: 200 },
      { id: "mizan", date: "2026-09-23", method: "Cash", amount: 300 },
    ],
  });
  const result = buildRentReport([shop], [], {
    ...options,
    calendar: "shamsi",
  });
  expect(result.start).toBe("2026-09-23");
  expect(result.end).toBe("2026-10-23");
  expect(result.received).toBe(300n);
  const year = buildRentReport([shop], [], {
    ...options,
    calendar: "shamsi",
    mode: "yearly",
  });
  expect(year.series).toHaveLength(12);
  expect(year.received).toBe(500n);
  expect(
    year.series
      .filter((point) => point.future)
      .every((point) => point.expected === 0n && point.received === 0n),
  ).toBe(true);
});

test("missing and future expense dates are excluded, categorized totals agree, and negative net is retained", () => {
  const result = buildRentReport(
    [fixture()],
    [
      expense(100),
      expense(50, { category: "Utilities" }),
      expense(600, { date: undefined }),
      expense(900, { date: "2026-10-31" }),
    ],
    options,
  );
  expect(result).toMatchObject({
    expenses: 150n,
    net: -150n,
    unknownExpenseDates: 1,
  });
  expect(result.categories.reduce((sum, row) => sum + row.value, 0n)).toBe(
    result.expenses,
  );
});

test("CSV uses actual filtered values, retains Pashto and escapes formula-like shop names", () => {
  const result = buildRentReport(
    [paidShop(), fixture({ id: 2, name: '=HYPERLINK("bad")', keeper: "احمد" })],
    [expense(100)],
    options,
  );
  const csv = reportCsv(result, (key) => key, "ps");
  expect(csv.startsWith("\uFEFF")).toBe(true);
  expect(csv).toContain('"Payments Received","650"');
  expect(csv).toContain('"\'=HYPERLINK(""bad"")"');
  expect(csv).toContain("احمد");
  expect(csv).not.toContain("268000");
  expect(reportPercent(1n, 3n)).toBe(33.33);
  expect(reportPercent(0n, 0n)).toBe(0);
});

test("the first supported Shamsi month does not request invalid earlier chart months", () => {
  const first = parseCalendarDate("0001-01-01", "shamsi")!;
  const shop = fixture({
    rentCalendar: "shamsi",
    startDate: first,
    rentLedgerStartDate: first,
    openingRentPeriod: first,
  });
  const report = buildRentReport([shop], [], {
    ...options,
    date: first,
    today: first,
    calendar: "shamsi",
  });
  expect(report.expected).toBe(1000n);
  expect(report.previous.hasData).toBe(false);
  expect(report.series).toHaveLength(1);
});

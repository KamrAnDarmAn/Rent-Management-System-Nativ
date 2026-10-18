import { expect, test } from "@playwright/test";
import { initialShops } from "../src/data/shops";
import { rentCollections } from "../src/domain/rentCollections";
import { rentAccount, receiveRent } from "../src/domain/rentAccount";
import type { RentReceipt, RentTransaction, Shop } from "../src/types/shop";
import { calendarMonthStart, addCalendarMonths } from "../src/utils/calendar";
import { money } from "../src/utils/format";

const fixture = (changes: Partial<Shop> = {}): Shop => ({
  ...initialShops[0],
  rent: 1000,
  paid: 0,
  credit: 5000,
  startDate: "2026-09-01",
  rentCalendar: "gregorian",
  rentLedgerStartDate: "2026-09-01",
  openingRentPeriod: "2026-09-01",
  ...changes,
});
const receipt = (
  id: string,
  amount: number,
  date = "2026-10-17",
  method: RentReceipt["method"] = "Cash",
): RentReceipt => ({ id, amount, date, method });
const transaction = (
  id: string,
  amount: number,
  changes: Partial<RentTransaction> = {},
): RentTransaction => ({
  id,
  amount,
  kind: "cash",
  date: "2026-10-17",
  period: "2026-09-01",
  calendar: "gregorian",
  ...changes,
});
const october = (shops: Shop[]) =>
  rentCollections(shops, "2026-10-01", "2026-11-01", "2026-10-17");

test("KPIs count repeated partial payments even when they settle old rent", () => {
  let shop = fixture();
  for (const payment of [
    receipt("first", 400),
    receipt("second", 250, "2026-10-17", "Other"),
  ]) {
    const result = receiveRent(shop, payment, "2026-10-17");
    expect(result.ok).toBe(true);
    if (result.ok) shop = result.shop;
  }
  expect(october([shop])).toEqual({ cash: 400n, other: 250n, total: 650n });
  expect(rentAccount(shop, "2026-10-17")).toMatchObject({
    outstanding: 1350,
    currentPeriod: { paid: 0, due: 1000 },
  });
});

test("receipt history mirrors, duplicate IDs, credit and opening balances cannot inflate collections", () => {
  const first = receipt("first", 400);
  const shop = fixture({
    paid: 15000,
    rentReceipts: [first, first, receipt("other", 250, "2026-10-17", "Other")],
    rentTransactions: [
      transaction("first", 400, { receiptId: "first" }),
      transaction("other", 250, { receiptId: "other" }),
      transaction("first", 400),
      transaction("old-cash", 100),
      transaction("old-cash", 100),
      transaction("construction", 200, { kind: "credit" }),
    ],
  });
  expect(october([shop])).toEqual({ cash: 500n, other: 250n, total: 750n });
});

test("receipt dates respect Shamsi month boundaries, backdating and today's cutoff", () => {
  const shop = fixture({
    rentReceipts: [
      receipt("before", 100, "2026-09-22"),
      receipt("first-day", 200, "2026-09-23"),
      receipt("last-day", 300, "2026-10-22"),
      receipt("after", 400, "2026-10-23"),
    ],
  });
  const start = calendarMonthStart("2026-10-17", "shamsi");
  const end = addCalendarMonths(start, 1, "shamsi");
  expect(rentCollections([shop], start, end, "2026-10-23").total).toBe(500n);
  expect(rentCollections([shop], start, end, "2026-10-17").total).toBe(200n);
  expect(october([shop]).total).toBe(0n);
});

test("advance receipts count once and automatic deductions never become new income", () => {
  const result = receiveRent(fixture(), receipt("advance", 2500), "2026-10-17");
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(october([result.shop]).total).toBe(2500n);
  expect(rentAccount(result.shop, "2026-11-01").currentPeriod).toMatchObject({
    paid: 500,
    due: 500,
  });
  expect(
    rentCollections([result.shop], "2026-11-01", "2026-12-01", "2026-11-17")
      .total,
  ).toBe(0n);
  expect(
    october([
      fixture({
        rentalType: "prepaid",
        prepaidRent: {
          amount: 5000,
          monthlyRent: 1000,
          startDate: "2026-09-01",
        },
      }),
    ]).total,
  ).toBe(0n);
});

test("separate shops are summed exactly even beyond the safe-integer range", () => {
  const shop = fixture({
    rentReceipts: [receipt("same-id", Number.MAX_SAFE_INTEGER)],
  });
  const total = october([shop, { ...shop, id: 2 }]).total;
  expect(total).toBe(18014398509481982n);
  expect(money(total)).toBe("AFN 18,014,398,509,481,982");
  expect(money(500)).toBe("AFN 500");
});

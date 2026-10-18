import { connectTestLedger } from "./support/database";
import { expect, test } from "@playwright/test";
import { initialShops } from "../src/data/shops";
import {
  receiveRent,
  rentAccount as buildRentAccount,
} from "../src/domain/rentAccount";
import { kabulDate, rentPosition } from "../src/domain/rent";
import { useLedger } from "../src/store/ledgerStore";
import type { RentReceipt, Shop } from "../src/types/shop";
import { parseCalendarDate } from "../src/utils/calendar";
const rentAccount = (shop: Shop, asOf = "2026-10-17") =>
  buildRentAccount(shop, asOf);
const fixture = (changes: Partial<Shop> = {}): Shop => ({
  ...initialShops[0],
  id: 77,
  number: "77",
  rent: 1000,
  paid: 0,
  credit: 5000,
  startDate: "2026-08-01",
  rentCalendar: "gregorian",
  rentLedgerStartDate: "2026-08-01",
  openingRentPeriod: "2026-08-01",
  rentalType: "monthly",
  rentPayments: {},
  ...changes,
});
const receipt = (
  id: string,
  amount: number,
  date = "2026-10-17",
): RentReceipt => ({ id, amount, date, method: "Cash" });
function receive(shop: Shop, payment: RentReceipt, today = "2026-10-17") {
  const result = receiveRent(shop, payment, today);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error);
  return result.shop;
}
function conserved(shop: Shop, asOf = "2026-10-17") {
  const account = rentAccount(shop, asOf);
  for (const payment of shop.rentReceipts ?? []) {
    if (payment.date > asOf) continue;
    const applied = (account.allocations[payment.id] ?? []).reduce(
      (sum, row) => sum + BigInt(row.amount),
      0n,
    );
    expect(applied + BigInt(account.advanceByReceipt[payment.id] ?? 0)).toBe(
      BigInt(payment.amount),
    );
  }
  expect(
    account.periods.every(
      (row) =>
        row.due >= 0 && row.paid >= 0 && row.paid + row.due === row.charge,
    ),
  ).toBe(true);
}
test("mid-month cash settles old rent first, across multiple months and partial installments", () => {
  let shop = receive(fixture(), receipt("one", 1500, "2026-09-15"));
  let account = rentAccount(shop, "2026-09-15");
  expect(account.allocations.one).toEqual([
    { period: "2026-08-01", amount: 1000 },
    { period: "2026-09-01", amount: 500 },
  ]);
  expect(account.outstanding).toBe(500);
  shop = receive(shop, receipt("two", 600));
  account = rentAccount(shop);
  expect(account.allocations.two).toEqual([
    { period: "2026-09-01", amount: 500 },
    { period: "2026-10-01", amount: 100 },
  ]);
  expect(account.arrears).toBe(0);
  expect(account.currentPeriod).toMatchObject({ paid: 100, due: 900 });
  conserved(shop);
});
test("paid previous months stay paid and a current-month partial payment leaves only the remainder", () => {
  const shop = receive(
    fixture({ rentPayments: { "2026-08-01": 1000, "2026-09-01": 1000 } }),
    receipt("partial", 300),
  );
  const account = rentAccount(shop);
  expect(account.allocations.partial).toEqual([
    { period: "2026-10-01", amount: 300 },
  ]);
  expect(account.currentPeriod).toMatchObject({ paid: 300, due: 700 });
  expect(account.outstanding).toBe(700);
  conserved(shop);
});
test("any excess becomes advance, is used once on the next due date, and lowers the next cash payment", () => {
  let shop = receive(
    fixture({
      startDate: "2026-10-01",
      rentLedgerStartDate: "2026-10-01",
      openingRentPeriod: "2026-10-01",
    }),
    receipt("full", 1000, "2026-10-05"),
  );
  shop = receive(shop, receipt("extra", 300, "2026-10-10"));
  expect(rentAccount(shop).advanceBalance).toBe(300);
  expect(rentAccount(shop, "2026-11-01").currentPeriod).toMatchObject({
    paid: 300,
    due: 700,
  });
  shop = receive(shop, receipt("remaining", 700, "2026-11-15"), "2026-11-15");
  expect(rentAccount(shop, "2026-11-15")).toMatchObject({
    outstanding: 0,
    advanceBalance: 0,
  });
  expect(rentAccount(shop, "2026-12-01").currentPeriod).toMatchObject({
    paid: 0,
    due: 1000,
  });
  conserved(shop, "2026-11-15");
});
test("large cash clears every old charge and retains the full unused amount", () => {
  const shop = receive(fixture(), receipt("large", 10000));
  expect(rentAccount(shop)).toMatchObject({
    outstanding: 0,
    advanceBalance: 7000,
  });
  expect(rentAccount(shop, "2027-05-01")).toMatchObject({
    outstanding: 0,
    advanceBalance: 0,
  });
  expect(rentAccount(shop, "2027-06-01").outstanding).toBe(1000);
  conserved(shop, "2027-05-01");
});
test("backdated receipts replay chronologically without losing or double counting cash", () => {
  let shop = receive(fixture(), receipt("later", 2000));
  shop = receive(shop, receipt("earlier", 600, "2026-09-10"));
  const account = rentAccount(shop);
  expect(account.allocations.earlier).toEqual([
    { period: "2026-08-01", amount: 600 },
  ]);
  expect(account.allocations.later).toEqual([
    { period: "2026-08-01", amount: 400 },
    { period: "2026-09-01", amount: 1000 },
    { period: "2026-10-01", amount: 600 },
  ]);
  expect(account.outstanding).toBe(400);
  expect(rentAccount(shop, "2026-09-20").outstanding).toBe(1400);
  conserved(shop);
});
test("prepaid rent is respected, old debt is settled first, and new cash is not charged twice", () => {
  const shop = receive(
    fixture({
      startDate: "2026-06-01",
      rentLedgerStartDate: "2026-06-01",
      openingRentPeriod: "2026-06-01",
      rentalType: "prepaid",
      prepaidRent: {
        amount: 2000,
        monthlyRent: 1000,
        startDate: "2026-08-01",
        calendar: "gregorian",
      },
    }),
    receipt("prepaid-extra", 2500, "2026-09-15"),
  );
  const account = rentAccount(shop, "2026-09-15");
  expect(account.allocations["prepaid-extra"]).toEqual([
    { period: "2026-06-01", amount: 1000 },
    { period: "2026-07-01", amount: 1000 },
  ]);
  expect(account).toMatchObject({
    outstanding: 0,
    advanceBalance: 500,
    prepaidApplied: 2000,
    prepaidRemaining: 0,
  });
  expect(rentAccount(shop, "2026-10-01").currentPeriod).toMatchObject({
    paid: 500,
    due: 500,
  });
  conserved(shop, "2026-10-01");
});
test("Shamsi first-month proration and the 1st are honored when allocating older payments", () => {
  const iso = (value: string) => parseCalendarDate(value, "shamsi")!;
  const start = iso("1405-06-26"); // Six remaining days in the 31-day month.
  const shop = receive(
    fixture({
      rent: 3100,
      startDate: start,
      rentLedgerStartDate: start,
      openingRentPeriod: start,
      rentCalendar: "shamsi",
    }),
    receipt("shamsi", 1600),
  );
  expect(rentAccount(shop).allocations.shamsi).toEqual([
    { period: start, amount: 600 },
    { period: iso("1405-07-01"), amount: 1000 },
  ]);
  expect(rentAccount(shop).currentPeriod).toMatchObject({
    paid: 1000,
    due: 2100,
  });
  conserved(shop);
});
test("unknown legacy years are not invented as debt and the opening partial amount is kept", () => {
  let shop = fixture({
    rentCalendar: undefined,
    rentLedgerStartDate: undefined,
    openingRentPeriod: undefined,
    startDate: "2024-01-01",
    rent: 25000,
    paid: 15000,
  });
  expect(rentAccount(shop).outstanding).toBe(10000);
  shop = receive(shop, receipt("legacy", 6000));
  expect(rentAccount(shop)).toMatchObject({
    outstanding: 4000,
    trackingStart: "2026-10-01",
  });
  expect(rentAccount(shop, "2026-11-01").outstanding).toBe(29000);
  conserved(shop);
});
test("the same receipt is idempotent and conflicting, invalid and future inputs do not mutate data", () => {
  const original = fixture();
  const payment = receipt("repeat", 400);
  const once = receive(original, payment);
  const twice = receiveRent(once, payment, "2026-10-17");
  expect(twice).toMatchObject({ ok: true, duplicate: true });
  if (twice.ok) expect(twice.shop).toBe(once);
  expect(receiveRent(once, { ...payment, amount: 500 }, "2026-10-17").ok).toBe(
    false,
  );
  for (const amount of [-1, 0, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])
    expect(receiveRent(original, receipt("bad", amount), "2026-10-17").ok).toBe(
      false,
    );
  expect(
    receiveRent(original, receipt("future", 1, "2026-10-18"), "2026-10-17").ok,
  ).toBe(false);
  expect(original.rentReceipts).toBeUndefined();
  conserved(once);
});
test("safe-integer boundaries are exact and a balance overflow is rejected", () => {
  let shop = receive(
    fixture({
      rent: 1,
      startDate: "2026-10-01",
      rentLedgerStartDate: "2026-10-01",
      openingRentPeriod: "2026-10-01",
    }),
    receipt("maximum", Number.MAX_SAFE_INTEGER),
  );
  expect(rentAccount(shop).advanceBalance).toBe(Number.MAX_SAFE_INTEGER - 1);
  shop = receive(shop, receipt("one-more", 1));
  expect(rentAccount(shop).advanceBalance).toBe(Number.MAX_SAFE_INTEGER);
  expect(receiveRent(shop, receipt("overflow", 1), "2026-10-17").ok).toBe(
    false,
  );
  conserved(shop);
});
test("the store commits one receipt and one history entry even if Save is triggered twice", async () => {
  useLedger.getState().reset();
  await useLedger.getState().addShop(fixture());
  const payment = receipt("store-repeat", 1700, kabulDate());
  const first = await useLedger.getState().collectRent(77, payment);
  const second = await useLedger.getState().collectRent(77, payment);
  expect(first.ok).toBe(true);
  expect(second).toMatchObject({ ok: true, duplicate: true });
  const shop = useLedger.getState().shops.find((shop) => shop.id === 77)!;
  expect(shop.rentReceipts).toHaveLength(1);
  expect(shop.rentTransactions).toHaveLength(1);
  conserved(shop);
});
test("construction credit sees the remaining rent after mid-month cash and cannot over-settle it", async () => {
  useLedger.getState().reset();
  await useLedger.getState().addShop(
    fixture({
      startDate: kabulDate(),
      rentLedgerStartDate: kabulDate(),
      openingRentPeriod: kabulDate(),
    }),
  );
  expect(
    (
      await useLedger
        .getState()
        .collectRent(77, receipt("cash-before-credit", 300, kabulDate()))
    ).ok,
  ).toBe(true);
  await useLedger.getState().applyCredit(77, 800, kabulDate());
  let shop = useLedger.getState().shops.find((shop) => shop.id === 77)!;
  expect(shop.credit).toBe(5000);
  expect(buildRentAccount(shop).outstanding).toBe(700);
  await useLedger.getState().applyCredit(77, 700, kabulDate());
  shop = useLedger.getState().shops.find((shop) => shop.id === 77)!;
  expect(shop.credit).toBe(4300);
  expect(buildRentAccount(shop).outstanding).toBe(0);
  expect(buildRentAccount(shop).advanceBalance).toBe(0);
  expect(shop.rentReceipts).toHaveLength(1);
  expect(shop.rentTransactions).toHaveLength(2);
  conserved(shop, kabulDate());
});
test("viewing an older month includes late settlements without mixing their cash receipt dates", () => {
  const shop = receive(fixture(), receipt("late", 1500));
  expect(rentPosition(shop, "2026-08-31").due).toBe(1000);
  expect(rentPosition(shop, "2026-08-31", "2026-10-17")).toMatchObject({
    paid: 1000,
    due: 0,
    totalDue: 0,
  });
  expect(rentPosition(shop, "2026-09-30", "2026-10-17")).toMatchObject({
    paid: 500,
    due: 500,
    totalDue: 500,
  });
  expect(shop.rentReceipts?.[0].date).toBe("2026-10-17");
  conserved(shop);
});
test("construction credit can settle an older prepaid tenancy month before its advance begins", async () => {
  const today = kabulDate();
  const previous = `${Number(today.slice(0, 4)) - 1}${today.slice(4, 7)}-01`;
  useLedger.getState().reset();
  await useLedger.getState().addShop(
    fixture({
      startDate: previous,
      rentLedgerStartDate: previous,
      openingRentPeriod: previous,
      rentalType: "prepaid",
      prepaidRent: { amount: 1000, monthlyRent: 1000, startDate: today },
    }),
  );
  await useLedger.getState().applyCredit(77, 400, previous);
  const shop = useLedger.getState().shops.find((shop) => shop.id === 77)!;
  expect(shop.credit).toBe(4600);
  expect(
    buildRentAccount(shop).periods.find((row) => row.date === previous),
  ).toMatchObject({ paid: 400, due: 600 });
  expect(shop.rentTransactions?.[0]).toMatchObject({
    kind: "credit",
    amount: 400,
    period: previous,
  });
});

test.beforeEach(async () => {
  await connectTestLedger();
});

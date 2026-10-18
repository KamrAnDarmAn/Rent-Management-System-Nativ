import { expect, test } from "@playwright/test";
import {
  kabulDate,
  prepaidSummary,
  rentDueDate,
  rentPosition,
  validDate,
} from "../src/domain/rent";
import { type Shop } from "../src/types/shop";

const plan = { amount: 4000, monthlyRent: 1000, startDate: "2026-08-01" };

test("4000 AFN covers four 1000 AFN installments without counting new cash income", () => {
  expect(prepaidSummary(plan, "2026-10-17")).toMatchObject({
    fullMonths: 4,
    partialAmount: 0,
    applied: 3000,
    remaining: 1000,
    coveredPayments: 3,
    remainingFullMonths: 1,
    lastCoveredDate: "2026-11-01",
    firstCashDueDate: "2026-12-01",
    currentApplied: 1000,
  });
  expect(prepaidSummary(plan, "2026-07-31")).toMatchObject({
    applied: 0,
    remaining: 4000,
    elapsed: 0,
  });
  expect(prepaidSummary(plan, "2026-08-01")).toMatchObject({
    applied: 1000,
    remaining: 3000,
  });
  expect(prepaidSummary(plan, "2026-11-01")).toMatchObject({
    applied: 4000,
    remaining: 0,
    currentApplied: 1000,
  });
  expect(prepaidSummary(plan, "2030-01-01")).toMatchObject({
    applied: 4000,
    remaining: 0,
    currentApplied: 0,
    nextApplication: null,
  });
});

test("partial final installment and advances smaller than rent remain exact", () => {
  expect(prepaidSummary({ ...plan, amount: 4500 }, "2026-12-01")).toMatchObject(
    {
      fullMonths: 4,
      partialAmount: 500,
      applied: 4500,
      currentApplied: 500,
      firstCashDueDate: "2026-12-01",
    },
  );
  expect(prepaidSummary({ ...plan, amount: 400 }, "2026-08-01")).toMatchObject({
    fullMonths: 0,
    partialAmount: 400,
    currentApplied: 400,
    remaining: 0,
    firstCashDueDate: "2026-08-01",
  });
});

test("monthly anniversaries clamp short months without drifting and respect Kabul midnight", () => {
  expect(rentDueDate("2026-01-31", 1)).toBe("2026-02-28");
  expect(rentDueDate("2026-01-31", 2)).toBe("2026-03-31");
  expect(rentDueDate("2028-01-31", 1)).toBe("2028-02-29");
  expect(
    prepaidSummary({ ...plan, startDate: "2026-01-31" }, "2026-02-27")?.applied,
  ).toBe(1000);
  expect(
    prepaidSummary({ ...plan, startDate: "2026-01-31" }, "2026-02-28")?.applied,
  ).toBe(2000);
  expect(kabulDate(new Date("2026-10-17T19:29:59Z"))).toBe("2026-10-17");
  expect(kabulDate(new Date("2026-10-17T19:30:00Z"))).toBe("2026-10-18");
});

test("invalid dates, unsafe amounts and schedules beyond the supported calendar are rejected", () => {
  expect(validDate("2026-02-30")).toBe(false);
  expect(validDate("2028-02-29")).toBe(true);
  for (const amount of [0, -1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])
    expect(prepaidSummary({ ...plan, amount })).toBeNull();
  expect(prepaidSummary({ ...plan, monthlyRent: 0 })).toBeNull();
  expect(
    prepaidSummary({
      ...plan,
      amount: Number.MAX_SAFE_INTEGER,
      monthlyRent: 1,
    }),
  ).toBeNull();
});

test("cash settlements cannot make prepaid rent charge twice and belong to their rental period", () => {
  const shop: Shop = {
    id: 7,
    number: "07",
    name: "Test",
    keeper: "Test",
    phone: "0700",
    address: "",
    startDate: plan.startDate,
    notes: "",
    rent: 1000,
    paid: 0,
    credit: 6000,
    status: "Unpaid",
    occupied: true,
    image: 0,
    rentalType: "prepaid",
    prepaidRent: { ...plan, amount: 4500 },
  };
  expect(rentPosition(shop, "2026-10-17")).toMatchObject({
    paid: 1000,
    due: 0,
    status: "Paid",
  });
  expect(rentPosition(shop, "2026-12-01")).toMatchObject({
    paid: 500,
    due: 500,
    status: "Partial",
  });
  shop.prepaidPayments = { "2026-12-01": 500 };
  expect(rentPosition(shop, "2026-12-01")).toMatchObject({
    paid: 1000,
    due: 0,
    status: "Paid",
  });
  expect(rentPosition(shop, "2027-01-01")).toMatchObject({
    paid: 0,
    due: 1000,
    status: "Unpaid",
  });
  shop.rentalType = "monthly";
  expect(rentPosition(shop, "2026-10-17")).toMatchObject({
    prepaid: null,
    paid: 0,
    due: 1000,
  });
});

import { connectTestLedger } from "./support/database";
import { expect, test, type Page } from "./support/fixtures";
import {
  firstRentCharge,
  prepaidSummary,
  rentalPeriod,
  rentDueDate,
  rentPosition,
} from "../src/domain/rent";
import { preserveCalendarSettlements } from "../src/domain/shopSchedule";
import { initialShops } from "../src/data/shops";
import { useLedger } from "../src/store/ledgerStore";
import { ps } from "../src/i18n/locales/ps";
import { calendarInputDate, parseCalendarDate } from "../src/utils/calendar";
import type { Shop } from "../src/types/shop";
const iso = (date: string) => parseCalendarDate(date, "shamsi")!;
const fixture = (): Shop => ({
  ...initialShops[0],
  id: 100,
  number: "100",
  rent: 3000,
  paid: 0,
  credit: 5000,
  startDate: iso("1405-07-25"),
  rentCalendar: "shamsi",
  openingRentPeriod: iso("1405-07-25"),
  rentPayments: {},
  rentalType: "monthly",
});
test("Shamsi input accepts local digits, rejects impossible dates and round-trips the actual day", () => {
  expect(parseCalendarDate("۱۴۰۵-۰۷-۲۵", "shamsi")).toBe("2026-10-17");
  expect(parseCalendarDate("١٤٠٥-٠٧-٢٥", "shamsi")).toBe("2026-10-17");
  expect(calendarInputDate("2026-10-17", "shamsi")).toBe("1405-07-25");
  expect(parseCalendarDate("1405-07-31", "shamsi")).toBeNull();
  expect(parseCalendarDate("1404-12-30", "shamsi")).toBeNull();
  expect(parseCalendarDate("1403-12-30", "shamsi")).toBe("2025-03-20");
  expect(parseCalendarDate("2026-02-30", "gregorian")).toBeNull();
});
test("Shamsi recurring rent is due on the 1st and initial days use the actual month length", () => {
  const start = iso("1405-07-25");
  expect(rentDueDate(start, 1, "shamsi")).toBe(iso("1405-08-01"));
  expect(rentalPeriod(start, iso("1405-07-30"), "shamsi").dueDate).toBe(start);
  expect(rentalPeriod(start, iso("1405-08-01"), "shamsi").dueDate).toBe(
    iso("1405-08-01"),
  );
  expect(firstRentCharge(3000, start, "shamsi")).toBe(600);
  expect(firstRentCharge(3100, iso("1405-01-16"), "shamsi")).toBe(1600);
  expect(firstRentCharge(2900, iso("1404-12-28"), "shamsi")).toBe(200);
  expect(firstRentCharge(3000, iso("1403-12-29"), "shamsi")).toBe(200);
  expect(rentDueDate(iso("1404-12-28"), 1, "shamsi")).toBe(iso("1405-01-01"));
  expect(rentPosition(fixture(), "2026-10-16").due).toBe(0);
});
test("prepaid Shamsi rent prorates first month and deducts the next installments on the 1st", () => {
  const plan = {
    amount: 4000,
    monthlyRent: 3000,
    startDate: iso("1405-07-25"),
    calendar: "shamsi" as const,
  };
  expect(prepaidSummary(plan, iso("1405-07-25"))).toMatchObject({
    applied: 600,
    remaining: 3400,
    firstCharge: 600,
    firstCashDueDate: iso("1405-09-01"),
  });
  expect(prepaidSummary(plan, iso("1405-08-01"))).toMatchObject({
    applied: 3600,
    remaining: 400,
    currentApplied: 3000,
  });
  expect(prepaidSummary(plan, iso("1405-09-01"))).toMatchObject({
    applied: 4000,
    remaining: 0,
    currentApplied: 400,
    currentCharge: 3000,
  });
  expect(
    prepaidSummary(
      { ...plan, tenancyStartDate: iso("1405-01-10") },
      plan.startDate,
    ),
  ).toMatchObject({ firstCharge: 3000, applied: 3000, remaining: 1000 });
});
test("partial payments and construction credit stay in their own Shamsi period", async () => {
  useLedger.getState().reset();
  await useLedger.getState().addShop(fixture());
  const period = iso("1405-07-25");
  await useLedger
    .getState()
    .collectMonthly(100, 200, period, "2026-10-17", "Partial");
  await useLedger.getState().applyCredit(100, 400, period);
  const shop = useLedger.getState().shops.find((shop) => shop.id === 100)!;
  expect(rentPosition(shop, period)).toMatchObject({ paid: 600, due: 0 });
  expect(rentPosition(shop, iso("1405-08-01"))).toMatchObject({
    paid: 0,
    due: 3000,
  });
  expect(shop.credit).toBe(4600);
  expect(shop.rentTransactions?.map((tx) => tx.kind)).toEqual([
    "cash",
    "credit",
  ]);
  await useLedger.getState().collectMonthly(100, 1, period);
  expect(
    useLedger.getState().shops.find((shop) => shop.id === 100)!
      .rentTransactions,
  ).toHaveLength(2);
});
test("changing calendars keeps settlement totals and original transaction dates", () => {
  const shop: Shop = {
    ...fixture(),
    rentCalendar: "gregorian",
    rentPayments: { "2026-10-17": 300, "2026-11-17": 500 },
    rentTransactions: [
      {
        id: "old",
        date: "2026-10-20",
        period: "2026-10-17",
        amount: 300,
        kind: "cash",
        calendar: "gregorian",
      },
    ],
  };
  const next = preserveCalendarSettlements(
    shop,
    { rentCalendar: "shamsi" },
    "2026-10-27",
  );
  expect(next.rentPayments).toEqual({
    [iso("1405-08-01")]: 300,
    [iso("1405-09-01")]: 500,
  });
  expect(next.rentTransactions).toEqual(shop.rentTransactions);
  expect(Object.values(next.rentPayments!).reduce((a, b) => a + b, 0)).toBe(
    800,
  );
});
async function chooseCalendar(page: Page, label: string, language: string) {
  await page
    .getByRole("button", {
      name: language === "ps" ? ps[label] : label,
      exact: true,
    })
    .click();
  await page
    .getByRole("menuitem", {
      name: language === "ps" ? ps["Afghan Shamsi"] : "Afghan Shamsi",
      exact: true,
    })
    .click();
}
test("Shamsi prepaid UI deducts prorated and first-of-month charges, then collects the exact remainder", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-17T10:00:00Z") });
  await page.goto("/?screen=shops");
  await page.getByRole("button", { name: /Shop #03 Zahid Mobile/ }).click();
  await page.getByRole("button", { name: "Edit Shop", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Monthly Rent (AFN)", exact: true })
    .fill("3000");
  await page
    .getByRole("textbox", { name: "Start Date", exact: true })
    .fill("2026-10-17");
  await chooseCalendar(page, "Rent Calendar", "en");
  await page.getByRole("button", { name: "Prepaid", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Advance Rent Received (AFN)", exact: true })
    .fill("4000");
  await page
    .getByRole("textbox", { name: "Advance Start Date", exact: true })
    .fill("1405-07-25");
  await page.getByRole("button", { name: "Update Shop", exact: true }).click();
  await page.getByRole("button", { name: "Collect Rent", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Save Payment", exact: true }),
  ).toBeDisabled();
  await page.clock.setSystemTime(new Date("2026-10-23T10:00:00Z"));
  await page.clock.runFor(60001);
  await expect(
    page.getByRole("button", { name: "Save Payment", exact: true }),
  ).toBeDisabled();
  await page.clock.setSystemTime(new Date("2026-11-22T10:00:00Z"));
  await page.clock.runFor(60001);
  const active = page
    .getByTestId("screen-scroll")
    .filter({ has: page.getByText("Current rental period", { exact: true }) });
  await expect(
    active.getByText("AFN 2,600", { exact: true }).first(),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Payment Amount", exact: true })
    .fill("2601");
  await expect(
    active
      .getByText("Rent Advance After Payment", { exact: true })
      .locator(".."),
  ).toContainText("AFN 1");
  await page.getByRole("button", { name: "Save Payment", exact: true }).click();
  await page.getByRole("button", { name: "Collect Rent", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Save Payment", exact: true }),
  ).toBeDisabled();
});
for (const language of ["en", "ps"]) {
  test(`${language}: add Shamsi tenancy, collect partial rent and keep calendar on edit`, async ({
    page,
  }) => {
    const t = (text: string) => (language === "ps" ? (ps[text] ?? text) : text);
    const button = (name: string) =>
      page.getByRole("button", { name: t(name), exact: true });
    const field = (name: string) =>
      page.getByRole("textbox", { name: t(name), exact: true });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.clock.install({ time: new Date("2026-10-17T10:00:00Z") });
    await page.addInitScript(
      (language) =>
        localStorage.setItem(
          "rent-manager-preferences-v1",
          JSON.stringify({ state: { language, theme: "light" }, version: 0 }),
        ),
      language,
    );
    await page.goto("/?screen=add-shop");
    for (const [name, value] of Object.entries({
      "Shop Number": "07",
      "Shop Name": "د احمد دوکان",
      "Shopkeeper Name": "احمد",
      "Phone Number": "0700123456",
      "Monthly Rent (AFN)": "3000",
      "Start Date": "2026-10-17",
    }))
      await field(name).fill(value);
    await chooseCalendar(page, "Rent Calendar", language);
    await expect(field("Start Date")).toHaveValue("1405-07-25");
    await field("Start Date").fill("1405-07-31");
    await button("Save Shop").click();
    await expect(
      page
        .getByText(t("Enter a valid Shamsi date, e.g. 1405-07-25."), {
          exact: true,
        })
        .first(),
    ).toBeVisible();
    await field("Start Date").fill(
      language === "ps" ? "۱۴۰۵-۰۷-۲۵" : "1405-07-25",
    );
    await button("Save Shop").click();
    await page.getByRole("button", { name: /#07.*د احمد دوکان/s }).click();
    await button("Collect Rent").click();
    const collection = page
      .getByTestId("screen-scroll")
      .filter({ has: field("Payment Amount") });
    await expect(
      collection
        .getByText(language === "ps" ? "600 افغانۍ" : "AFN 600", {
          exact: true,
        })
        .first(),
    ).toBeVisible();
    await field("Payment Amount").fill("200");
    await button("Save Payment").click();
    await button("Edit Shop").click();
    await expect(field("Start Date")).toHaveValue("1405-07-25");
    await expect(button("Rent Calendar")).toContainText(t("Afghan Shamsi"));
    await button("Update Shop").click();
    await button("Collect Rent").click();
    const remaining = collection
      .getByText(t("Remaining Balance"), { exact: true })
      .locator("..");
    await expect(remaining).toContainText("400");
    await button("Full").click();
    await button("Save Payment").click();
    await button("Back").click();
    await page.getByRole("tab", { name: t("Collect"), exact: true }).click();
    await chooseCalendar(page, "View Calendar", language);
    await expect(
      page
        .getByText(language === "ps" ? "میزان ۱۴۰۵" : "Mizan 1405", {
          exact: true,
        })
        .first(),
    ).toBeVisible();
    await expect(
      page.getByText(language === "ps" ? "دوکان 07" : "Shop 07", {
        exact: true,
      }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test.beforeEach(async () => {
  await connectTestLedger();
});

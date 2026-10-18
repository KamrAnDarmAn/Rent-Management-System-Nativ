import { expect, test } from "./support/fixtures";
import { translateText } from "../src/i18n/translate";

for (const language of ["en", "ps"]) {
  test(`${language}: reports reconcile saved payments and dated expenses, filter shops, inspect months and export`, async ({
    page,
  }) => {
    const t = (key: string, values?: Record<string, string | number>) =>
      translateText(key, language, values);
    const button = (name: string) =>
      page.getByRole("button", { name: t(name), exact: true });
    const field = (name: string) =>
      page.getByRole("textbox", { name: t(name), exact: true });
    const metric = (name: string) =>
      page
        .getByTestId("report-metrics")
        .getByText(t(name), { exact: true })
        .locator("..");
    const value = (name: string, amount: number) =>
      expect(metric(name)).toContainText(
        t(`AFN ${amount.toLocaleString("en-US")}`),
      );
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.clock.setFixedTime(new Date("2026-10-17T10:00:00Z"));
    await page.addInitScript(
      (language) =>
        localStorage.setItem(
          "rent-manager-preferences-v1",
          JSON.stringify({ state: { language, theme: "light" }, version: 0 }),
        ),
      language,
    );
    await page.goto("/?screen=add-shop");
    for (const [label, text] of Object.entries({
      "Shop Number": "88",
      "Shop Name": "Report Market",
      "Shopkeeper Name": "Ahmad",
      "Phone Number": "0700123456",
      "Monthly Rent (AFN)": "1000",
      "Start Date": "2026-08-23",
    }))
      await field(label).fill(text);
    await button("Rent Calendar").click();
    await page
      .getByRole("menuitem", { name: t("Afghan Shamsi"), exact: true })
      .click();
    await button("Save Shop").click();
    await page.getByRole("button", { name: /#88.*Report Market/s }).click();
    for (const [amount, method] of [
      [400, "Cash"],
      [250, "Other"],
    ] as const) {
      await button("Collect Rent").click();
      await field("Payment Amount").fill(String(amount));
      if (method === "Other") await button(method).click();
      await button("Save Payment").click();
    }
    await button("Back").click();
    await page.getByRole("tab", { name: t("Spend"), exact: true }).click();
    for (const [amount, method, linked] of [
      [150, "Cash", true],
      [75, "Credit", false],
    ] as const) {
      await button("Add Expense").click();
      await field("Amount").fill(String(amount));
      await field("Description").fill(`Report expense ${method}`);
      await field("Date").fill("1405-07-25");
      if (linked) {
        await button("Select Shop (Optional)").click();
        await page.getByRole("menuitem", { name: /Shop 88|دوکان 88/ }).click();
      }
      if (method === "Credit") await button(method).click();
      await button("Save Expense").click();
    }
    await page.getByRole("tab", { name: t("Reports"), exact: true }).click();
    await value("Cash Collected", 400);
    await value("Other-Method Collections", 250);
    await value("Total Expenses", 225);
    await value("Unpaid Expenses", 75);
    await value("Expected Rent", 1000);
    await value("Settled Rent", 0);
    await value("Outstanding Rent", 1350);
    const hero = page.getByTestId("report-hero");
    await expect(
      hero.getByText(t("Net Cash Flow"), { exact: true }).locator(".."),
    ).toContainText(t("AFN 500"));
    await expect(page.getByTestId("financial-bars")).toBeVisible();
    await expect(
      page
        .getByTestId("screen-scroll")
        .filter({ has: page.getByTestId("report-metrics") })
        .getByTestId("financial-donut"),
    ).toHaveCount(2);
    await button("Report Scope").click();
    await page.getByRole("menuitem", { name: /#88 ·/ }).click();
    await value("Total Expenses", 150);
    await value("Unpaid Expenses", 0);
    await button("Report Scope").click();
    await page
      .getByRole("menuitem", { name: t("All Shops"), exact: true })
      .click();
    await button("Yearly Report").click();
    await expect(button("Report Year")).toContainText(
      language === "ps" ? "۱۴۰۵" : "1405",
    );
    await value("Expected Rent", 2000);
    await value("Settled Rent", 650);
    await expect(page.getByTestId("financial-bars")).toContainText(
      t("AFN 650"),
    );
    const point = page
      .getByTestId("financial-bars")
      .getByRole("button")
      .filter({ hasText: language === "ps" ? "میزان" : "Mizan" });
    await point.click();
    await expect(page.getByTestId("financial-bars")).toContainText(
      t("AFN 650"),
    );
    const downloadEvent = page.waitForEvent("download");
    await button("Export CSV Summary").click();
    const download = await downloadEvent;
    expect(download.suggestedFilename()).toBe(
      "rent-report-shamsi-2026-03-21.csv",
    );
    const stream = await download.createReadStream();
    let csv = "";
    for await (const chunk of stream!) csv += chunk.toString();
    expect(csv).toContain('"650"');
    expect(csv).toContain("Report Market");
    expect(csv).not.toContain("268000");
    const openSunbula = page.getByRole("button", {
      name: t("Open {{month}} report", {
        month: language === "ps" ? "سنبله ۱۴۰۵" : "Sunbula 1405",
      }),
      exact: true,
    });
    await openSunbula.click();
    await expect(button("Report Year")).toHaveCount(0);
    await value("Cash Collected", 0);
    await value("Settled Rent", 650);
    const link = page
      .getByRole("button", {
        name: t("View report for {{shop}}", {
          shop: t("Shop #{{number}}", { number: "88" }),
        }),
        exact: true,
      })
      .first();
    await link.click();
    await expect(
      page.getByText(t("Monthly History"), { exact: true }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("empty reports stay readable in dark mode at a narrow width and show no invented chart data", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.clock.setFixedTime(new Date("2026-10-17T10:00:00Z"));
  await page.addInitScript(() =>
    localStorage.setItem(
      "rent-manager-preferences-v1",
      JSON.stringify({
        state: { language: "en", theme: "dark", rentViewCalendar: "shamsi" },
        version: 0,
      }),
    ),
  );
  await page.goto("/?screen=reports");
  await expect(
    page.getByText("No records for this period", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("No expenses recorded for this period.", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByTestId("report-metrics")
      .getByText("Cash Collected", { exact: true })
      .locator(".."),
  ).toContainText("AFN 0");
  await expect(page.getByTestId("financial-bars")).toContainText(
    "No recorded data for this month.",
  );
  await page
    .getByRole("button", { name: "Yearly Report", exact: true })
    .click();
  await page.getByRole("button", { name: "Report Year", exact: true }).click();
  await page.getByRole("menuitem", { name: "1404", exact: true }).click();
  await expect(
    page.getByText("No records for this period", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});

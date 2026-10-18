import { expect, test } from "./support/fixtures";
import { ps } from "../src/i18n/locales/ps";

for (const language of ["en", "ps"]) {
  test(`${language}: mid-month collections pay old rent first, preserve partial balances and carry an advance once`, async ({
    page,
  }) => {
    const t = (value: string) =>
      language === "ps" ? (ps[value] ?? value) : value;
    const button = (name: string) =>
      page.getByRole("button", { name: t(name), exact: true });
    const field = (name: string) =>
      page.getByRole("textbox", { name: t(name), exact: true });
    const metric = (label: string) =>
      page
        .getByTestId("screen-scroll")
        .filter({ has: field("Payment Amount") })
        .getByText(t(label), { exact: true })
        .first()
        .locator("..");
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
    for (const [label, value] of Object.entries({
      "Shop Number": "88",
      "Shop Name": "Arrears Market",
      "Shopkeeper Name": "Ahmad",
      "Phone Number": "0700123456",
      "Monthly Rent (AFN)": "1000",
      "Start Date": "2026-08-23",
    }))
      await field(label).fill(value);
    await button("Rent Calendar").click();
    await page
      .getByRole("menuitem", { name: t("Afghan Shamsi"), exact: true })
      .click();
    await expect(field("Track Unpaid Rent From")).toHaveValue("1405-06-01");
    await button("Save Shop").click();
    await page.getByRole("button", { name: /#88.*Arrears Market/s }).click();
    await button("Collect Rent").click();
    await expect(metric("Previous Months Due")).toContainText("1,000");
    await expect(metric("Current Month Remaining")).toContainText("1,000");
    await field("Payment Amount").fill(language === "ps" ? "۱۵۰۰" : "1500");
    const allocation = page
      .getByText(t("Payment Allocation"), { exact: true })
      .locator("../..");
    await expect(allocation).toContainText(
      language === "ps" ? "سنبله" : "Sunbula",
    );
    await expect(allocation).toContainText(
      language === "ps" ? "میزان" : "Mizan",
    );
    await expect(metric("Remaining After Payment")).toContainText("500");
    await button("Save Payment").click();
    await button("Collect Rent").click();
    await expect(metric("Previous Months Due")).toContainText(
      language === "ps" ? "0 افغانۍ" : "AFN 0",
    );
    await expect(metric("Remaining Balance")).toContainText("500");
    await field("Payment Amount").fill("200");
    await expect(metric("Remaining After Payment")).toContainText("300");
    await button("Save Payment").click();
    await button("Collect Rent").click();
    await expect(metric("Remaining Balance")).toContainText("300");
    await field("Payment Amount").fill("500");
    await expect(metric("Rent Advance After Payment")).toContainText("200");
    await button("Save Payment").click();
    await button("Collect Rent").click();
    await expect(metric("Rent Advance Available")).toContainText("200");
    await expect(button("Save Payment")).toBeDisabled();
    await page.clock.setSystemTime(new Date("2026-10-23T10:00:00Z"));
    await page.clock.runFor(60_001);
    await expect(metric("Remaining Balance")).toContainText("800");
    await expect(metric("Previously Settled")).toContainText("200");
    await button("Full").click();
    await button("Save Payment").click();
    await button("Collect Rent").click();
    await expect(button("Save Payment")).toBeDisabled();
    await page.clock.setSystemTime(new Date("2026-11-22T10:00:00Z"));
    await page.clock.runFor(60_001);
    await expect(metric("Remaining Balance")).toContainText("1,000");
    // Earlier months remain settled even though their receipts were entered mid-month.
    await button("Back").click();
    await page.getByText(t("Outstanding Rent"), { exact: true }).click();
    await expect(
      page.getByText(t("Monthly History"), { exact: true }),
    ).toBeVisible();
    const monthly = page
      .getByText(t("Monthly History"), { exact: true })
      .locator("../..");
    await expect(monthly.getByText(t("Paid"), { exact: true })).toHaveCount(3);
    await expect(monthly.getByText(t("Unpaid"), { exact: true })).toHaveCount(
      1,
    );
    await button("Back").click();
    await button("Back").click();
    await page.getByRole("tab", { name: t("Reports"), exact: true }).click();
    const reportValue = (label: string) =>
      page
        .getByTestId("screen-scroll")
        .filter({ has: page.getByText(t("Cash Collected"), { exact: true }) })
        .getByText(t(label), { exact: true })
        .first()
        .locator("..");
    await expect(reportValue("Cash Collected")).toContainText(
      language === "ps" ? "0 افغانۍ" : "AFN 0",
    );
    await button("Previous month").click();
    await expect(reportValue("Cash Collected")).toContainText("800");
    await button("Previous month").click();
    // 1500 + 200 + 500 received in Mizan, including its 200 advance, counted once.
    await expect(reportValue("Cash Collected")).toContainText("2,200");
    await button("Previous month").click();
    await expect(reportValue("Cash Collected")).toContainText(
      language === "ps" ? "0 افغانۍ" : "AFN 0",
    );
    await expect(reportValue("Settled Rent")).toContainText("1,000");
  });
}

import { expect, test, type Locator } from "./support/fixtures";
import { translateText } from "../src/i18n/translate";

for (const language of ["en", "ps"]) {
  test(`${language}: partial collections update shop, dashboard and report KPIs immediately`, async ({
    page,
  }) => {
    const t = (value: string) => translateText(value, language);
    const button = (name: string) =>
      page.getByRole("button", { name: t(name), exact: true });
    const field = (name: string) =>
      page.getByRole("textbox", { name: t(name), exact: true });
    const active = () =>
      page.getByTestId("screen-scroll").filter({ visible: true });
    const metric = (label: string) =>
      active().getByText(t(label), { exact: true }).locator("..");
    const value = (label: string, amount: number) =>
      expect(metric(label)).toContainText(
        t(`AFN ${amount.toLocaleString("en-US")}`),
      );
    const twoColumns = async (left: Locator, right: Locator) => {
      const a = await left.boundingBox(),
        b = await right.boundingBox();
      expect(a).not.toBeNull();
      expect(b).not.toBeNull();
      expect(Math.abs(a!.y - b!.y)).toBeLessThan(2);
      expect(Math.abs(a!.x - b!.x)).toBeGreaterThan(a!.width - 2);
    };
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
      "Shop Name": "KPI Market",
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
    await page.getByRole("button", { name: /#88.*KPI Market/s }).click();
    await value("Payments Received (This Month)", 0);
    await value("Outstanding Rent", 2000);
    for (const [amount, method, collected, due] of [
      [400, "Cash", 400, 1600],
      [250, "Other", 650, 1350],
    ] as const) {
      await button("Collect Rent").click();
      await field("Payment Amount").fill(String(amount));
      if (method === "Other") await button("Other").click();
      await button("Save Payment").click();
      await value("Payments Received (This Month)", collected);
      await value("Outstanding Rent", due);
    }
    await twoColumns(
      metric("Payments Received (This Month)"),
      metric("Outstanding Rent"),
    );
    await button("Back").click();
    await page.getByRole("tab", { name: t("Collect"), exact: true }).click();
    await value("Payments Received (Selected Month)", 650);
    await value("Outstanding Rent", 1350);
    // Both receipts paid older rent; current-month settlement is still zero.
    await expect(
      active()
        .getByText(t("Settled Rent"), { exact: true })
        .last()
        .locator(".."),
    ).toContainText(t("AFN 0"));
    await twoColumns(
      metric("Payments Received (Selected Month)"),
      metric("Outstanding Rent"),
    );
    await button("Previous month").click();
    await value("Payments Received (Selected Month)", 0);
    await value("Outstanding Rent", 350);
    await button("Next month").click();
    await value("Payments Received (Selected Month)", 650);
    await page.getByRole("tab", { name: t("Reports"), exact: true }).click();
    await value("Cash Collected", 400);
    await value("Other-Method Collections", 250);
  });
}

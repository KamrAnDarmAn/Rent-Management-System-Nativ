import { expect, test, type Locator } from "./support/fixtures";
import { translateText } from "../src/i18n/translate";
import { backupPayload, encodeBackup } from "../src/domain/backup";
import { emptyLedger } from "../src/types/ledger";
import { initialShops } from "../src/data/shops";

test("dashboard totals keep exact whole AFN when valid shop amounts sum beyond the safe-integer range", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-10-17T10:00:00Z"));
  const shops = [2, Number.MAX_SAFE_INTEGER].map((rent, i) => ({
    ...initialShops[2],
    id: i + 1,
    number: String(i + 1),
    rent,
    startDate: "2026-10-01",
    rentLedgerStartDate: "2026-10-01",
  }));
  shops[0] = {
    ...shops[0],
    startDate: "2026-09-01",
    rentLedgerStartDate: "2026-09-01",
    initialRent: Number.MAX_SAFE_INTEGER,
    rentRates: [{ effective: "2026-10-01", amount: 2 }],
    rentReceipts: [
      {
        id: "prior-month",
        date: "2026-09-01",
        amount: Number.MAX_SAFE_INTEGER,
        method: "Cash",
      },
    ],
  };
  const contents = await encodeBackup(
    backupPayload(
      {
        ...emptyLedger(),
        setupComplete: true,
        propertyName: "Precision Market",
        shops,
      },
      {
        language: "en",
        theme: "light",
        rentViewCalendar: "gregorian",
        reminders: false,
        reminderDay: 5,
      },
    ),
  );
  await page.goto("/?screen=backup-restore");
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Choose File", exact: true }).click();
  await (
    await chooser
  ).setFiles({
    name: "precision.json",
    mimeType: "application/json",
    buffer: Buffer.from(contents),
  });
  await expect(
    page.getByText("Backup validated", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("checkbox", {
      name: "Replace current data with this backup",
      exact: true,
    })
    .check();
  await page.getByRole("button", { name: "Restore Data", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Backup restored successfully.",
  );
  await page.getByRole("tab", { name: "Collect", exact: true }).click();
  await expect(
    page.getByText("Precision Market", { exact: true }),
  ).toBeVisible();
  const metric = (label: string) =>
    page
      .getByText(label, { exact: true })
      .filter({ visible: true })
      .first()
      .locator("..");
  await expect(metric("Total Expected Rent (Selected Month)")).toContainText(
    "AFN 9,007,199,254,740,993",
  );
  await expect(metric("Outstanding Rent")).toContainText(
    "AFN 9,007,199,254,740,993",
  );
  await expect(metric("Remaining")).toContainText("AFN 9,007,199,254,740,993");
  await page.goto("/?screen=rent-history");
  await expect(metric("Expected Rent")).toContainText(
    "AFN 9,007,199,254,740,993",
  );
  await expect(metric("Settled Rent")).toContainText(
    "AFN 9,007,199,254,740,991",
  );
  await expect(metric("Outstanding Rent")).toContainText("AFN 2");
  await page.goto("/?screen=collect");
  await page
    .getByRole("button")
    .filter({ has: page.getByText("Shop 2", { exact: true }) })
    .click();
  await page.getByRole("button", { name: "Collect Rent", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Payment Amount", exact: true })
    .fill(String(Number.MAX_SAFE_INTEGER - 1));
  await page.getByRole("button", { name: "Save Payment", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("Payment saved.");
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(metric("Remaining")).toContainText("AFN 3");
});

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

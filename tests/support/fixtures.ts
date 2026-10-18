import { test as base, expect } from "@playwright/test";
import { backupPayload, encodeBackup } from "../../src/domain/backup";
import { emptyLedger } from "../../src/types/ledger";
import { initialShops } from "../../src/data/shops";

// Sample records are an explicit test fixture imported through the real restore
// flow. Production starts empty and never seeds these records.
const contents = encodeBackup(
  backupPayload(
    {
      ...emptyLedger(),
      propertyName: "Kabul Market",
      setupComplete: true,
      shops: initialShops,
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
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.goto("/");
    await page.getByText("Restore Backup", { exact: true }).click();
    const chooser = page.waitForEvent("filechooser");
    await page
      .getByRole("button", { name: "Choose File", exact: true })
      .click();
    await (
      await chooser
    ).setFiles({
      name: "test-fixture.json",
      mimeType: "application/json",
      buffer: Buffer.from(await contents),
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
    await page
      .getByRole("button", { name: "Restore Data", exact: true })
      .click();
    await expect(
      page.getByRole("tab", { name: "Collect", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Kabul Market", { exact: true })).toBeVisible();
    await use(page);
  },
});
export { expect };
export type { Page, Locator } from "@playwright/test";

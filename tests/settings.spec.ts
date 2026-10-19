import { test, expect } from "./support/fixtures";
import appConfig from "../app.json";
import { translateText } from "../src/i18n/translate";

for (const language of ["en", "ps"] as const) {
  test(`${language}: settings show the release version and web reminders explain availability`, async ({
    page,
  }) => {
    const t = (text: string, values?: Record<string, string>) =>
      translateText(text, language, values);
    if (language === "ps") {
      await page.evaluate(() => {
        const key = "rent-manager-preferences-v1";
        const saved = JSON.parse(localStorage.getItem(key)!);
        saved.state.language = "ps";
        localStorage.setItem(key, JSON.stringify(saved));
      });
      await page.reload();
    }
    await page.getByRole("tab", { name: t("Settings"), exact: true }).click();
    const about = page.getByRole("button", {
      name: t("About GMM"),
      exact: true,
    });
    await about.click();
    await expect(page.getByRole("alert")).toHaveText(
      t("GMM v{{version}} · Your ledger is saved offline in SQLite.", {
        version: appConfig.expo.version,
      }),
    );
    await page.getByRole("alert").click();
    await expect(
      page.getByText(
        t("Version {{version}}", { version: appConfig.expo.version }),
        { exact: true },
      ),
    ).toBeVisible();
    await page
      .getByRole("button", { name: t("Rent Reminders"), exact: true })
      .click();
    const toggle = page.getByRole("switch", {
      name: t("Rent Collection Reminder"),
      exact: true,
    });
    await toggle.click();
    await expect(page.getByRole("alert")).toHaveText(
      t(
        "Device notifications are available in the Android and iOS app. You can review unpaid rent here anytime.",
      ),
    );
    await expect(toggle).not.toBeChecked();
    await page.reload();
    await page.getByRole("tab", { name: t("Settings"), exact: true }).click();
    await page
      .getByRole("button", { name: t("Rent Reminders"), exact: true })
      .click();
    await expect(toggle).not.toBeChecked();
  });
}

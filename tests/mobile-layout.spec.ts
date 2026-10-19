import { expect, test, type Locator } from "./support/fixtures";
import { translateText } from "../src/i18n/translate";

async function readableButton(button: Locator, title: string, minHeight = 34) {
  await button.scrollIntoViewIfNeeded();
  const label = button.getByText(title, { exact: true });
  await expect(label).toBeVisible();
  const outer = await button.boundingBox();
  const inner = await label.boundingBox();
  expect(outer).not.toBeNull();
  expect(inner).not.toBeNull();
  expect(outer!.height).toBeGreaterThanOrEqual(minHeight);
  expect(inner!.width).toBeGreaterThan(20);
  expect(inner!.height).toBeGreaterThan(10);
  expect(inner!.x).toBeGreaterThanOrEqual(outer!.x);
  expect(inner!.x + inner!.width).toBeLessThanOrEqual(
    outer!.x + outer!.width + 1,
  );
  expect(inner!.y).toBeGreaterThanOrEqual(outer!.y);
  expect(inner!.y + inner!.height).toBeLessThanOrEqual(
    outer!.y + outer!.height + 1,
  );
}

for (const width of [320, 360]) {
  for (const language of ["en", "ps"] as const) {
    test(`${width}px ${language}: mobile action labels fit and expense controls stay together`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: width === 320 ? 693 : 780 });
      await page.addInitScript((language) => {
        localStorage.setItem(
          "rent-manager-preferences-v1",
          JSON.stringify({ state: { language, theme: "dark" }, version: 0 }),
        );
      }, language);
      const t = (value: string) => translateText(value, language);
      const button = (title: string) =>
        page.getByRole("button", { name: t(title), exact: true });
      const check = (title: string, height?: number) =>
        readableButton(button(title), t(title), height);

      await page.goto("/?screen=get-started");
      await check("Get Started", 46);
      await page.screenshot({ path: testInfo.outputPath("welcome.png") });
      await button("Get Started").click();
      await check("Create Property", 46);

      await page.goto("/?screen=add-expense");
      await check("Save Expense", 46);
      const type = page.getByText(t("Expense Type"), { exact: true });
      await type.scrollIntoViewIfNeeded();
      const property = page.getByRole("button").filter({
        has: page.getByText(t("Property Expense"), { exact: true }),
      });
      const personal = page.getByRole("button").filter({
        has: page.getByText(t("Personal Expense"), { exact: true }),
      });
      const labelBounds = await type.boundingBox();
      const propertyBounds = await property.boundingBox();
      const personalBounds = await personal.boundingBox();
      expect(propertyBounds!.y - labelBounds!.y).toBeLessThan(60);
      expect(propertyBounds!.height).toBeLessThan(140);
      expect(personalBounds!.y).toBe(propertyBounds!.y);
      await expect(property).toContainText(t("Related to shops/property"));
      await expect(personal).toContainText(t("Not related to shops"));
      await page.screenshot({ path: testInfo.outputPath("expense.png") });
      await personal.click();
      await property.click();
      await page
        .getByRole("textbox", { name: t("Amount"), exact: true })
        .fill("500");
      await page
        .getByRole("textbox", { name: t("Description"), exact: true })
        .fill("Mobile layout repair");
      await button("Save Expense").click();
      await expect(
        page.getByText(t("Expense saved."), { exact: true }),
      ).toBeVisible();

      await page.goto("/?screen=shop-details");
      await check("Collect Rent", 46);
      await check("Delete Shop", 46);
      for (const title of [
        "Edit Shop",
        "Change Rent",
        "End Tenancy",
        "Archive",
      ])
        await check(title);
      const edit = await button("Edit Shop").boundingBox();
      const rent = await button("Change Rent").boundingBox();
      const end = await button("End Tenancy").boundingBox();
      const archive = await button("Archive").boundingBox();
      expect(edit!.y).toBe(rent!.y);
      expect(end!.y).toBe(archive!.y);
      expect(end!.y).toBeGreaterThan(edit!.y);
      expect(archive!.x + archive!.width).toBeLessThanOrEqual(width);
      await page.screenshot({ path: testInfo.outputPath("shop-actions.png") });

      await button("Collect Rent").click();
      await check("Save Payment", 46);
      await page.goto("/?screen=device-transfer");
      await check("Backup & Restore", 46);
      await button("Backup & Restore").click();
      await check("Create Backup", 46);
    });
  }
}

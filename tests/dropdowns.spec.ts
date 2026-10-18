import { expect, test, type Page } from "./support/fixtures";
import { translateText } from "../src/i18n/translate";
import { placeMenu } from "../src/components/menus/placement";

async function pageLayout(page: Page) {
  return page.evaluate(() =>
    Array.from(
      document.querySelectorAll(
        '[data-testid="screen-scroll"], [data-testid="screen-scroll"] > div > *, input, textarea',
      ),
    ).map((element) => {
      const rect = element.getBoundingClientRect();
      return [
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        element.scrollHeight,
        element.scrollTop,
      ];
    }),
  );
}

const dropdowns = [
  ["collect-rent", "Select Shop", "Shop #02 · Bilal Electronics · Bilal Ahmed"],
  ["goods-taken", "Unit", "Kg"],
  ["add-expense", "Select Shop (Optional)", "No Shop"],
  ["reports", "View Calendar", "Afghan Shamsi"],
  ["reports", "Report Scope", "Shop #02 · Bilal Electronics"],
  ["reminders", "Days Before Rent Is Due", "7"],
  ["settings", "Appearance", "Dark"],
];

for (const language of ["en", "ps"] as const) {
  for (const [screen, label, option] of dropdowns) {
    test(`${language}: ${screen} / ${label} floats without changing the page layout`, async ({
      page,
    }) => {
      const t = (text: string) => translateText(text, language);
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.addInitScript((language) => {
        localStorage.setItem(
          "rent-manager-preferences-v1",
          JSON.stringify({ state: { language, theme: "light" }, version: 0 }),
        );
      }, language);
      await page.goto(`/?screen=${screen}`);
      const trigger = page.getByRole("button", { name: t(label), exact: true });
      await trigger.scrollIntoViewIfNeeded();
      await page.evaluate(() => document.fonts.ready);
      const before = await pageLayout(page);
      await trigger.click();
      const menu = page.getByRole("menu", { name: t(label), exact: true });
      await expect(menu).toBeVisible();
      await expect.poll(() => pageLayout(page)).toEqual(before);
      const bounds = await menu.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.y).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844);
      await page
        .getByRole("button", { name: t("Close menu"), exact: true })
        .click({ position: { x: 5, y: 5 } });
      await expect(menu).toHaveCount(0);
      await expect.poll(() => pageLayout(page)).toEqual(before);
      await trigger.click();
      await page
        .getByRole("menuitem", { name: t(option), exact: true })
        .click();
      await expect(menu).toHaveCount(0);
      await expect(
        page.getByRole("button", {
          name: t(screen === "rent-history" ? option : label),
          exact: true,
        }),
      ).toContainText(t(screen === "settings" ? "Dark⌄" : option));
      expect(errors).toEqual([]);
    });
  }
}

test("Unit menu opens upwards near the screen edge and Escape only dismisses the menu", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 460 });
  await page.goto("/?screen=goods-taken");
  const trigger = page.getByRole("button", { name: "Unit", exact: true });
  await trigger.evaluate((element) => element.scrollIntoView({ block: "end" }));
  const anchor = await trigger.boundingBox();
  const before = await pageLayout(page);
  await trigger.click();
  const menu = page.getByTestId("dropdown-menu");
  await expect(menu).toBeVisible();
  expect((await menu.boundingBox())!.y).toBeLessThan(anchor!.y);
  await expect.poll(() => pageLayout(page)).toEqual(before);
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeVisible();
  await expect.poll(() => pageLayout(page)).toEqual(before);
});

test("menu placement clamps narrow and RTL menus, flips upwards and limits long menus", () => {
  const bounds = { width: 360, top: 32, bottom: 700 };
  expect(
    placeMenu({ x: 250, y: 100, width: 90, height: 40 }, bounds, 200, true),
  ).toEqual({ left: 160, top: 144, width: 180, maxHeight: 200 });
  expect(
    placeMenu({ x: 14, y: 650, width: 330, height: 40 }, bounds, 500, false),
  ).toEqual({ left: 14, top: 366, width: 330, maxHeight: 280 });
  expect(
    placeMenu(
      { x: 0, y: 100, width: 500, height: 40 },
      { width: 320, top: 20, bottom: 300 },
      500,
      false,
    ),
  ).toEqual({ left: 8, top: 144, width: 304, maxHeight: 156 });
});

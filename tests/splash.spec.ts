import { expect, test } from "@playwright/test";
import { translateText } from "../src/i18n/translate";

test("startup waits for splash artwork before opening first-time setup", async ({
  page,
}) => {
  let release!: () => void;
  const artwork = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/*spalsh-screen-background*.png", async (route) => {
    await artwork;
    await route.continue();
  });
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("splash-screen")).toBeVisible();
    await expect(
      page.getByRole("progressbar", { name: "Loading...", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Get Started", exact: true }),
    ).toHaveCount(0);
    release();
    await expect(
      page.getByRole("button", { name: "Get Started", exact: true }),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("splash-screen")).toHaveCount(0);
  } finally {
    release();
  }
});

for (const language of ["en", "ps"] as const) {
  for (const [width, height] of [
    [390, 754],
    [320, 640],
  ]) {
    test(`${language}: splash stays readable at ${width} × ${height}, including with dark preferences`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width, height });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript((language) => {
        localStorage.setItem(
          "rent-manager-preferences-v1",
          JSON.stringify({ state: { language, theme: "dark" }, version: 0 }),
        );
      }, language);
      await page.goto("/?screen=splash");
      await page.waitForLoadState("networkidle");
      const t = (key: string) => translateText(key, language);
      const screen = page.getByTestId("splash-screen");
      const heading = screen.getByText(t("Shop Rent Manager"), { exact: true });
      const subtitle = screen.getByText(
        t("Simple. Organized. Always in Control."),
        { exact: true },
      );
      const footer = screen.getByText(t("Manage Shops · Grow Peacefully"), {
        exact: true,
      });
      await expect(heading).toBeVisible();
      await expect(subtitle).toBeVisible();
      await expect(
        screen.getByRole("progressbar", { name: t("Loading..."), exact: true }),
      ).toBeVisible();
      await expect(footer).toBeVisible();
      const titleBounds = (await heading.boundingBox())!,
        subtitleBounds = (await subtitle.boundingBox())!,
        footerBounds = (await footer.boundingBox())!;
      expect(titleBounds.y + titleBounds.height).toBeLessThanOrEqual(
        subtitleBounds.y + 1,
      );
      expect(footerBounds.y + footerBounds.height).toBeLessThanOrEqual(height);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
      await expect(screen).toHaveCSS("background-color", "rgb(247, 252, 255)");
      await page.screenshot({
        path: info.outputPath(`splash-${language}-${width}.png`),
      });
    });
  }
}

import { expect, test } from "./support/fixtures";
import { kabulDate } from "../src/domain/rent";
import { formatAfghanDate } from "../src/utils/afghanDate";

test("Afghan Solar Hijri formatting uses civil month names, localized digits and leap years", () => {
  expect(formatAfghanDate("2026-10-17", "en")).toBe("25 Mizan 1405");
  expect(formatAfghanDate("2026-10-17", "ps")).toBe("۲۵ میزان ۱۴۰۵");
  expect(formatAfghanDate("2025-03-20", "en")).toBe("30 Hut 1403");
  expect(formatAfghanDate("2025-03-21", "en")).toBe("1 Hamal 1404");
  expect(formatAfghanDate("2026-03-21", "ps")).toBe("۱ حمل ۱۴۰۵");
  expect(
    formatAfghanDate(kabulDate(new Date("2026-10-17T19:29:59Z")), "en"),
  ).toBe("25 Mizan 1405");
  expect(
    formatAfghanDate(kabulDate(new Date("2026-10-17T19:30:00Z")), "en"),
  ).toBe("26 Mizan 1405");
});

test.use({ timezoneId: "America/Los_Angeles" });
for (const language of ["en", "ps"]) {
  test(`Collect shows today's Afghan date and rolls over at Kabul midnight (${language})`, async ({
    page,
  }) => {
    await page.addInitScript((language) => {
      localStorage.setItem(
        "rent-manager-preferences-v1",
        JSON.stringify({ state: { language, theme: "light" }, version: 0 }),
      );
    }, language);
    await page.clock.install({ time: new Date("2026-10-17T19:29:30Z") });
    await page.goto("/?screen=collect");
    const before = language === "ps" ? "۲۵ میزان ۱۴۰۵" : "25 Mizan 1405";
    const after = language === "ps" ? "۲۶ میزان ۱۴۰۵" : "26 Mizan 1405";
    await expect(page.getByText(before, { exact: true })).toBeVisible();
    await expect(page.getByText("Good Morning!", { exact: true })).toHaveCount(
      0,
    );
    await page.clock.fastForward(61000);
    await expect(page.getByText(after, { exact: true })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  });
}

import { expect, test } from "./support/fixtures";
import { translateText } from "../src/i18n/translate";

for (const language of ["en", "ps"]) {
  test(`${language}: general collection selects the shop, resets drafts and saves only to that shop`, async ({
    page,
  }) => {
    const t = (text: string) => translateText(text, language);
    const button = (name: string) =>
      page.getByRole("button", { name: t(name), exact: true });
    const field = (name: string) =>
      page.getByRole("textbox", { name: t(name), exact: true });
    const choose = async (number: string) => {
      await button("Select Shop").click();
      await page
        .getByRole("menuitem", { name: new RegExp(`#${number} ·`) })
        .click();
    };
    const remaining = () =>
      page
        .getByTestId("screen-scroll")
        .filter({ has: field("Payment Amount") })
        .getByText(t("Remaining Balance"), { exact: true })
        .locator("..");
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
    await page.goto("/");
    await button("Collect Rent").click();
    await expect(button("Select Shop")).toContainText(t("Choose a shop"));
    await expect(button("Save Payment")).toBeDisabled();
    await expect(field("Payment Amount")).toHaveCount(0);
    await button("Select Shop").click();
    await expect(page.getByRole("menuitem", { name: /#04 ·/ })).toHaveCount(0);
    await page.getByRole("menuitem", { name: /#02 ·/ }).click();
    await expect(remaining()).toContainText("10,000");
    await field("Payment Amount").fill("123");
    await field("Note (Optional)").fill("Draft for shop 02");
    await choose("03");
    await expect(button("Select Shop")).toContainText("#03");
    await expect(remaining()).toContainText("20,000");
    await expect(field("Payment Amount")).toHaveValue("20000");
    await expect(field("Note (Optional)")).toHaveValue("");
    await field("Payment Amount").fill("500");
    await button("Save Payment").click();
    // Returning through the main action must start unselected, not reuse the last tenant.
    await button("Collect Rent").click();
    await expect(button("Select Shop")).toContainText(t("Choose a shop"));
    await choose("02");
    await expect(remaining()).toContainText("10,000");
    await choose("03");
    await expect(remaining()).toContainText("19,500");
    await button("Back").click();
    // Collection from an individual shop still targets that shop directly.
    await page.getByRole("button", { name: /(?:Shop|دوکان) 03 / }).click();
    await button("Collect Rent").click();
    await expect(button("Select Shop")).toHaveCount(0);
    await expect(remaining()).toContainText("19,500");
    expect(errors).toEqual([]);
  });
}

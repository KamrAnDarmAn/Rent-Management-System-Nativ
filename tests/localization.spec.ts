import { expect, test, type Page } from "./support/fixtures";
import { screenReferences } from "../src/data/screenReferences";
import { ps } from "../src/i18n/locales/ps";
import { translateText } from "../src/i18n/translate";

async function pashto(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "rent-manager-preferences-v1",
      JSON.stringify({ state: { language: "ps", theme: "light" }, version: 0 }),
    );
  });
}
async function untranslatedCopy(page: Page) {
  return page.evaluate(() => {
    const found = new Set<string>();
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      const text = node.textContent?.trim() ?? "";
      if (
        !parent ||
        parent.closest('script,style,input,textarea,[aria-hidden="true"]') ||
        !parent.getClientRects().length
      )
        continue;
      // Color codes and real backup filenames are identifiers, not interface copy.
      if (
        /[A-Za-z]/.test(text) &&
        !/^#[a-f\d]{3,8}$/i.test(text) &&
        !/^[\w-]+\.(json|png|zip|backup)$/.test(text)
      )
        found.add(text);
    }
    for (const element of document.querySelectorAll(
      "[aria-label],[placeholder]",
    )) {
      if (element.closest('[aria-hidden="true"]')) continue;
      for (const attr of ["aria-label", "placeholder"]) {
        const value = element.getAttribute(attr);
        if (value && /[A-Za-z]/.test(value)) found.add(`${attr}: ${value}`);
      }
    }
    return [...found];
  });
}

test("Pashto formats changing amounts, dates, counts and interpolated values", () => {
  expect(translateText("AFN 4,000", "ps")).toBe("4,000 افغانۍ");
  expect(translateText("AFN -4,000", "ps")).toBe("-4,000 افغانۍ");
  expect(translateText("All (7)", "ps")).toBe("ټول (7)");
  expect(translateText("Paid (2)", "ps")).toBe("کرایه ورکړې (2)");
  expect(translateText("February 2027", "ps")).toBe("فبروري 2027");
  expect(translateText("Mar 15, 2026", "ps")).toBe("مارچ 15, 2026");
  expect(translateText("Shop #{{number}}", "ps", { number: "A-12" })).toBe(
    "دوکان #A-12",
  );
  expect(
    translateText("Paid: {{paid}} · Due: {{due}}", "ps", {
      paid: "500",
      due: "1,000",
    }),
  ).toBe("ورکړې: 500 · پاتې: 1,000");
  expect(
    translateText("Maximum available: {{amount}}", "ps", { amount: "AFN 500" }),
  ).toBe("تر ټولو زیات: 500 افغانۍ");
  expect(translateText("{{date}} · Cash", "ps", { date: "Mar 15, 2026" })).toBe(
    "مارچ 15, 2026 · نغدې",
  );
  expect(translateText("Custom English shop name", "ps")).toBe(
    "Custom English shop name",
  );
  expect(translateText("Shop #{{number}}", "en", { number: "A-12" })).toBe(
    "Shop #A-12",
  );
});

for (const screen of [
  ...screenReferences.map((item) => item.id),
  "edit-shop",
  "screen-gallery",
]) {
  test(`${screen} has Pashto interface text, placeholders and accessible labels`, async ({
    page,
  }) => {
    await pashto(page);
    await page.goto(`/?screen=${screen}`);
    await expect(page.locator("body")).toContainText(/[\u0600-\u06ff]/);
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => untranslatedCopy(page)).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  });
}

test("Pashto forms validate, preserve entered data and keep rental type choices working", async ({
  page,
}) => {
  await pashto(page);
  await page.goto("/?screen=add-shop");
  await page
    .getByRole("button", { name: ps["Save Shop"], exact: true })
    .click();
  await expect(
    page
      .getByTestId("screen-scroll")
      .getByText(ps["Shop number is required"], { exact: true }),
  ).toBeVisible();
  const values = {
    "Shop Number": "07",
    "Shop Name": "د احمد دوکان",
    "Shopkeeper Name": "احمد",
    "Phone Number": "0700123456",
    "Monthly Rent (AFN)": "1000",
    "Start Date": "2026-08-01",
  };
  for (const [label, value] of Object.entries(values))
    await page
      .getByRole("textbox", { name: ps[label], exact: true })
      .fill(value);
  await page.getByRole("button", { name: ps.Prepaid, exact: true }).click();
  await page
    .getByRole("textbox", {
      name: ps["Advance Rent Received (AFN)"],
      exact: true,
    })
    .fill("4000");
  await page
    .getByRole("textbox", { name: ps["Advance Start Date"], exact: true })
    .fill("2026-08-01");
  await page
    .getByRole("button", { name: ps["Save Shop"], exact: true })
    .click();
  await page.getByRole("button", { name: /دوکان #07.*د احمد دوکان/s }).click();
  await page
    .getByRole("button", { name: ps["Edit Shop"], exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: ps["Shop Name"], exact: true }),
  ).toHaveValue("د احمد دوکان");
  await expect(
    page.getByRole("textbox", {
      name: ps["Advance Rent Received (AFN)"],
      exact: true,
    }),
  ).toHaveValue("4000");
  await expect.poll(() => untranslatedCopy(page)).toEqual([]);
});

test("switching either language updates the whole screen and survives restart", async ({
  page,
}) => {
  await pashto(page);
  await page.goto("/?screen=language");
  await page
    .getByRole("button")
    .filter({ has: page.getByText(ps.English, { exact: true }) })
    .click();
  await page
    .getByRole("button", { name: ps["Save & Apply"], exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Save & Apply", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Language", { exact: true })).toBeVisible();
  await page
    .getByRole("button")
    .filter({ has: page.getByText("پښتو", { exact: true }) })
    .click();
  await page.getByRole("button", { name: "Save & Apply", exact: true }).click();
  await expect(
    page.getByRole("button", { name: ps["Save & Apply"], exact: true }),
  ).toBeVisible();
  await expect.poll(() => untranslatedCopy(page)).toEqual([]);
  await page.reload();
  await expect(
    page.getByRole("button", { name: ps["Save & Apply"], exact: true }),
  ).toBeVisible();
  await expect.poll(() => untranslatedCopy(page)).toEqual([]);
});

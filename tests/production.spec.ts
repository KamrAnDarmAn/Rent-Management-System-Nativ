import { expect, test, type Page } from "@playwright/test";
import { decodeBackup } from "../src/domain/backup";
import { readFile } from "node:fs/promises";
const button = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true });
const field = (page: Page, name: string) =>
  page.getByRole("textbox", { name, exact: true });
async function setup(page: Page) {
  await page.clock.setFixedTime(new Date("2026-10-17T10:00:00Z"));
  await page.goto("/");
  await expect(button(page, "Get Started")).toBeVisible();
  await button(page, "Get Started").click();
  await field(page, "Property or Building Name").fill("GMM Production Market");
  await button(page, "Create Property").click();
  await expect(button(page, "Add First Shop")).toBeVisible();
}
async function addShop(page: Page) {
  await button(page, "Add First Shop").click();
  for (const [label, value] of Object.entries({
    "Shop Number": "01",
    "Shop Name": "My Store",
    "Shopkeeper Name": "Ali",
    "Phone Number": "0700123456",
    "Monthly Rent (AFN)": "1000",
    "Start Date": "2026-10-01",
  }))
    await field(page, label).fill(value);
  await button(page, "Save Shop").click();
  await page.getByRole("button", { name: /Shop #01 My Store/ }).click();
  await expect(
    page
      .getByTestId("screen-scroll")
      .filter({ has: page.getByText("Shop Information", { exact: true }) })
      .getByText("My Store", { exact: true })
      .first(),
  ).toBeVisible();
}

test("invalid persisted settings cannot replace preference actions or prevent setup", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "rent-manager-preferences-v1",
      JSON.stringify({
        version: 0,
        state: {
          language: { bad: true },
          theme: null,
          reminders: "yes",
          reminderDay: -5,
          rentViewCalendar: "broken",
          setLanguage: "not a function",
          setTheme: "not a function",
        },
      }),
    ),
  );
  await setup(page);
  await page.getByRole("tab", { name: "Settings", exact: true }).click();
  await button(page, "Language").click();
  await page
    .getByRole("button")
    .filter({ has: page.getByText("پښتو", { exact: true }) })
    .click();
  await button(page, "Save & Apply").click();
  await expect(button(page, "خوندي او پلي کړئ")).toBeVisible();
});

test("a screen render failure can recover without deleting saved shops or payments", async ({
  page,
}) => {
  await setup(page);
  await addShop(page);
  await button(page, "Collect Rent").click();
  await field(page, "Payment Amount").fill("300");
  await button(page, "Save Payment").click();
  await expect(page.getByText("Payment saved.", { exact: true })).toBeVisible();
  await button(page, "Back").click();
  await page.evaluate(() => {
    Reflect.set(globalThis, "__gmmOriginalFormatter", Intl.DateTimeFormat);
    Intl.DateTimeFormat = new Proxy(Intl.DateTimeFormat, {
      construct() {
        throw new Error("Simulated screen rendering failure");
      },
    });
  });
  try {
    await page.getByRole("tab", { name: "Settings", exact: true }).click();
    await button(page, "Data Management").click();
    await expect(
      page.getByText("Unable to display this screen", { exact: true }),
    ).toBeVisible();
  } finally {
    await page.evaluate(() => {
      Intl.DateTimeFormat = Reflect.get(globalThis, "__gmmOriginalFormatter");
    });
  }
  await button(page, "Try Again").click();
  await expect(
    page.getByText("GMM Production Market", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Shops", exact: true }).click();
  await page.getByRole("button", { name: /Shop #01 My Store/ }).click();
  await expect(
    page.getByText("Outstanding Rent", { exact: true }).first().locator(".."),
  ).toContainText("AFN 700");
});

test("first setup is shown once; shops and arbitrary partial payments survive reload and work without a network", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await setup(page);
  await addShop(page);
  await context.setOffline(true);
  await button(page, "Collect Rent").click();
  await field(page, "Payment Amount").fill("300");
  await button(page, "Save Payment").click();
  await expect(
    page.getByText("Outstanding Rent", { exact: true }).first().locator(".."),
  ).toContainText("AFN 700");
  await context.setOffline(false);
  await page.reload();
  await expect(button(page, "Get Started")).toHaveCount(0);
  await expect(
    page.getByText("GMM Production Market", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByText("Payments Received (Selected Month)", { exact: true })
      .locator(".."),
  ).toContainText("AFN 300");
  await page.getByRole("tab", { name: "Shops", exact: true }).click();
  await page.getByRole("button", { name: /Shop #01 My Store/ }).click();
  await expect(
    page.getByText("Outstanding Rent", { exact: true }).first().locator(".."),
  ).toContainText("AFN 700");
  expect(errors).toEqual([]);
});

test("a real encrypted download restores on a fresh device and a corrupt backup cannot replace data", async ({
  page,
  browser,
}) => {
  await setup(page);
  await addShop(page);
  await button(page, "Collect Rent").click();
  await field(page, "Payment Amount").fill("275");
  await button(page, "Save Payment").click();
  await expect(page.getByText("Payment saved.", { exact: true })).toBeVisible();
  await page.goto("/?screen=backup-restore");
  await field(page, "Backup Password (Optional)").fill(
    "My strong backup password",
  );
  const downloaded = page.waitForEvent("download");
  await button(page, "Create Backup").click();
  const file = await downloaded;
  const path = await file.path();
  expect(path).toBeTruthy();
  const contents = await readFile(path!, "utf8");
  const backup = await decodeBackup(contents, "My strong backup password");
  expect(backup.data.shops[0].rentReceipts![0].amount).toBe(275);
  const context = await browser.newContext({
    baseURL: new URL(page.url()).origin,
  });
  const other = await context.newPage();
  const errors: string[] = [];
  other.on("pageerror", (e) => errors.push(e.message));
  await other.goto("/");
  await button(other, "Restore Backup").click();
  await field(other, "Backup Password (Optional)").fill(
    "My strong backup password",
  );
  const chooser = other.waitForEvent("filechooser");
  await button(other, "Choose File").click();
  await (
    await chooser
  ).setFiles({
    name: "GMM-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(contents),
  });
  await expect(
    other.getByText("Backup validated", { exact: true }),
  ).toBeVisible();
  await other
    .getByRole("checkbox", {
      name: "Replace current data with this backup",
      exact: true,
    })
    .check();
  await button(other, "Restore Data").click();
  await expect(
    other.getByText("GMM Production Market", { exact: true }),
  ).toBeVisible();
  await expect(
    other
      .getByText("Payments Received (Selected Month)", { exact: true })
      .locator(".."),
  ).toContainText("AFN 275");
  await other.goto("/?screen=backup-restore");
  const corrupted = other.waitForEvent("filechooser");
  await button(other, "Choose File").click();
  await (
    await corrupted
  ).setFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from("{broken}"),
  });
  await expect(
    other.getByText("This is not a valid GMM backup, or the file is damaged.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(button(other, "Restore Data")).toHaveCount(0);
  await other.goto("/");
  await expect(
    other
      .getByText("Payments Received (Selected Month)", { exact: true })
      .locator(".."),
  ).toContainText("AFN 275");
  expect(errors).toEqual([]);
  await context.close();
});

test("startup recovery activates a separate database and preserves the original saved ledger", async ({
  page,
}) => {
  await setup(page);
  await addShop(page);
  await button(page, "Collect Rent").click();
  await field(page, "Payment Amount").fill("200");
  await button(page, "Save Payment").click();
  await expect(page.getByText("Payment saved.", { exact: true })).toBeVisible();
  await page.goto("/?screen=backup-restore");
  const download = page.waitForEvent("download");
  await button(page, "Create Backup").click();
  const contents = await readFile((await (await download).path())!, "utf8");
  await page.goto("/?screen=add-expense");
  await field(page, "Amount").fill("100");
  await field(page, "Description").fill("Original database only");
  await button(page, "Save Expense").click();
  await expect(page.getByText("Expense saved.", { exact: true })).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem("gmm-active-database-v1", "invalid-location"),
  );
  await page.reload();
  await expect(button(page, "Try Again")).toBeVisible();
  const chooser = page.waitForEvent("filechooser");
  await button(page, "Choose File").click();
  await (
    await chooser
  ).setFiles({
    name: "recovery.json",
    mimeType: "application/json",
    buffer: Buffer.from(contents),
  });
  await expect(
    page.getByText("Backup validated", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("checkbox", {
      name: "Use this backup as the current ledger",
      exact: true,
    })
    .check();
  await button(page, "Restore Data").click();
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("gmm-active-database-v1")),
    )
    .toMatch(/^gmm-recovery-/);
  await page.goto("/");
  await expect(
    page
      .getByText("Payments Received (Selected Month)", { exact: true })
      .locator(".."),
  ).toContainText("AFN 200");
  await page.goto("/?screen=spend");
  await expect(
    page.getByText("No expenses recorded for this month.", { exact: true }),
  ).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem("gmm-active-database-v1", "gmm-ledger.db"),
  );
  await page.reload();
  await expect(
    page.getByText("Original database only", { exact: true }),
  ).toBeVisible();
});

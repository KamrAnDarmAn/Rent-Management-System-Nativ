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
async function addShop(page: Page, startDate = "2026-10-01") {
  await button(page, "Add First Shop").click();
  for (const [label, value] of Object.entries({
    "Shop Number": "01",
    "Shop Name": "My Store",
    "Shopkeeper Name": "Ali",
    "Phone Number": "0700123456",
    "Monthly Rent (AFN)": "1000",
    "Start Date": startDate,
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

test("goods payables settle through cash and rent offset without double counting", async ({
  page,
}) => {
  await setup(page);
  await addShop(page);
  await page.goto("/?screen=goods-taken");
  await button(page, "Select Shop").click();
  await page
    .getByRole("menuitem", { name: "Shop 01 · My Store · Ali", exact: true })
    .click();
  await field(page, "Item Name").fill("Rice");
  await field(page, "Quantity").fill("2");
  await field(page, "Unit Price (AFN)").fill("100");
  await button(page, "owed").click();
  await button(page, "Record Goods").click();
  await expect(page.getByRole("alert")).toHaveText("Goods saved.");
  await page.goto("/?screen=goods-settlement");
  const payable = page
    .getByRole("button")
    .filter({ has: page.getByText("Rice", { exact: true }) });
  await payable.click();
  await field(page, "Settlement Amount").fill("100");
  await button(page, "Complete Settlement").click();
  await expect(page.getByRole("alert")).toHaveText("Goods settlement saved.");
  await expect(payable).toContainText("AFN 100");
  await payable.click();
  await button(page, "Settlement Method").click();
  await page
    .getByRole("menuitem", { name: "Offset Against Rent", exact: true })
    .click();
  await button(page, "Complete Settlement").click();
  await expect(
    page.getByText("No goods payable remains.", { exact: true }),
  ).toBeVisible();
  await page.goto("/?screen=spend");
  for (const [label, value] of [
    ["Total Expenses", "200"],
    ["Paid Expenses", "100"],
    ["Unsettled Goods Payables", "0"],
  ])
    await expect(
      page.getByText(label, { exact: true }).locator(".."),
    ).toContainText(`AFN ${value}`);
  await page.goto("/?screen=shop-details");
  await expect(
    page.getByText("Outstanding Rent", { exact: true }).first().locator(".."),
  ).toContainText("AFN 900");
});

test("a payment completing after navigation preserves the new edit screen and its draft", async ({
  page,
}) => {
  await setup(page);
  await addShop(page);
  await button(page, "Collect Rent").click();
  await field(page, "Payment Amount").fill("300");
  // Hold one actual SQLite commit, rather than relying on a timing race.
  await page.evaluate(() => {
    const original = Worker.prototype.postMessage;
    let held = false;
    Worker.prototype.postMessage = function (
      this: Worker,
      ...args: [unknown, (Transferable[] | StructuredSerializeOptions)?]
    ) {
      const message = args[0] as {
        type?: string;
        isSync?: boolean;
        data?: { source?: string };
      };
      if (
        !held &&
        message.type === "exec" &&
        !message.isSync &&
        message.data?.source?.trim() === "COMMIT"
      ) {
        held = true;
        Reflect.set(globalThis, "__gmmFinishCommit", () =>
          Reflect.apply(original, this, args),
        );
        return;
      }
      Reflect.apply(original, this, args);
    };
  });
  await button(page, "Save Payment").click();
  await page.waitForFunction(
    () => typeof Reflect.get(globalThis, "__gmmFinishCommit") === "function",
  );
  await button(page, "Edit Shop").click();
  await field(page, "Shop Name").fill("Draft kept after payment");
  await page.evaluate(() => Reflect.get(globalThis, "__gmmFinishCommit")());
  await expect(page.getByRole("alert")).toHaveText("Payment saved.");
  await expect(field(page, "Shop Name")).toHaveValue(
    "Draft kept after payment",
  );
  await button(page, "Update Shop").click();
  await expect(page.getByRole("alert")).toHaveText("Shop updated.");
  await page.goto("/?screen=shop-details");
  await expect(
    page.getByText("Draft kept after payment", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page
      .getByText("Outstanding Rent", { exact: true })
      .filter({ visible: true })
      .first()
      .locator(".."),
  ).toContainText("AFN 700");
});

test("closing a month blocks receipt reversal until reopened and keeps the correction in history", async ({
  page,
}) => {
  await setup(page);
  await addShop(page, "2026-09-01");
  await button(page, "Collect Rent").click();
  await field(page, "Payment Amount").fill("300");
  await field(page, "Payment Date").fill("2026-09-20");
  await button(page, "Save Payment").click();
  await expect(page.getByRole("alert")).toHaveText("Payment saved.");
  await page.goto("/?screen=month-closing");
  await expect(button(page, "Close Month")).toBeDisabled();
  await button(page, "Previous month").click();
  await button(page, "Close Month").click();
  await expect(page.getByRole("alert")).toHaveText("Month closed.");
  async function reverse() {
    await page.goto("/?screen=rent-history");
    await button(page, "Correct a Payment").click();
    await button(page, "Select Payment").click();
    await page.getByRole("menuitem", { name: /2026-09-20.*AFN 300/ }).click();
    await field(page, "Reversal Reason").fill("Duplicate entry");
    await button(page, "Reverse Transaction").click();
    await button(page, "Confirm Reversal").click();
  }
  await reverse();
  await expect(page.getByRole("alert")).toContainText("closed");
  await page.goto("/?screen=month-closing");
  await button(page, "Previous month").click();
  await button(page, "Reopen Month").click();
  await expect(page.getByRole("alert")).toHaveText("Month reopened.");
  await reverse();
  await expect(page.getByRole("alert")).toHaveText("Payment reversed.");
  await page.goto("/?screen=shop-details");
  await expect(
    page.getByText("Outstanding Rent", { exact: true }).first().locator(".."),
  ).toContainText("AFN 2,000");
  await page.goto("/?screen=rent-history");
  await expect(
    page.getByText("Reversed Payment", { exact: true }),
  ).toBeVisible();
});

test("rate changes, departure, archive and restore retain historical rent after reopening the app", async ({
  page,
}) => {
  await setup(page);
  await addShop(page);
  await button(page, "Change Rent").click();
  await field(page, "New Rent").fill("2000");
  await button(page, "Save Changes").click();
  await expect(page.getByRole("alert")).toHaveText("Tenancy updated.");
  await button(page, "Back").click();
  await expect(
    page
      .getByText("Outstanding Rent", { exact: true })
      .filter({ visible: true })
      .first()
      .locator(".."),
  ).toContainText("AFN 1,484");
  await button(page, "End Tenancy").click();
  await page
    .getByRole("switch", { name: "Mark as Vacant", exact: true })
    .click();
  await button(page, "Save Changes").click();
  await expect(page.getByRole("alert")).toHaveText("Tenancy updated.");
  await button(page, "Back").click();
  await expect(
    page
      .getByText("Outstanding Rent", { exact: true })
      .filter({ visible: true })
      .first()
      .locator(".."),
  ).toContainText("AFN 581");
  await button(page, "Archive").click();
  await expect(page.getByRole("alert")).toHaveText(
    "Shop archived. Its history is preserved.",
  );
  await page.getByRole("tab", { name: "Settings", exact: true }).click();
  await button(page, "Data Management").click();
  await button(page, "Restore Shop").click();
  await expect(page.getByRole("alert")).toHaveText("Shop restored.");
  await page.clock.setFixedTime(new Date("2026-11-17T10:00:00Z"));
  await page.goto("/?screen=shop-details");
  await expect(
    page
      .getByText("Outstanding Rent", { exact: true })
      .filter({ visible: true })
      .first()
      .locator(".."),
  ).toContainText("AFN 581");
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

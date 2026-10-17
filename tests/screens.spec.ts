import { test, expect } from "@playwright/test";

test("main tabs navigate and shop search/filter work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Good Morning!", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Shops", exact: true }).click();
  await expect(page.getByText("Manage Your Shops with Ease")).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search shops", exact: true })
    .fill("Bilal");
  await expect(
    page.getByRole("button", { name: /Shop #02 Bilal Electronics/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Shop #01 Al Noor General Store/ }),
  ).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Search shops", exact: true })
    .fill("");
  await page.getByRole("button", { name: /^Vacant \(/ }).click();
  await expect(
    page.getByRole("button", { name: /Shop #04 Karim Tailor/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Shop #02 Bilal Electronics/ }),
  ).toHaveCount(0);
  await page.getByRole("tab", { name: "Spend", exact: true }).click();
  await expect(page.getByText("Recent Spending Transactions")).toBeVisible();
  await page.getByRole("tab", { name: "Reports", exact: true }).click();
  await expect(page.getByText("Cash Collection Trend")).toBeVisible();
});

test("expense form validates then updates preview spend total", async ({
  page,
}) => {
  await page.goto("/?screen=spend");
  await page.getByRole("button", { name: "Add Expense", exact: true }).click();
  await page.getByLabel("Amount", { exact: true }).fill("-1");
  await page.getByRole("button", { name: "Save Expense", exact: true }).click();
  await expect(
    page.getByText("Enter a positive whole-AFN amount and description."),
  ).toBeVisible();
  await page.getByLabel("Amount", { exact: true }).fill("500");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Screen verification expense");
  await page.getByRole("button", { name: "Save Expense", exact: true }).click();
  await expect(
    page.getByText("Screen verification expense", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("AFN 93,000", { exact: true })).toBeVisible();
});

test("language switches instantly and preference survives reload", async ({
  page,
}) => {
  await page.goto("/?screen=language");
  await page.getByRole("button", { name: /پښتو.*پښتو/s }).click();
  await page.getByRole("button", { name: "Save & Apply", exact: true }).click();
  await expect(page.getByText("ژبه", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("ژبه", { exact: true })).toBeVisible();
});

test("theme switches and stays set after reload", async ({ page }) => {
  await page.goto("/?screen=settings");
  await page.getByRole("button", { name: "Appearance", exact: true }).click();
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(page.getByText("Dark⌄")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Dark⌄")).toBeVisible();
});

test("small viewport forms have no page overflow and save action stays accessible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/?screen=add-shop");
  await expect(
    page.getByRole("button", { name: "Save Shop", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Save Shop", exact: true }).click();
  await expect(
    page
      .getByTestId("screen-scroll")
      .getByText("Shop number is required", { exact: true }),
  ).toBeVisible();
});

test("transfer action clearly identifies the disconnected service", async ({
  page,
}) => {
  await page.goto("/?screen=device-transfer");
  await page
    .getByRole("button", { name: "Start Transfer", exact: true })
    .click();
  await expect(
    page.getByText(
      "Local-network transfer is not connected. These are sample devices; no data was sent.",
    ),
  ).toBeVisible();
});

test("shop deletion requires confirmation and updates both shop lists", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?screen=shops");
  await page
    .getByRole("button", { name: /Shop #01 Al Noor General Store/ })
    .click();
  await page.getByRole("button", { name: "Delete Shop", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Delete this shop?" });
  await expect(
    dialog.getByText("Shop #01 · Al Noor General Store", { exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText("Shop Details", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Delete Shop", exact: true }).click();
  await dialog
    .getByRole("button", { name: "Delete Shop", exact: true })
    .click();
  await expect(page.getByText("Manage Your Shops with Ease")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Shop #01 Al Noor General Store/ }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /Shop #02 Bilal Electronics/ }),
  ).toBeVisible();
  await expect(
    page
      .getByText("Total Shops", { exact: true })
      .locator("..")
      .getByText("5", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Collect", exact: true }).click();
  await expect(
    page
      .getByRole("button")
      .filter({ has: page.getByText("Shop 01", { exact: true }) }),
  ).toHaveCount(0);
  await expect(
    page
      .getByRole("button")
      .filter({ has: page.getByText("Shop 02", { exact: true }) }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("deleting the last shop leaves a working empty shops screen", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?screen=shops");
  for (let id = 1; id <= 6; id++) {
    await page
      .getByRole("button", { name: new RegExp(`Shop #0${id} `) })
      .click();
    await page
      .getByRole("button", { name: "Delete Shop", exact: true })
      .click();
    await page
      .getByRole("dialog", { name: "Delete this shop?" })
      .getByRole("button", { name: "Delete Shop", exact: true })
      .click();
    await expect(page.getByText("Manage Your Shops with Ease")).toBeVisible();
  }
  await expect(
    page
      .getByText("Total Shops", { exact: true })
      .locator("..")
      .getByText("0", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "All (0)", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Add Shop", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("editing a shop updates every section without replacing its identity or payments", async ({
  page,
}) => {
  await page.goto("/?screen=shops");
  await page
    .getByRole("button", { name: /Shop #02 Bilal Electronics/ })
    .click();
  await page.getByRole("button", { name: "Edit Shop", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Shop Number", exact: true }),
  ).toHaveValue("02");
  await expect(
    page.getByRole("textbox", { name: "Shop Name", exact: true }),
  ).toHaveValue("Bilal Electronics");
  await expect(
    page.getByRole("textbox", { name: "Address", exact: true }),
  ).toHaveValue("Main Boulevard, Kabul");
  await expect(
    page.getByRole("textbox", { name: "Start Date", exact: true }),
  ).toHaveValue("2024-01-01");
  await expect(
    page.getByRole("textbox", {
      name: "Available Construction Credit (AFN)",
      exact: true,
    }),
  ).toHaveValue("45000");
  const values = {
    "Shop Number": "A-12",
    "Shop Name": "Updated Electronics",
    "Shopkeeper Name": "Bilal Updated",
    "Phone Number": "0709 123456",
    Address: "Second Floor, Kabul",
    "Monthly Rent (AFN)": "30000",
    "Start Date": "2026-04-12",
    "Available Construction Credit (AFN)": "60000",
    "Notes (Optional)": "Renovation and updated rental agreement.",
  };
  for (const [label, value] of Object.entries(values))
    await page.getByRole("textbox", { name: label, exact: true }).fill(value);
  await page.getByRole("button", { name: "Vacant", exact: true }).click();
  await page.getByRole("button", { name: "Update Shop", exact: true }).click();
  await expect(page.getByText("Shop Details", { exact: true })).toBeVisible();
  const detail = page
    .getByTestId("screen-scroll")
    .filter({ has: page.getByText("Shop Information", { exact: true }) });
  await expect(
    detail.getByText("Shop #A-12", { exact: true }).first(),
  ).toBeVisible();
  await expect(detail.getByText(values.Address, { exact: true })).toBeVisible();
  await expect(
    detail.getByText(values["Notes (Optional)"], { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit Shop", exact: true }).click();
  for (const [label, value] of Object.entries(values))
    await expect(
      page.getByRole("textbox", { name: label, exact: true }),
    ).toHaveValue(value);
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Collect Rent", exact: true }).click();
  const collection = page.getByTestId("screen-scroll").filter({
    has: page.getByRole("textbox", { name: "Payment Amount", exact: true }),
  });
  await expect(
    collection.getByText("Shop #A-12", { exact: true }),
  ).toBeVisible();
  await expect(
    collection
      .getByText("Previously Settled", { exact: true })
      .locator("..")
      .getByText("AFN 15,000", { exact: true }),
  ).toBeVisible();
});

test("edit validates duplicate numbers, credit, and dates without partial writes", async ({
  page,
}) => {
  await page.goto("/?screen=shops");
  await page
    .getByRole("button", { name: /Shop #02 Bilal Electronics/ })
    .click();
  await page.getByRole("button", { name: "Edit Shop", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Shop Number", exact: true })
    .fill("Shop #01");
  await page.getByRole("button", { name: "Update Shop", exact: true }).click();
  await expect(
    page
      .getByText("That shop number already exists. Choose a unique number.", {
        exact: true,
      })
      .first(),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Shop Number", exact: true })
    .fill("02");
  await page
    .getByRole("textbox", {
      name: "Available Construction Credit (AFN)",
      exact: true,
    })
    .fill("-1");
  await page.getByRole("button", { name: "Update Shop", exact: true }).click();
  await expect(
    page
      .getByText("Credit must be a nonnegative whole-AFN amount.", {
        exact: true,
      })
      .first(),
  ).toBeVisible();
  await page
    .getByRole("textbox", {
      name: "Available Construction Credit (AFN)",
      exact: true,
    })
    .fill("45000");
  await page
    .getByRole("textbox", { name: "Start Date", exact: true })
    .fill("2026-02-30");
  await page.getByRole("button", { name: "Update Shop", exact: true }).click();
  await expect(
    page
      .getByText("Use a valid YYYY-MM-DD start date.", { exact: true })
      .first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Edit Shop", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Shop Number", exact: true }),
  ).toHaveValue("02");
  await expect(
    page.getByRole("textbox", {
      name: "Available Construction Credit (AFN)",
      exact: true,
    }),
  ).toHaveValue("45000");
  await expect(
    page.getByRole("textbox", { name: "Start Date", exact: true }),
  ).toHaveValue("2024-01-01");
  await page.getByRole("button", { name: "Update Shop", exact: true }).click();
  await expect(page.getByText("Shop Details", { exact: true })).toBeVisible();
});

test("new shops retain address, date, credit and notes when edited", async ({
  page,
}) => {
  await page.goto("/?screen=shops");
  await page.getByRole("button", { name: "Add Shop", exact: true }).click();
  const values = {
    "Shop Number": "07",
    "Shop Name": "Fresh Market",
    "Shopkeeper Name": "Sara Noor",
    "Phone Number": "0700 654321",
    Address: "North Market, Kabul",
    "Monthly Rent (AFN)": "12000",
    "Start Date": "2026-03-16",
    "Initial Construction Credit (AFN)": "10000",
    "Notes (Optional)": "Opening agreement for the new shop.",
  };
  for (const [label, value] of Object.entries(values))
    await page.getByRole("textbox", { name: label, exact: true }).fill(value);
  await page.getByRole("button", { name: "Save Shop", exact: true }).click();
  await page.getByRole("button", { name: /Shop #07 Fresh Market/ }).click();
  await page.getByRole("button", { name: "Edit Shop", exact: true }).click();
  for (const [label, value] of Object.entries(values))
    await expect(
      page.getByRole("textbox", {
        name: label.replace("Initial Construction", "Available Construction"),
        exact: true,
      }),
    ).toHaveValue(value);
});

test("shop information edit opens the full form", async ({ page }) => {
  await page.goto("/?screen=shop-details");
  await page
    .getByText("Shop Information", { exact: true })
    .locator("..")
    .getByRole("button", { name: "Edit", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Shop Name", exact: true }),
  ).toHaveValue("Al Noor General Store");
  await expect(
    page.getByText("Financial Details", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Additional Notes", { exact: true }),
  ).toBeVisible();
});

for (const [screen, button] of [
  ["shopkeeper", "Edit"],
  ["design-system", "Edit Shop"],
]) {
  test(`${screen} edit opens the same full shop form`, async ({ page }) => {
    await page.goto(`/?screen=${screen}`);
    await page.getByRole("button", { name: button, exact: true }).click();
    await expect(
      page.getByRole("textbox", { name: "Shop Number", exact: true }),
    ).toHaveValue("01");
    await expect(
      page.getByRole("button", { name: "Update Shop", exact: true }),
    ).toBeVisible();
  });
}

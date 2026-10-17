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
  await page.getByRole("button", { name: "Vacant (6)", exact: true }).click();
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
    page.getByText("Shop number is required", { exact: true }),
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

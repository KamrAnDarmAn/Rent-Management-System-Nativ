import { expect, test, type Page } from "@playwright/test";

async function fixedDate(page: Page) {
  await page.clock.setFixedTime(new Date("2026-10-17T10:00:00Z"));
}
const textbox = (page: Page, name: string) =>
  page.getByRole("textbox", { name, exact: true });
const button = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true });
const detail = (page: Page) =>
  page
    .getByTestId("screen-scroll")
    .filter({ has: page.getByText("Shop Information", { exact: true }) });

test("add prepaid shop shows a distinct tag, automatic coverage, and prefilled editing", async ({
  page,
}) => {
  await fixedDate(page);
  await page.goto("/?screen=shops");
  await button(page, "Add Shop").click();
  await expect(textbox(page, "Advance Rent Received (AFN)")).toHaveCount(0);
  const values = {
    "Shop Number": "07",
    "Shop Name": "Prepaid Market",
    "Shopkeeper Name": "Ali",
    "Phone Number": "0700 123456",
    "Monthly Rent (AFN)": "1000",
    "Start Date": "2026-08-01",
    "Initial Construction Credit (AFN)": "7000",
  };
  for (const [label, value] of Object.entries(values))
    await textbox(page, label).fill(value);
  await button(page, "Prepaid").click();
  await textbox(page, "Advance Rent Received (AFN)").fill("4000");
  await textbox(page, "Advance Start Date").fill("2026-08-01");
  await button(page, "Save Shop").click();
  await button(page, "Prepaid (1)").click();
  const card = page.getByRole("button", { name: /Shop #07 Prepaid Market/ });
  await expect(card.getByText("Prepaid", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Shop #01 Al Noor/ }),
  ).toHaveCount(0);
  await card.click();
  const screen = detail(page);
  for (const [label, value] of [
    ["Advance Received", "AFN 4,000"],
    ["Applied to Rent", "AFN 3,000"],
    ["Advance Remaining", "AFN 1,000"],
    ["Available Credit", "AFN 7,000"],
    ["Full months covered", "4"],
    ["Full months remaining", "1"],
    ["Cash payments start", "2026-12-01"],
  ])
    await expect(
      screen
        .getByText(label, { exact: true })
        .locator("..")
        .getByText(value, { exact: true }),
    ).toBeVisible();
  await button(page, "Collect Rent").click();
  await expect(
    page.getByText("No cash payment is due for this rental period.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(button(page, "Save Payment")).toBeDisabled();
  await button(page, "Back").click();
  await button(page, "Edit Shop").click();
  await expect(textbox(page, "Advance Rent Received (AFN)")).toHaveValue(
    "4000",
  );
  await expect(textbox(page, "Advance Start Date")).toHaveValue("2026-08-01");
  await textbox(page, "Advance Rent Received (AFN)").fill("4500");
  await button(page, "Update Shop").click();
  await expect(
    detail(page)
      .getByText("Advance Remaining")
      .locator("..")
      .getByText("AFN 1,500", { exact: true }),
  ).toBeVisible();
});

test("a partial final advance permits only the unpaid remainder to be collected", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-17T10:00:00Z") });
  await page.goto("/?screen=shops");
  await page.getByRole("button", { name: /Shop #03 Zahid Mobile/ }).click();
  await button(page, "Edit Shop").click();
  await textbox(page, "Monthly Rent (AFN)").fill("1000");
  await button(page, "Prepaid").click();
  await textbox(page, "Advance Rent Received (AFN)").fill("4500");
  await textbox(page, "Advance Start Date").fill("2026-06-01");
  await button(page, "Update Shop").click();
  await expect(
    detail(page)
      .getByText("Outstanding Rent", { exact: true })
      .locator("..")
      .getByText("AFN 500", { exact: true }),
  ).toBeVisible();
  await button(page, "Collect Rent").click();
  await textbox(page, "Payment Amount").fill("501");
  await button(page, "Save Payment").click();
  await expect(
    page.getByText(
      "Enter a positive amount no greater than the remaining rent.",
    ),
  ).toBeVisible();
  await textbox(page, "Payment Amount").fill("500");
  await button(page, "Save Payment").click();
  await expect(
    detail(page)
      .getByText("Outstanding Rent", { exact: true })
      .locator("..")
      .getByText("AFN 0", { exact: true }),
  ).toBeVisible();
  await button(page, "Collect Rent").click();
  await expect(button(page, "Save Payment")).toBeDisabled();
  await page.clock.setSystemTime(new Date("2026-11-17T10:00:00Z"));
  await page.clock.runFor(60_001);
  const current = page
    .getByTestId("screen-scroll")
    .filter({ has: page.getByText("Current rental period", { exact: true }) });
  await expect(
    current
      .getByText("Remaining Balance", { exact: true })
      .locator("..")
      .getByText("AFN 1,000", { exact: true }),
  ).toBeVisible();
  await expect(button(page, "Save Payment")).toBeEnabled();
});

test("prepaid form rejects invalid advances and dates and can return to monthly rent", async ({
  page,
}) => {
  await fixedDate(page);
  await page.goto("/?screen=edit-shop");
  await button(page, "Prepaid").click();
  await textbox(page, "Advance Rent Received (AFN)").fill("-1");
  await textbox(page, "Advance Start Date").fill("2026-02-30");
  await button(page, "Update Shop").click();
  await expect(
    page
      .getByText("Enter a positive whole-AFN advance.", { exact: true })
      .first(),
  ).toBeVisible();
  await expect(
    page.getByText("Use a valid YYYY-MM-DD advance start date.", {
      exact: true,
    }),
  ).toBeVisible();
  await textbox(page, "Advance Rent Received (AFN)").fill("4000");
  await textbox(page, "Advance Start Date").fill("2023-12-01");
  await button(page, "Update Shop").click();
  await expect(
    page
      .getByText("Advance cannot start before the tenancy start date.", {
        exact: true,
      })
      .first(),
  ).toBeVisible();
  await button(page, "Monthly").click();
  await expect(textbox(page, "Advance Rent Received (AFN)")).toHaveCount(0);
  await button(page, "Update Shop").click();
  await expect(
    detail(page).getByText("Prepaid Rent", { exact: true }),
  ).toHaveCount(0);
});

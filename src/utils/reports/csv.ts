import type { RentReport } from "../../domain/reports";
import { formatRentMonth } from "../calendar";

type Cell = string | number | bigint;
export function csvCell(value: Cell) {
  let text = String(value);
  if (typeof value === "string" && /^[=+@\-\t\r\n]/.test(text))
    text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
export function reportCsv(
  report: RentReport,
  t: (key: string) => string,
  language: string,
) {
  const rows: Cell[][] = [
    [t("Reports"), report.start, report.end, t("Exclusive end date")],
    [t("Metric"), t("Amount (AFN)")],
    ...(
      [
        ["Expected Rent", report.expected],
        ["Settled Rent", report.settled],
        ["Payments Received", report.received],
        ["Cash Collected", report.cash],
        ["Other-Method Collections", report.other],
        ["Total Expenses", report.expenses],
        ["Paid Expenses", report.spent],
        ["Unpaid Expenses", report.unpaidExpenses],
        ["Net Cash Flow", report.net],
        ["Outstanding Rent", report.outstanding],
        ["Previous Months Due", report.arrears],
        ["Credits Applied", report.credits],
        ["Advance Applied", report.prepaid],
        ["Goods Taken", report.goodsTaken],
        ["Goods Rent Deduction", report.goodsOffsets],
      ] as const
    ).map(([label, value]) => [t(label), value]),
    [],
    [t("Monthly Summary")],
    [
      t("Month"),
      t("Received"),
      t("Paid Expenses"),
      t("Net Cash Flow"),
      t("Expected Rent"),
      t("Settled Rent"),
    ],
    ...report.series.map((point) => [
      formatRentMonth(point.start, report.calendar, language),
      ...(point.hasData
        ? [
            point.received,
            point.spent,
            point.net,
            point.expected,
            point.settled,
          ]
        : [t("No recorded data for this month.")]),
    ]),
    [],
    [t("Shop Performance")],
    [
      t("Shop Number"),
      t("Shop Name"),
      t("Shopkeeper Name"),
      t("Expected Rent"),
      t("Settled Rent"),
      t("Payments Received"),
      t("Outstanding Rent"),
    ],
    ...report.shops.map((row) => [
      row.shop.number,
      row.shop.name,
      row.shop.keeper,
      row.expected,
      row.settled,
      row.received,
      row.outstanding,
    ]),
    [],
    [t("Expenses by Category")],
    [t("Category"), t("Amount (AFN)")],
    ...report.categories.map((row) => [t(row.label), row.value]),
  ];
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
}

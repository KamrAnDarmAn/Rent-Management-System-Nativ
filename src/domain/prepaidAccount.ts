import type { Shop } from "../types/shop";
import { calendarMonthDifference } from "../utils/calendar";
import { rentAccount } from "./rentAccount";
import {
  periodRentCharge,
  prepaidSummary,
  rentalPeriod,
  rentDueDate,
} from "./rentSchedule";

/** Display/forecast the original advance using the same ledger as collections.
 * Existing credit offsets and effective rent changes must not disagree with it. */
export function prepaidAccountSummary(shop: Shop, asOf: string) {
  const plan = shop.prepaidRent;
  if (!plan) return null;
  const calendar = shop.rentCalendar ?? plan.calendar ?? "gregorian";
  const base = prepaidSummary(
    { ...plan, calendar, tenancyStartDate: shop.startDate },
    asOf,
  );
  if (!base) return null;
  const account = rentAccount(shop, asOf);
  const minimum = Math.min(
    shop.initialRent ?? shop.rent,
    shop.rent,
    ...(shop.rentRates ?? []).map((r) => r.amount),
  );
  const firstOffset = Math.max(
    0,
    calendarMonthDifference(shop.startDate, plan.startDate, calendar),
  );
  const fixed = Object.keys(shop.prepaidPayments ?? {}).length;
  // One partially charged first month plus any explicitly settled periods.
  const lastOffset = firstOffset + Math.ceil(plan.amount / minimum) + fixed + 2;
  let projected;
  try {
    projected = rentAccount(
      shop,
      rentDueDate(shop.startDate, lastOffset, calendar),
    );
  } catch {
    return {
      ...base,
      applied: account.prepaidApplied,
      remaining: account.prepaidRemaining,
    };
  }
  const rows = projected.prepaidPeriods;
  const full = rows.filter((row) => row.prepaidApplied === row.charge);
  const partial = rows.find((row) => row.prepaidApplied < row.charge);
  const future = rows.filter((row) => row.date > asOf);
  const firstCash = projected.periods.find(
    (row) =>
      row.date >= rentDueDate(shop.startDate, firstOffset, calendar) &&
      row.due > 0,
  );
  const current = rentalPeriod(shop.startDate, asOf, calendar).dueDate;
  const currentRow = current
    ? account.periods.find((r) => r.date === current)
    : undefined;
  return {
    ...base,
    applied: account.prepaidApplied,
    remaining: account.prepaidRemaining,
    currentApplied: currentRow?.prepaidApplied ?? 0,
    currentCharge: currentRow?.charge ?? 0,
    installments: rows.length,
    fullMonths: full.length,
    partialAmount: partial?.prepaidApplied ?? 0,
    coveredPayments: account.prepaidPeriods.length,
    remainingFullMonths: future.filter((r) => r.prepaidApplied === r.charge)
      .length,
    remainingPartialAmount:
      future.find((r) => r.prepaidApplied < r.charge)?.prepaidApplied ?? 0,
    firstCharge: periodRentCharge(
      shop,
      rentDueDate(shop.startDate, firstOffset, calendar),
    ),
    lastCoveredDate: rows.at(-1)?.date ?? base.lastCoveredDate,
    firstCashDueDate:
      firstCash?.date ??
      (shop.tenancyEndDate || shop.archivedAt ? "—" : base.firstCashDueDate),
    nextApplication: future[0]?.date ?? null,
  };
}

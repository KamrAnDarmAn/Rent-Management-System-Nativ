import { type RentCalendar, type Shop, type ShopStatus } from "../types/shop";
import {
  addCalendarMonths,
  calendarMonthDifference,
  calendarParts,
  calendarMonthStart,
  validIsoDate,
} from "../utils/calendar";

export function kabulDate(now = new Date()): string {
  return new Date(now.getTime() + 270 * 60000).toISOString().slice(0, 10);
}

export function validDate(value: string): boolean {
  return validIsoDate(value);
}

// Gregorian agreements keep anniversaries. Shamsi recurring charges fall on the 1st.
export function rentDueDate(
  start: string,
  offset: number,
  calendar: RentCalendar = "gregorian",
): string {
  if (calendar === "shamsi")
    return offset === 0
      ? start
      : addCalendarMonths(
          calendarMonthStart(start, calendar),
          offset,
          calendar,
        );
  return addCalendarMonths(start, offset, calendar);
}

export function firstRentCharge(
  rent: number,
  start: string,
  calendar: RentCalendar = "gregorian",
) {
  if (calendar !== "shamsi") return rent;
  const first = calendarMonthStart(start, calendar);
  const next = addCalendarMonths(first, 1, calendar);
  const days =
    (Date.parse(`${next}T00:00:00Z`) - Date.parse(`${first}T00:00:00Z`)) /
    86400000;
  const remaining =
    (Date.parse(`${next}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) /
    86400000;
  return Number(
    (BigInt(rent) * BigInt(remaining) * 2n + BigInt(days)) /
      (BigInt(days) * 2n),
  );
}

export function periodRentCharge(shop: Shop, period: string) {
  if (shop.initialRent !== undefined || shop.tenancyEndDate) {
    if (shop.tenancyEndDate && period > shop.tenancyEndDate) return 0;
    const calendar = shop.rentCalendar ?? "gregorian";
    const offset = calendarMonthDifference(shop.startDate, period, calendar);
    const end = rentDueDate(shop.startDate, offset + 1, calendar);
    const start =
      period === shop.startDate && calendar === "shamsi"
        ? calendarMonthStart(period, calendar)
        : period;
    const days = Math.round(
      (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) /
        86400000,
    );
    const rates = [...(shop.rentRates ?? [])].sort((a, b) =>
      a.effective.localeCompare(b.effective),
    );
    let total = 0n;
    for (
      let time = Date.parse(`${period}T00:00:00Z`);
      time < Date.parse(`${end}T00:00:00Z`);
      time += 86400000
    ) {
      const day = new Date(time).toISOString().slice(0, 10);
      if (shop.tenancyEndDate && day > shop.tenancyEndDate) break;
      const rate =
        rates.filter((r) => r.effective <= day).at(-1)?.amount ??
        shop.initialRent ??
        shop.rent;
      total += BigInt(rate);
    }
    return Number((total * 2n + BigInt(days)) / (BigInt(days) * 2n));
  }
  return period === shop.startDate
    ? firstRentCharge(shop.rent, shop.startDate, shop.rentCalendar)
    : shop.rent;
}

export function rentalPeriod(
  start: string,
  asOf: string,
  calendar: RentCalendar = "gregorian",
) {
  if (asOf < start) return { dueDate: null, nextDueDate: start, offset: -1 };
  const difference = calendarMonthDifference(start, asOf, calendar);
  const offset =
    difference - (asOf < rentDueDate(start, difference, calendar) ? 1 : 0);
  return {
    dueDate: rentDueDate(start, offset, calendar),
    nextDueDate: rentDueDate(start, offset + 1, calendar),
    offset,
  };
}

export function prepaidSummary(
  plan: NonNullable<Shop["prepaidRent"]>,
  asOf = kabulDate(),
) {
  const { amount, monthlyRent: rent, startDate, calendar = "gregorian" } = plan;
  if (
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    !Number.isSafeInteger(rent) ||
    rent <= 0 ||
    !validDate(startDate) ||
    !validDate(asOf)
  )
    return null;
  let firstCharge: number;
  try {
    const firstTenancyMonth =
      !plan.tenancyStartDate ||
      calendarMonthDifference(plan.tenancyStartDate, startDate, calendar) === 0;
    firstCharge = firstTenancyMonth
      ? firstRentCharge(rent, plan.tenancyStartDate ?? startDate, calendar)
      : rent;
  } catch {
    return null;
  }
  const fullMonths =
    amount < firstCharge ? 0 : 1 + Math.floor((amount - firstCharge) / rent);
  const partialAmount =
    amount < firstCharge ? amount : (amount - firstCharge) % rent;
  const installments = fullMonths + (partialAmount ? 1 : 0);
  let monthOffset: number;
  try {
    const { year, month } = calendarParts(startDate, calendar);
    const maxYear = calendar === "shamsi" ? 3177 : 9999;
    if (installments > (maxYear - year) * 12 + 12 - month) return null;
    monthOffset = calendarMonthDifference(startDate, asOf, calendar);
  } catch {
    return null;
  }
  const elapsed =
    asOf < startDate
      ? 0
      : monthOffset +
        (asOf >= rentDueDate(startDate, monthOffset, calendar) ? 1 : 0);
  const coveredPayments = Math.min(elapsed, installments);
  const applied = Math.min(
    amount,
    elapsed ? firstCharge + (elapsed - 1) * rent : 0,
  );
  const remaining = amount - applied;
  const currentDueDate = elapsed
    ? rentDueDate(startDate, elapsed - 1, calendar)
    : null;
  const currentCharge = elapsed === 1 ? firstCharge : rent;
  const currentApplied =
    !elapsed || elapsed > installments
      ? 0
      : Math.min(
          currentCharge,
          Math.max(
            0,
            amount - (elapsed === 1 ? 0 : firstCharge + (elapsed - 2) * rent),
          ),
        );
  const nextApplication =
    elapsed < installments ? rentDueDate(startDate, elapsed, calendar) : null;
  return {
    fullMonths,
    partialAmount,
    installments,
    elapsed,
    coveredPayments,
    applied,
    remaining,
    currentDueDate,
    currentApplied,
    currentCharge,
    firstCharge,
    nextApplication,
    remainingFullMonths: Math.floor(remaining / rent),
    remainingPartialAmount: remaining % rent,
    lastCoveredDate: rentDueDate(startDate, installments - 1, calendar),
    firstCashDueDate: rentDueDate(startDate, fullMonths, calendar),
  };
}

export function rentalTag(shop: Shop) {
  return !shop.occupied
    ? "Vacant"
    : shop.rentalType === "prepaid"
      ? "Prepaid"
      : "Occupied";
}

export function baseRentPosition(shop: Shop, asOf = kabulDate()) {
  const prepaid =
    shop.occupied && shop.rentalType === "prepaid" && shop.prepaidRent
      ? prepaidSummary(
          {
            ...shop.prepaidRent,
            calendar: shop.rentCalendar ?? shop.prepaidRent.calendar,
            tenancyStartDate: shop.startDate,
          },
          asOf,
        )
      : null;
  if (!prepaid) {
    if (shop.rentCalendar) {
      const period = rentalPeriod(shop.startDate, asOf, shop.rentCalendar);
      const paid = period.dueDate
        ? (shop.rentPayments?.[period.dueDate] ?? 0) +
          (shop.openingRentPeriod === period.dueDate || !shop.openingRentPeriod
            ? shop.paid
            : 0)
        : 0;
      const charge = period.dueDate
        ? periodRentCharge(shop, period.dueDate)
        : 0;
      const due = Math.max(0, charge - paid);
      const status: ShopStatus = !due
        ? "Paid"
        : paid > 0
          ? "Partial"
          : period.dueDate && period.dueDate < asOf
            ? "Overdue"
            : "Unpaid";
      return { prepaid: null, paid, due, status, charge };
    }
    return {
      prepaid: null,
      paid: shop.paid,
      due: Math.max(0, shop.rent - shop.paid),
      status: shop.status,
      charge: shop.rent,
    };
  }
  const cash = prepaid.currentDueDate
    ? (shop.prepaidPayments?.[prepaid.currentDueDate] ?? 0)
    : 0;
  const paid = prepaid.currentApplied + cash;
  const due = prepaid.elapsed ? Math.max(0, prepaid.currentCharge - paid) : 0;
  const status: ShopStatus =
    due === 0 ? "Paid" : paid > 0 ? "Partial" : "Unpaid";
  return { prepaid, paid, due, status, charge: prepaid.currentCharge };
}

/** The displayed monthly rate can differ from a future scheduled rate. */
export function monthlyRentAt(shop: Shop, date = kabulDate()) {
  return (
    [...(shop.rentRates ?? [])]
      .sort((a, b) => a.effective.localeCompare(b.effective))
      .filter((r) => r.effective <= date)
      .at(-1)?.amount ??
    shop.initialRent ??
    shop.rent
  );
}

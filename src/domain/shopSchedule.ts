import type { Shop } from "../types/shop";
import { kabulDate, prepaidSummary, rentalPeriod, rentDueDate } from "./rent";
import { calendarMonthDifference } from "../utils/calendar";

/** Carry current/future settlements to the new schedule without duplicating amounts. */
export function preserveCalendarSettlements(
  shop: Shop,
  changes: Partial<Shop>,
  today = kabulDate(),
): Shop {
  const next = { ...shop, ...changes };
  if ((shop.rentCalendar ?? "gregorian") === (next.rentCalendar ?? "gregorian"))
    return next;
  const oldPeriod = rentalPeriod(
    shop.startDate,
    today,
    shop.rentCalendar,
  ).dueDate;
  const newPeriod = rentalPeriod(
    next.startDate,
    today,
    next.rentCalendar,
  ).dueDate;
  const move = (
    payments: Record<string, number> | undefined,
    from: string | null,
    to: string | null,
    newStart: string,
  ) => {
    if (!payments || !from || !to) return payments;
    const result = { ...payments };
    const currentOffset = rentalPeriod(newStart, to, next.rentCalendar).offset;
    const moves = Object.entries(payments)
      .filter(([date]) => date >= from)
      .map(([date, amount]) => ({
        from: date,
        to: rentDueDate(
          newStart,
          currentOffset +
            calendarMonthDifference(from, date, shop.rentCalendar),
          next.rentCalendar,
        ),
        amount,
      }));
    moves.forEach((move) => delete result[move.from]);
    moves.forEach((move) => {
      result[move.to] = (result[move.to] ?? 0) + move.amount;
    });
    return result;
  };
  next.rentPayments = move(
    shop.rentPayments,
    oldPeriod,
    newPeriod,
    next.startDate,
  );
  if (
    newPeriod &&
    (!shop.openingRentPeriod || shop.openingRentPeriod === oldPeriod)
  )
    next.openingRentPeriod = newPeriod;
  if (shop.prepaidRent && next.prepaidRent) {
    const from =
      prepaidSummary(
        {
          ...shop.prepaidRent,
          calendar: shop.rentCalendar ?? shop.prepaidRent.calendar,
          tenancyStartDate: shop.startDate,
        },
        today,
      )?.currentDueDate ?? null;
    const to =
      prepaidSummary(
        {
          ...next.prepaidRent,
          calendar: next.rentCalendar ?? next.prepaidRent.calendar,
          tenancyStartDate: next.startDate,
        },
        today,
      )?.currentDueDate ?? null;
    next.prepaidPayments = move(
      shop.prepaidPayments,
      from,
      to,
      next.prepaidRent.startDate,
    );
  }
  return next;
}

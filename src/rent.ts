import type { Shop, ShopStatus } from "./types";

export function kabulDate(now = new Date()): string {
  return new Date(now.getTime() + 270 * 60_000).toISOString().slice(0, 10);
}

export function validDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00Z`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    value >= "0001-01-01" &&
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

// Always anchor to the original day: Jan 31 -> Feb 28 -> Mar 31.
export function rentDueDate(start: string, offset: number): string {
  const [year, month, day] = start.split("-").map(Number);
  const index = year * 12 + month - 1 + offset;
  const nextYear = Math.floor(index / 12);
  const nextMonth = (index % 12) + 1;
  const end = new Date(0);
  end.setUTCFullYear(nextYear, nextMonth, 0);
  return `${String(nextYear).padStart(4, "0")}-${String(nextMonth).padStart(2, "0")}-${String(Math.min(day, end.getUTCDate())).padStart(2, "0")}`;
}

export function prepaidSummary(
  plan: NonNullable<Shop["prepaidRent"]>,
  asOf = kabulDate(),
) {
  const { amount, monthlyRent: rent, startDate } = plan;
  if (
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    !Number.isSafeInteger(rent) ||
    rent <= 0 ||
    !validDate(startDate) ||
    !validDate(asOf)
  )
    return null;
  const fullMonths = Math.floor(amount / rent);
  const partialAmount = amount % rent;
  const installments = fullMonths + (partialAmount ? 1 : 0);
  const [startYear, startMonth] = startDate.split("-").map(Number);
  if (installments > (9999 - startYear) * 12 + 12 - startMonth) return null;
  const [year, month] = asOf.split("-").map(Number);
  const monthOffset = (year - startYear) * 12 + month - startMonth;
  const elapsed =
    asOf < startDate
      ? 0
      : monthOffset + (asOf >= rentDueDate(startDate, monthOffset) ? 1 : 0);
  const coveredPayments = Math.min(elapsed, installments);
  const applied = elapsed >= installments ? amount : elapsed * rent;
  const remaining = amount - applied;
  const currentDueDate = elapsed ? rentDueDate(startDate, elapsed - 1) : null;
  const currentApplied =
    !elapsed || elapsed > installments
      ? 0
      : Math.min(rent, amount - (elapsed - 1) * rent);
  const nextApplication =
    elapsed < installments ? rentDueDate(startDate, elapsed) : null;
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
    nextApplication,
    remainingFullMonths: Math.floor(remaining / rent),
    remainingPartialAmount: remaining % rent,
    lastCoveredDate: rentDueDate(startDate, installments - 1),
    firstCashDueDate: rentDueDate(startDate, fullMonths),
  };
}

export function rentalTag(shop: Shop) {
  return !shop.occupied
    ? "Vacant"
    : shop.rentalType === "prepaid"
      ? "Prepaid"
      : "Occupied";
}

export function rentPosition(shop: Shop, asOf = kabulDate()) {
  const prepaid =
    shop.occupied && shop.rentalType === "prepaid" && shop.prepaidRent
      ? prepaidSummary(shop.prepaidRent, asOf)
      : null;
  if (!prepaid)
    return {
      prepaid: null,
      paid: shop.paid,
      due: Math.max(0, shop.rent - shop.paid),
      status: shop.status,
    };
  const cash = prepaid.currentDueDate
    ? (shop.prepaidPayments?.[prepaid.currentDueDate] ?? 0)
    : 0;
  const paid = prepaid.currentApplied + cash;
  const due = prepaid.elapsed
    ? Math.max(0, shop.prepaidRent!.monthlyRent - paid)
    : 0;
  const status: ShopStatus =
    due === 0 ? "Paid" : paid > 0 ? "Partial" : "Unpaid";
  return { prepaid, paid, due, status };
}

import { prepaidAccountSummary } from "./prepaidAccount";
import type { Shop, ShopStatus } from "../types/shop";
import { baseRentPosition, kabulDate, rentalPeriod } from "./rentSchedule";
import { rentAccount } from "./rentAccount";

export {
  kabulDate,
  validDate,
  rentDueDate,
  firstRentCharge,
  periodRentCharge,
  monthlyRentAt,
  rentalPeriod,
  prepaidSummary,
  rentalTag,
} from "./rentSchedule";

// Select an invoice period independently of when its late settlements were received.
export function rentPosition(
  shop: Shop,
  asOf = kabulDate(),
  settledThrough = asOf,
) {
  const base = baseRentPosition(shop, asOf);
  const account = rentAccount(
    shop,
    settledThrough > asOf ? settledThrough : asOf,
  );
  const periods = account.periods.filter((row) => row.date <= asOf);
  const selected = rentalPeriod(
    shop.startDate,
    asOf,
    shop.rentCalendar,
  ).dueDate;
  const row = periods.find((row) => row.date === selected);
  const arrears = periods
    .filter((row) => row.date !== selected)
    .reduce((sum, row) => sum + row.due, 0);
  const paid = row?.paid ?? (shop.rentCalendar ? 0 : base.paid);
  const due = row?.due ?? (shop.rentCalendar ? 0 : base.due);
  const status: ShopStatus =
    arrears > 0
      ? "Overdue"
      : due === 0
        ? base.status === "Settled by Credit"
          ? base.status
          : "Paid"
        : paid > 0
          ? "Partial"
          : base.status;
  return {
    ...base,
    prepaid: base.prepaid ? prepaidAccountSummary(shop, asOf) : null,
    paid,
    due,
    charge: row?.charge ?? (shop.rentCalendar ? 0 : base.charge),
    status,
    totalDue: periods.reduce((sum, row) => sum + row.due, 0),
    arrears,
    advanceBalance: account.advanceBalance,
  };
}

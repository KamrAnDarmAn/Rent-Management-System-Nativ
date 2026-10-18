import type { RentCalendar, Shop } from "../types/shop";
import { normalizeShopNumber } from "../utils/shopNumber";
import { validAmount } from "../utils/validation";
import { prepaidSummary, validDate } from "./rent";
import { supportedCalendarDate } from "../utils/calendar";

export type ShopFormFields = {
  number: string;
  name: string;
  keeper: string;
  phone: string;
  address: string;
  rent: string;
  date: string;
  credit: string;
  notes: string;
  advance: string;
  advanceDate: string;
  ledgerDate: string;
};
export type ShopFormErrors = Partial<Record<keyof ShopFormFields, string>>;

export function validateShopFields(
  fields: ShopFormFields,
  {
    shopId,
    shops,
    rentalType,
    occupied,
    today,
    calendar = "gregorian",
  }: {
    shopId?: number;
    shops: Shop[];
    rentalType: NonNullable<Shop["rentalType"]>;
    occupied: string;
    today: string;
    calendar?: RentCalendar;
  },
) {
  const number = normalizeShopNumber(fields.number);
  const rent = validAmount(fields.rent);
  const credit = fields.credit.trim()
    ? Number(fields.credit.replace(/,/g, ""))
    : 0;
  const date = fields.date.trim();
  const advance = validAmount(fields.advance);
  const advanceDate = fields.advanceDate.trim();
  const ledgerDate = fields.ledgerDate.trim();
  const nextErrors: ShopFormErrors = {};
  if (!number) nextErrors.number = "Shop number is required";
  else if (
    shops.some(
      (s) =>
        s.id !== shopId &&
        normalizeShopNumber(s.number).toLowerCase() === number.toLowerCase(),
    )
  )
    nextErrors.number =
      "That shop number already exists. Choose a unique number.";
  if (!fields.name.trim()) nextErrors.name = "Shop name is required";
  if (!fields.keeper.trim()) nextErrors.keeper = "Shopkeeper name is required";
  if (!fields.phone.trim()) nextErrors.phone = "Phone number is required";
  if (!rent) nextErrors.rent = "Enter a positive whole-AFN rent.";
  if (!Number.isSafeInteger(credit) || credit < 0)
    nextErrors.credit = "Credit must be a nonnegative whole-AFN amount.";
  if (!supportedCalendarDate(date, calendar))
    nextErrors.date =
      calendar === "shamsi"
        ? "Enter a valid Shamsi date, e.g. 1405-07-25."
        : "Use a valid YYYY-MM-DD start date.";
  if (
    !supportedCalendarDate(ledgerDate, calendar) ||
    (validDate(date) && ledgerDate < date)
  )
    nextErrors.ledgerDate =
      "Choose a valid tracking date on or after the tenancy start date.";
  if (rent && validDate(date) && validDate(ledgerDate)) {
    const count = Math.max(
      1,
      (Number(today.slice(0, 4)) - Number(ledgerDate.slice(0, 4)) + 1) * 12,
    );
    if (BigInt(rent) * BigInt(count) > BigInt(Number.MAX_SAFE_INTEGER))
      nextErrors.rent = "Rent total exceeds the supported whole-afghani range.";
  }
  if (rentalType === "prepaid" && occupied === "Occupied") {
    if (!advance) nextErrors.advance = "Enter a positive whole-AFN advance.";
    if (!supportedCalendarDate(advanceDate, calendar))
      nextErrors.advanceDate =
        calendar === "shamsi"
          ? "Enter a valid Shamsi date, e.g. 1405-07-25."
          : "Use a valid YYYY-MM-DD advance start date.";
    else if (validDate(date) && advanceDate < date)
      nextErrors.advanceDate =
        "Advance cannot start before the tenancy start date.";
    if (
      advance &&
      rent &&
      validDate(advanceDate) &&
      !prepaidSummary(
        {
          amount: advance,
          monthlyRent: rent,
          startDate: advanceDate,
          calendar,
          tenancyStartDate: date,
        },
        today,
      )
    )
      nextErrors.advance =
        calendar === "shamsi"
          ? "Advance coverage is outside the supported Shamsi calendar range."
          : "Advance coverage must end before year 10000.";
  }
  return {
    number,
    rent,
    credit,
    date,
    advance,
    advanceDate,
    ledgerDate,
    errors: nextErrors,
  };
}

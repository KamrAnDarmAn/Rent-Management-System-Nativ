import type { Shop } from "../types/shop";
import { kabulDate, validDate } from "./rentSchedule";

/** Money received by its actual payment date, independent of the rent month it settles. */
export function rentCollections(
  shops: readonly Shop[],
  start: string,
  end: string,
  asOf = kabulDate(),
) {
  let cash = 0n;
  let other = 0n;
  const included = (date: string, amount: number) =>
    validDate(date) &&
    date >= start &&
    date < end &&
    date <= asOf &&
    Number.isSafeInteger(amount) &&
    amount > 0;
  for (const shop of shops) {
    const receiptIds = new Set<string>();
    for (const receipt of shop.rentReceipts ?? []) {
      if (receiptIds.has(receipt.id)) continue;
      receiptIds.add(receipt.id);
      if (receipt.reversedAt || !included(receipt.date, receipt.amount))
        continue;
      if (receipt.method === "Cash") cash += BigInt(receipt.amount);
      else other += BigInt(receipt.amount);
    }
    // Older dated cash records predate receipts; new history entries merely mirror them.
    const legacyIds = new Set<string>();
    for (const entry of shop.rentTransactions ?? []) {
      if (
        entry.kind !== "cash" ||
        entry.receiptId !== undefined ||
        receiptIds.has(entry.id) ||
        legacyIds.has(entry.id)
      )
        continue;
      legacyIds.add(entry.id);
      if (included(entry.date, entry.amount)) cash += BigInt(entry.amount);
    }
  }
  return { cash, other, total: cash + other };
}

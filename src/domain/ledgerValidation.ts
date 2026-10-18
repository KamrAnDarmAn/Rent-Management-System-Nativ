import type { LedgerData } from "../types/ledger";
import type { Shop } from "../types/shop";
import { validDate } from "./rentSchedule";
import { rentAccount } from "./rentAccount";

const fail = () => {
  throw new Error("The backup contains invalid or inconsistent records.");
};
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown, required = false): v is string =>
  typeof v === "string" && v.length <= 20000 && (!required || !!v.trim());
const amount = (v: unknown, positive = false): v is number =>
  typeof v === "number" && Number.isSafeInteger(v) && v >= (positive ? 1 : 0);
const date = (v: unknown): v is string =>
  typeof v === "string" &&
  validDate(v) &&
  v >= "1900-01-01" &&
  v <= "2600-12-31";
const calendar = (v: unknown) => v === "gregorian" || v === "shamsi";
function rows(v: unknown, max = 100000): unknown[] {
  if (!Array.isArray(v) || v.length > max) return fail();
  return v;
}
function unique(v: unknown, ids: Set<unknown>) {
  if (ids.has(v)) fail();
  ids.add(v);
}
function optional(v: unknown, predicate: (v: unknown) => boolean) {
  if (v !== undefined && !predicate(v)) fail();
}

/** Used for both commits and imports; no unvalidated backup reaches SQLite. */
export function validateLedger(value: unknown): LedgerData {
  if (
    !object(value) ||
    !text(value.propertyName) ||
    typeof value.setupComplete !== "boolean"
  )
    return fail();
  if (value.setupComplete && !value.propertyName.trim()) fail();
  const shops = [
    ...rows(value.shops, 1000),
    ...rows(value.archivedShops, 1000),
  ];
  const ids = new Set<unknown>(),
    numbers = new Set<unknown>(),
    receiptIds = new Set<unknown>(),
    transactionIds = new Set<unknown>();
  for (const record of shops) {
    if (
      !object(record) ||
      !amount(record.id, true) ||
      !text(record.number, true)
    )
      return fail();
    unique(record.id, ids);
    if (!record.archivedAt)
      unique(record.number.trim().toLocaleLowerCase(), numbers);
    for (const key of ["name", "keeper", "phone", "address", "notes"])
      if (!text(record[key])) fail();
    for (const key of ["rent", "paid", "credit", "image"])
      if (!amount(record[key])) fail();
    if (
      !date(record.startDate) ||
      typeof record.occupied !== "boolean" ||
      !["Paid", "Partial", "Unpaid", "Overdue", "Settled by Credit"].includes(
        String(record.status),
      )
    )
      fail();
    optional(record.rentCalendar, calendar);
    for (const key of [
      "rentLedgerStartDate",
      "openingRentPeriod",
      "tenancyEndDate",
    ])
      optional(record[key], date);
    if (
      record.rentLedgerStartDate &&
      String(record.rentLedgerStartDate) < String(record.startDate)
    )
      fail();
    if (
      record.tenancyEndDate &&
      String(record.tenancyEndDate) < String(record.startDate)
    )
      fail();
    optional(record.rentalType, (v) => v === "monthly" || v === "prepaid");
    optional(record.archivedAt, text);
    optional(record.deletedAt, text);
    optional(record.initialRent, (v) => amount(v, true));
    for (const key of ["rentPayments", "prepaidPayments"])
      if (record[key] !== undefined) {
        if (!object(record[key])) fail();
        for (const [d, a] of Object.entries(
          record[key] as Record<string, unknown>,
        ))
          if (!date(d) || !amount(a)) fail();
      }
    for (const r of rows(record.rentRates ?? []))
      if (!object(r) || !date(r.effective) || !amount(r.amount, true)) fail();
    if (record.prepaidRent !== undefined) {
      const p = record.prepaidRent;
      if (
        !object(p) ||
        !amount(p.amount, true) ||
        !amount(p.monthlyRent, true) ||
        !date(p.startDate)
      )
        fail();
      if (object(p)) {
        optional(p.calendar, calendar);
        optional(p.tenancyStartDate, date);
      }
    }
    const shopReceiptIds = new Set<unknown>();
    for (const r of rows(record.rentReceipts ?? [])) {
      if (
        !object(r) ||
        !text(r.id, true) ||
        !date(r.date) ||
        !amount(r.amount, true) ||
        !["Cash", "Other"].includes(String(r.method))
      )
        fail();
      if (object(r)) {
        unique(r.id, receiptIds);
        shopReceiptIds.add(r.id);
        optional(r.note, text);
        optional(r.reversedAt, text);
        optional(r.reversalReason, text);
      }
    }
    for (const r of rows(record.rentTransactions ?? [])) {
      if (
        !object(r) ||
        !text(r.id, true) ||
        !date(r.date) ||
        !date(r.period) ||
        !amount(r.amount, true) ||
        !["cash", "credit"].includes(String(r.kind)) ||
        !calendar(r.calendar)
      )
        fail();
      if (object(r)) {
        unique(r.id, transactionIds);
        optional(r.note, text);
        optional(r.receiptId, (v) => shopReceiptIds.has(v));
      }
    }
    try {
      rentAccount(record as unknown as Shop);
    } catch {
      fail();
    }
  }
  const expenseIds = new Set<unknown>();
  for (const e of rows(value.expenses)) {
    if (
      !object(e) ||
      !text(e.id, true) ||
      !date(e.date) ||
      !amount(e.amount, true) ||
      !text(e.description, true) ||
      !text(e.category, true)
    )
      fail();
    if (object(e)) {
      unique(e.id, expenseIds);
      optional(e.shopId, (v) => ids.has(v));
      optional(e.notes, text);
      optional(e.settlementFor, (v) => text(v, true));
      if (
        !["Property Expense", "Personal Expense"].includes(String(e.type)) ||
        !["Cash", "Bank Transfer", "Credit", "Other", "Rent Offset"].includes(
          String(e.method),
        )
      )
        fail();
    }
  }
  const goodsIds = new Set<unknown>(),
    settlementIds = new Set<unknown>();
  for (const g of rows(value.goods)) {
    if (
      !object(g) ||
      !text(g.id, true) ||
      !ids.has(g.shopId) ||
      !date(g.date) ||
      !text(g.item, true) ||
      !text(g.unit, true) ||
      !text(g.notes) ||
      !amount(g.amount, true) ||
      !amount(g.unitPrice, true) ||
      typeof g.quantity !== "number" ||
      !Number.isFinite(g.quantity) ||
      g.quantity <= 0 ||
      Math.round(g.quantity * Number(g.unitPrice)) !== g.amount ||
      !["paid", "owed", "offset"].includes(String(g.mode))
    )
      fail();
    if (object(g)) {
      unique(g.id, goodsIds);
      let settled = 0n;
      for (const s of rows(g.settlements)) {
        if (
          !object(s) ||
          !text(s.id, true) ||
          !date(s.date) ||
          !amount(s.amount, true) ||
          !["Cash", "Offset Against Rent"].includes(String(s.method)) ||
          String(s.date) < String(g.date)
        )
          fail();
        if (object(s)) {
          unique(s.id, settlementIds);
          settled += BigInt(s.amount as number);
        }
      }
      if (settled > BigInt(g.amount as number)) fail();
    }
  }
  for (const e of rows(value.expenses)) {
    if (
      object(e) &&
      e.settlementFor !== undefined &&
      !goodsIds.has(e.settlementFor)
    )
      fail();
  }
  const auditIds = new Set<unknown>();
  for (const a of rows(value.audit)) {
    if (
      !object(a) ||
      !text(a.id, true) ||
      !text(a.date, true) ||
      !text(a.action, true)
    )
      fail();
    if (object(a)) {
      unique(a.id, auditIds);
      optional(a.note, text);
      optional(a.shopId, (v) => ids.has(v));
    }
  }
  const locks = new Set<unknown>();
  for (const m of rows(value.closedMonths, 20000)) {
    if (
      !object(m) ||
      !calendar(m.calendar) ||
      !date(m.start) ||
      !date(m.end) ||
      String(m.end) <= String(m.start) ||
      !text(m.closedAt, true)
    )
      fail();
    if (object(m)) unique(`${m.calendar}:${m.start}`, locks);
  }
  // Only data fields may enter the store. Imported keys must never replace
  // Zustand actions, error state or object prototypes during hydration.
  return JSON.parse(
    JSON.stringify({
      propertyName: value.propertyName,
      setupComplete: value.setupComplete,
      shops: value.shops,
      archivedShops: value.archivedShops,
      expenses: value.expenses,
      goods: value.goods,
      audit: value.audit,
      closedMonths: value.closedMonths,
    }),
  ) as LedgerData;
}

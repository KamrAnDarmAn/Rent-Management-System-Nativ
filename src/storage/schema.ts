import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import type { Shop, RentReceipt, RentTransaction } from "../types/shop";
import type { Expense } from "../types/expense";
import type {
  AuditEntry,
  ClosedMonth,
  GoodsEntry,
  LedgerData,
} from "../types/ledger";

// Indexed relational fields stay queryable. Typed JSON preserves the calendar,
// opening balances and agreement details used by the deterministic rent engine.
export const metadata = sqliteTable("metadata", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).$type<string | boolean>().notNull(),
});
export const shops = sqliteTable(
  "shops",
  {
    id: integer("id").primaryKey(),
    number: text("number").notNull(),
    archived: integer("archived", { mode: "boolean" }).notNull(),
    payload: text("payload", { mode: "json" })
      .$type<Omit<Shop, "rentReceipts" | "rentTransactions">>()
      .notNull(),
  },
  (t) => [
    uniqueIndex("active_shop_number")
      .on(sql`${t.number} COLLATE NOCASE`)
      .where(sql`${t.archived}=0`),
    check("shops_archived_valid", sql`${t.archived} IN (0,1)`),
  ],
);
export const rentReceipts = sqliteTable(
  "rent_receipts",
  {
    id: text("id").primaryKey(),
    shopId: integer("shop_id")
      .notNull()
      .references(() => shops.id),
    date: text("date").notNull(),
    amount: integer("amount").notNull(),
    payload: text("payload", { mode: "json" }).$type<RentReceipt>().notNull(),
  },
  (t) => [
    index("receipts_shop_date").on(t.shopId, t.date),
    check("receipts_positive", sql`${t.amount}>0`),
  ],
);
export const rentSettlements = sqliteTable(
  "rent_settlements",
  {
    id: text("id").primaryKey(),
    shopId: integer("shop_id")
      .notNull()
      .references(() => shops.id),
    date: text("date").notNull(),
    amount: integer("amount").notNull(),
    payload: text("payload", { mode: "json" })
      .$type<RentTransaction>()
      .notNull(),
  },
  (t) => [check("settlements_positive", sql`${t.amount}>0`)],
);
export const expenses = sqliteTable(
  "expenses",
  {
    id: text("id").primaryKey(),
    shopId: integer("shop_id").references(() => shops.id),
    date: text("date").notNull(),
    amount: integer("amount").notNull(),
    payload: text("payload", { mode: "json" }).$type<Expense>().notNull(),
  },
  (t) => [
    index("expenses_date").on(t.date),
    check("expenses_positive", sql`${t.amount}>0`),
  ],
);
export const goods = sqliteTable("goods", {
  id: text("id").primaryKey(),
  shopId: integer("shop_id")
    .notNull()
    .references(() => shops.id),
  payload: text("payload", { mode: "json" }).$type<GoodsEntry>().notNull(),
});
export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  payload: text("payload", { mode: "json" }).$type<AuditEntry>().notNull(),
});
export const closedMonths = sqliteTable("closed_months", {
  id: text("id").primaryKey(),
  payload: text("payload", { mode: "json" }).$type<ClosedMonth>().notNull(),
});
export const recoverySnapshots = sqliteTable("recovery_snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: text("created_at").notNull(),
  action: text("action").notNull(),
  payload: text("payload", { mode: "json" }).$type<LedgerData>().notNull(),
});

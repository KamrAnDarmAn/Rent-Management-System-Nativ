import type { Shop, RentCalendar } from "./shop";
import type { Expense } from "./expense";

export type GoodsEntry = {
  id: string;
  shopId: number;
  date: string;
  item: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  mode: "offset" | "owed" | "paid";
  notes: string;
  settlements: {
    id: string;
    date: string;
    amount: number;
    method: "Cash" | "Offset Against Rent";
  }[];
};
export type AuditEntry = {
  id: string;
  date: string;
  action: string;
  shopId?: number;
  note?: string;
};
export type ClosedMonth = {
  calendar: RentCalendar;
  start: string;
  end: string;
  closedAt: string;
};
export type LedgerData = {
  propertyName: string;
  setupComplete: boolean;
  shops: Shop[];
  archivedShops: Shop[];
  expenses: Expense[];
  goods: GoodsEntry[];
  audit: AuditEntry[];
  closedMonths: ClosedMonth[];
};
export const emptyLedger = (): LedgerData => ({
  propertyName: "",
  setupComplete: false,
  shops: [],
  archivedShops: [],
  expenses: [],
  goods: [],
  audit: [],
  closedMonths: [],
});

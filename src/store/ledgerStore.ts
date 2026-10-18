import { create } from "zustand";
import { emptyLedger, type LedgerData, type GoodsEntry } from "../types/ledger";
import { persistLedger } from "../storage/connection";
import { validateLedger } from "../domain/ledgerValidation";
import { kabulDate, rentalPeriod, validDate } from "../domain/rent";
import { preserveCalendarSettlements } from "../domain/shopSchedule";
import type { RentReceipt, Shop } from "../types/shop";
import type { Expense } from "../types/expense";
import {
  receiveRent,
  rentAccount,
  ledgerStartDate,
  type ReceiptResult,
} from "../domain/rentAccount";

export type LedgerState = LedgerData & {
  error: string | null;
  hydrate: (data: LedgerData) => void;
  completeSetup: (name: string) => Promise<boolean>;
  restoreData: (data: LedgerData) => Promise<boolean>;
  setPropertyName: (name: string) => Promise<boolean>;
  collectRent: (id: number, receipt: RentReceipt) => Promise<ReceiptResult>;
  collect: (id: number, amount: number) => Promise<boolean>;
  collectPrepaid: (id: number, amount: number) => Promise<boolean>;
  collectMonthly: (
    id: number,
    amount: number,
    period: string,
    date?: string,
    note?: string,
  ) => Promise<boolean>;
  applyCredit: (
    id: number,
    amount: number,
    period?: string,
  ) => Promise<boolean>;
  addShop: (shop: Shop) => Promise<boolean>;
  updateShop: (id: number, changes: Partial<Shop>) => Promise<boolean>;
  deleteShop: (id: number) => Promise<boolean>;
  archiveShop: (id: number) => Promise<boolean>;
  restoreShop: (id: number) => Promise<boolean>;
  addExpense: (expense: Expense) => Promise<boolean>;
  addGoods: (goods: GoodsEntry) => Promise<boolean>;
  settleGoods: (
    id: string,
    amount: number,
    method: "Cash" | "Offset Against Rent",
    date: string,
  ) => Promise<boolean>;
  addCredit: (id: number, amount: number, note: string) => Promise<boolean>;
  reverseReceipt: (
    shopId: number,
    receiptId: string,
    reason: string,
  ) => Promise<boolean>;
  closeMonth: (
    calendar: "shamsi" | "gregorian",
    start: string,
    end: string,
  ) => Promise<boolean>;
  reopenMonth: (
    calendar: "shamsi" | "gregorian",
    start: string,
  ) => Promise<boolean>;
  reset: () => void;
};

let writeQueue: Promise<unknown> = Promise.resolve();
export async function whenLedgerIdle() {
  await writeQueue;
}

/** Every mutation is durable before Zustand publishes it. */
export const useLedger = create<LedgerState>((rawSet, get) => {
  const set = async (
    change: Partial<LedgerData> | ((state: LedgerState) => Partial<LedgerData>),
    action = "Update ledger",
  ): Promise<boolean> => {
    try {
      const state = get();
      const changes = typeof change === "function" ? change(state) : change;
      if (changes === state) return true;
      const data = ledgerData({ ...state, ...changes });
      data.audit = [
        ...data.audit,
        { id: entryId(), date: new Date().toISOString(), action },
      ];
      await persistLedger(data, action);
      rawSet({ ...data, error: null });
      return true;
    } catch (error) {
      console.error("GMM ledger write failed");
      rawSet({
        error:
          "Could not save your changes. Your saved data is unchanged. Check available storage and try again.",
      });
      return false;
    }
  };
  const editable = (date: string) =>
    !get().closedMonths.some((m) => date >= m.start && date < m.end);
  const reject = (error: string) => {
    rawSet({ error });
    return false;
  };
  const settleFixed = async (
    id: number,
    amount: number,
    period: string,
    kind: "cash" | "credit",
    date = kabulDate(),
    note?: string,
  ) => {
    const shop = get().shops.find((s) => s.id === id);
    if (
      !shop ||
      !validDate(period) ||
      !validDate(date) ||
      date > kabulDate() ||
      period > kabulDate() ||
      !editable(date)
    )
      return reject("Choose an open month and a date no later than today.");
    const due =
      rentAccount(shop).periods.find((p) => p.date === period)?.due ?? 0;
    if (
      !Number.isSafeInteger(amount) ||
      amount <= 0 ||
      amount > due ||
      (kind === "credit" && amount > shop.credit)
    )
      return reject(
        "Choose an amount within available credit and unpaid rent.",
      );
    const map =
      shop.rentalType === "prepaid" ? "prepaidPayments" : "rentPayments";
    const next: Shop = {
      ...shop,
      credit: shop.credit - (kind === "credit" ? amount : 0),
      [map]: { ...shop[map], [period]: (shop[map]?.[period] ?? 0) + amount },
      rentTransactions: [
        ...(shop.rentTransactions ?? []),
        {
          id: entryId(),
          date,
          period,
          amount,
          kind,
          calendar: shop.rentCalendar ?? "gregorian",
          note,
        },
      ],
    };
    return set(
      { shops: get().shops.map((s) => (s.id === id ? next : s)) },
      kind === "credit" ? "Apply construction credit" : "Record rent",
    );
  };
  type Actions = Omit<
    LedgerState,
    keyof LedgerData | "error" | "hydrate" | "reset"
  >;
  const actions: Actions = {
    completeSetup: async (name) =>
      name.trim()
        ? set(
            { propertyName: name.trim(), setupComplete: true },
            "Complete setup",
          )
        : reject("Enter your property name."),
    restoreData: async (data) => {
      try {
        return await set(validateLedger(data), "Restore backup");
      } catch {
        return reject("The backup contains invalid or inconsistent records.");
      }
    },
    setPropertyName: async (propertyName) => set({ propertyName }),
    collectRent: async (id, receipt) => {
      const shop = [...get().shops, ...get().archivedShops].find(
        (s) => s.id === id,
      );
      if (!shop)
        return { ok: false, error: "This shop is no longer available." };
      if (!editable(receipt.date))
        return {
          ok: false,
          error:
            "This month is closed. Reopen it before changing dated records.",
        };
      const result = receiveRent(shop, receipt);
      if (!result.ok || result.duplicate) return result;
      const updated: Shop = {
        ...result.shop,
        rentTransactions: [
          ...(shop.rentTransactions ?? []),
          {
            id: receipt.id,
            receiptId: receipt.id,
            date: receipt.date,
            amount: receipt.amount,
            period:
              rentalPeriod(shop.startDate, receipt.date, shop.rentCalendar)
                .dueDate ?? shop.startDate,
            kind: "cash",
            calendar: shop.rentCalendar ?? "gregorian",
            note: receipt.note,
          },
        ],
      };
      const saved = await set(
        (state) => ({
          shops: state.shops.map((s) => (s.id === id ? updated : s)),
          archivedShops: state.archivedShops.map((s) =>
            s.id === id ? updated : s,
          ),
        }),
        "Collect rent",
      );
      return saved
        ? { ...result, shop: updated }
        : { ok: false, error: get().error! };
    },
    collect: async (id, amount) =>
      (
        await actions.collectRent(id, {
          id: entryId(),
          date: kabulDate(),
          amount,
          method: "Cash",
        })
      ).ok,
    collectPrepaid: async (id, amount) => actions.collect(id, amount),
    collectMonthly: async (id, amount, period, date, note) =>
      settleFixed(id, amount, period, "cash", date, note),
    applyCredit: async (id, amount, period) => {
      const shop = get().shops.find((s) => s.id === id);
      const target =
        period ??
        (shop &&
          rentalPeriod(shop.startDate, kabulDate(), shop.rentCalendar).dueDate);
      return target ? settleFixed(id, amount, target, "credit") : false;
    },
    addShop: async (shop) =>
      set(
        {
          shops: [
            ...get().shops,
            {
              ...shop,
              rentCalendar: shop.rentCalendar ?? "gregorian",
              rentLedgerStartDate: shop.rentLedgerStartDate ?? shop.startDate,
            },
          ],
        },
        "Add shop",
      ),
    deleteShop: async (id) => actions.archiveShop(id),
    archiveShop: async (id) => {
      const shop = get().shops.find((s) => s.id === id);
      if (!shop) return reject("This shop is no longer available.");
      return set(
        (state) => ({
          shops: state.shops.filter((s) => s.id !== id),
          archivedShops: [
            ...state.archivedShops,
            { ...shop, archivedAt: new Date().toISOString() },
          ],
        }),
        "Archive shop",
      );
    },
    restoreShop: async (id) => {
      const shop = get().archivedShops.find((s) => s.id === id);
      if (!shop) return false;
      return set(
        (s) => ({
          shops: [
            ...s.shops,
            { ...shop, archivedAt: undefined, deletedAt: undefined },
          ],
          archivedShops: s.archivedShops.filter((r) => r.id !== id),
        }),
        "Restore shop",
      );
    },
    updateShop: async (id, changes) => {
      const shop = get().shops.find((s) => s.id === id);
      if (!shop) return reject("This shop is no longer available.");
      if (shop.tenancyEndDate && !shop.occupied && changes.occupied)
        return reject(
          "This tenancy has ended. Archive this record and add a new tenancy to keep the old account intact.",
        );
      if (
        shop.occupied &&
        changes.occupied === false &&
        !changes.tenancyEndDate
      )
        changes = { ...changes, tenancyEndDate: kabulDate() };
      if (
        changes.tenancyEndDate &&
        changes.tenancyEndDate !== shop.tenancyEndDate &&
        get().closedMonths.some(
          (m) => changes.tenancyEndDate! < m.end && m.start <= kabulDate(),
        )
      )
        return reject(
          "This month is closed. Reopen it before changing dated records.",
        );
      const financial =
        get().closedMonths.some(
          (m) => shop.startDate < m.end && m.start <= kabulDate(),
        ) ||
        (shop.rentReceipts?.length ?? 0) > 0 ||
        (shop.rentTransactions?.length ?? 0) > 0 ||
        shop.paid > 0 ||
        (shop.rentRates?.length ?? 0) > 0;
      const replacingTerms =
        (changes.startDate !== undefined &&
          changes.startDate !== shop.startDate) ||
        (changes.rentCalendar !== undefined &&
          changes.rentCalendar !== (shop.rentCalendar ?? "gregorian")) ||
        (changes.rentLedgerStartDate !== undefined &&
          changes.rentLedgerStartDate !==
            (shop.rentLedgerStartDate ?? ledgerStartDate(shop))) ||
        (changes.rentalType !== undefined &&
          changes.rentalType !== (shop.rentalType ?? "monthly")) ||
        JSON.stringify(changes.prepaidRent ?? shop.prepaidRent) !==
          JSON.stringify(shop.prepaidRent);
      if (financial && replacingTerms)
        return reject(
          "This tenancy has financial history. Keep its calendar, start date and advance agreement unchanged; use Tenancy Lifecycle for rent changes.",
        );
      if (!financial && replacingTerms)
        changes = { ...changes, initialRent: undefined, rentRates: undefined };
      if (
        changes.rent !== undefined &&
        changes.rent !== shop.rent &&
        (financial || !replacingTerms)
      ) {
        if (!editable(kabulDate()))
          return reject(
            "This month is closed. Reopen it before changing dated records.",
          );
        changes = {
          ...changes,
          initialRent: shop.initialRent ?? shop.rent,
          rentRates: changes.rentRates ?? [
            ...(shop.rentRates ?? []).filter(
              (r) => r.effective !== kabulDate(),
            ),
            { effective: kabulDate(), amount: changes.rent },
          ],
        };
      }
      return set(
        {
          shops: get().shops.map((s) =>
            s.id === id ? preserveCalendarSettlements(s, changes) : s,
          ),
        },
        "Update shop",
      );
    },
    addExpense: async (expense) => {
      if (
        !editable(expense.date ?? kabulDate()) ||
        (expense.date ?? kabulDate()) > kabulDate()
      )
        return reject("Choose an open month and a date no later than today.");
      return set(
        {
          expenses: [
            {
              ...expense,
              id: expense.id ?? entryId(),
              date: expense.date ?? kabulDate(),
              method: expense.method ?? "Cash",
              type: expense.type ?? "Property Expense",
            },
            ...get().expenses,
          ],
        },
        "Add expense",
      );
    },
    addCredit: async (id, amount, note) => {
      const shop = get().shops.find((s) => s.id === id);
      if (
        !shop ||
        !Number.isSafeInteger(amount) ||
        amount <= 0 ||
        !Number.isSafeInteger(shop.credit + amount)
      )
        return reject("Enter a positive whole-AFN amount and description.");
      if (!editable(kabulDate()))
        return reject(
          "This month is closed. Reopen it before changing dated records.",
        );
      return set(
        (s) => ({
          shops: s.shops.map((r) =>
            r.id === id ? { ...r, credit: r.credit + amount } : r,
          ),
          audit: [
            ...s.audit,
            {
              id: entryId(),
              date: new Date().toISOString(),
              action: "Construction credit added",
              shopId: id,
              note: `${amount} AFN · ${note}`,
            },
          ],
        }),
        "Add construction credit",
      );
    },
    addGoods: async (goods) => {
      const state = get(),
        shop = state.shops.find((s) => s.id === goods.shopId);
      if (!shop || goods.date > kabulDate() || !editable(goods.date))
        return reject("Choose an open month and a date no later than today.");
      const previous = state.goods.find((g) => g.id === goods.id);
      if (previous)
        return (
          JSON.stringify(previous) === JSON.stringify(goods) ||
          reject("These goods were already saved with different details.")
        );
      let next = shop;
      if (goods.mode === "offset") {
        const result = offsetRent(shop, goods.amount, goods.date, goods.id);
        if (!result)
          return reject(
            "Goods deductions cannot exceed unpaid rent. Record the remainder as a payable.",
          );
        next = result;
      }
      const expense: Expense = {
        id: `goods:${goods.id}`,
        date: goods.date,
        amount: goods.amount,
        description: goods.item,
        category: "Goods Taken",
        shopId: shop.id,
        type: "Personal Expense",
        method:
          goods.mode === "paid"
            ? "Cash"
            : goods.mode === "offset"
              ? "Rent Offset"
              : "Credit",
        notes: goods.notes,
      };
      return set(
        {
          shops: state.shops.map((s) => (s.id === shop.id ? next : s)),
          goods: [...state.goods, goods],
          expenses: [expense, ...state.expenses],
        },
        "Record goods",
      );
    },
    settleGoods: async (id, amount, method, date) => {
      const state = get(),
        goods = state.goods.find((g) => g.id === id);
      if (
        !goods ||
        goods.mode !== "owed" ||
        !validDate(date) ||
        date < goods.date ||
        date > kabulDate() ||
        !editable(date) ||
        !Number.isSafeInteger(amount) ||
        amount <= 0 ||
        amount >
          goods.amount - goods.settlements.reduce((n, s) => n + s.amount, 0)
      )
        return reject(
          "Enter an amount within the unpaid goods balance and an open date.",
        );
      const shop = [...state.shops, ...state.archivedShops].find(
        (s) => s.id === goods.shopId,
      );
      if (!shop) return false;
      const settlementId = entryId();
      const next =
        method === "Cash" ? shop : offsetRent(shop, amount, date, settlementId);
      if (!next)
        return reject(
          "Goods deductions cannot exceed unpaid rent. Record the remainder as a payable.",
        );
      // The original payable stays noncash. Only a separately dated cash settlement affects cash flow.
      const expenses = [
        {
          id: `settle:${settlementId}`,
          date,
          amount,
          description: goods.item,
          category: "Goods Settlement",
          settlementFor: goods.id,
          shopId: shop.id,
          type: "Personal Expense" as const,
          method:
            method === "Cash" ? ("Cash" as const) : ("Rent Offset" as const),
        },
        ...state.expenses,
      ];
      return set(
        {
          shops: state.shops.map((s) => (s.id === shop.id ? next : s)),
          archivedShops: state.archivedShops.map((s) =>
            s.id === shop.id ? next : s,
          ),
          expenses,
          goods: state.goods.map((g) =>
            g.id === id
              ? {
                  ...g,
                  settlements: [
                    ...g.settlements,
                    { id: settlementId, date, amount, method },
                  ],
                }
              : g,
          ),
        },
        "Settle goods",
      );
    },
    reverseReceipt: async (shopId, receiptId, reason) => {
      const state = get(),
        shop = [...state.shops, ...state.archivedShops].find(
          (s) => s.id === shopId,
        ),
        receipt = shop?.rentReceipts?.find((r) => r.id === receiptId);
      if (!shop || !receipt || receipt.reversedAt || !reason.trim())
        return false;
      if (!editable(receipt.date))
        return reject(
          "This month is closed. Reopen it before changing dated records.",
        );
      const next = {
        ...shop,
        rentReceipts: shop.rentReceipts!.map((r) =>
          r.id === receiptId
            ? {
                ...r,
                reversedAt: new Date().toISOString(),
                reversalReason: reason.trim(),
              }
            : r,
        ),
      };
      return set(
        {
          shops: state.shops.map((s) => (s.id === shopId ? next : s)),
          archivedShops: state.archivedShops.map((s) =>
            s.id === shopId ? next : s,
          ),
        },
        "Reverse payment",
      );
    },
    closeMonth: async (calendar, start, end) => {
      if (
        !validDate(start) ||
        !validDate(end) ||
        start >= end ||
        end > kabulDate()
      )
        return reject("Only a completed month can be closed.");
      if (
        get().closedMonths.some(
          (m) => m.calendar === calendar && m.start === start,
        )
      )
        return true;
      return set(
        {
          closedMonths: [
            ...get().closedMonths,
            { calendar, start, end, closedAt: new Date().toISOString() },
          ],
        },
        "Close month",
      );
    },
    reopenMonth: async (calendar, start) =>
      set(
        {
          closedMonths: get().closedMonths.filter(
            (m) => m.calendar !== calendar || m.start !== start,
          ),
        },
        "Reopen month",
      ),
  };
  const queued = Object.fromEntries(
    Object.entries(actions).map(([key, action]) => [
      key,
      (...args: unknown[]) => {
        // Derive balances only when earlier writes have committed, not at click time.
        const result = writeQueue.then(() =>
          (action as (...values: unknown[]) => unknown)(...args),
        );
        writeQueue = result.catch(() => {});
        return result;
      },
    ]),
  ) as Actions;
  return {
    ...emptyLedger(),
    error: null,
    ...queued,
    hydrate: (data) => rawSet({ ...validateLedger(data), error: null }),
    reset: () => rawSet({ ...emptyLedger(), error: null }),
  };
});

const entryId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function ledgerData(state: LedgerData): LedgerData {
  const {
    propertyName,
    setupComplete,
    shops,
    archivedShops,
    expenses,
    goods,
    audit,
    closedMonths,
  } = state;
  return {
    propertyName,
    setupComplete,
    shops,
    archivedShops,
    expenses,
    goods,
    audit,
    closedMonths,
  };
}

function offsetRent(
  shop: Shop,
  amount: number,
  date: string,
  sourceId: string,
): Shop | null {
  const account = rentAccount(shop, date);
  if (
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    amount > account.outstanding
  )
    return null;
  const map = {
    ...(shop.rentalType === "prepaid"
      ? shop.prepaidPayments
      : shop.rentPayments),
  };
  const transactions = [...(shop.rentTransactions ?? [])];
  let remaining = amount;
  for (const row of account.periods) {
    const applied = Math.min(remaining, row.due);
    if (!applied) continue;
    map[row.date] = (map[row.date] ?? 0) + applied;
    transactions.push({
      id: `${sourceId}:${row.date}`,
      sourceId,
      source: "goods",
      date,
      period: row.date,
      amount: applied,
      kind: "credit",
      calendar: shop.rentCalendar ?? "gregorian",
    });
    remaining -= applied;
  }
  return {
    ...shop,
    [shop.rentalType === "prepaid" ? "prepaidPayments" : "rentPayments"]: map,
    rentTransactions: transactions,
  };
}

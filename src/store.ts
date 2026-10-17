import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initialShops } from "./data";
import { Shop } from "./types";
import { rentPosition } from "./rent";

type Preferences = {
  language: "en" | "ps";
  theme: "light" | "dark" | "system";
  reminders: boolean;
  reminderDay: number;
  setLanguage: (v: "en" | "ps") => void;
  setTheme: (v: "light" | "dark" | "system") => void;
  setReminders: (v: boolean) => void;
  setReminderDay: (v: number) => void;
};
export const usePreferences = create<Preferences>()(
  persist(
    (set) => ({
      language: "en",
      theme: "system",
      reminders: false,
      reminderDay: 5,
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setReminders: (reminders) => set({ reminders }),
      setReminderDay: (reminderDay) => set({ reminderDay }),
    }),
    {
      name: "rent-manager-preferences-v1",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

type PreviewState = {
  propertyName: string;
  setPropertyName: (name: string) => void;
  shops: Shop[];
  expenses: { description: string; amount: number; category: string }[];
  collect: (id: number, amount: number) => void;
  collectPrepaid: (id: number, amount: number) => void;
  applyCredit: (id: number, amount: number) => void;
  addShop: (shop: Shop) => void;
  deleteShop: (id: number) => void;
  updateShop: (id: number, changes: Partial<Shop>) => void;
  addExpense: (expense: {
    description: string;
    amount: number;
    category: string;
  }) => void;
  reset: () => void;
};
// Deliberately separate sample UI data from the future production accounting database.
export const usePreviewLedger = create<PreviewState>((set) => ({
  propertyName: "Al Hafez Plaza",
  setPropertyName: (propertyName) => set({ propertyName }),
  shops: initialShops.map((s) => ({ ...s })),
  expenses: [],
  collect: (id, amount) =>
    set((state) => ({
      shops: state.shops.map((s) =>
        s.id === id
          ? {
              ...s,
              paid: s.paid + amount,
              status: s.paid + amount >= s.rent ? "Paid" : "Partial",
            }
          : s,
      ),
    })),
  collectPrepaid: (id, amount) =>
    set((state) => ({
      shops: state.shops.map((shop) => {
        if (shop.id !== id) return shop;
        const position = rentPosition(shop);
        const dueDate = position.prepaid?.currentDueDate;
        if (
          !dueDate ||
          !Number.isSafeInteger(amount) ||
          amount <= 0 ||
          amount > position.due
        )
          return shop;
        return {
          ...shop,
          prepaidPayments: {
            ...shop.prepaidPayments,
            [dueDate]: (shop.prepaidPayments?.[dueDate] ?? 0) + amount,
          },
        };
      }),
    })),
  applyCredit: (id, amount) =>
    set((state) => ({
      shops: state.shops.map((shop) => {
        if (shop.id !== id) return shop;
        const position = rentPosition(shop);
        if (
          !Number.isSafeInteger(amount) ||
          amount <= 0 ||
          amount > shop.credit ||
          amount > position.due
        )
          return shop;
        const dueDate = position.prepaid?.currentDueDate;
        if (dueDate)
          return {
            ...shop,
            credit: shop.credit - amount,
            prepaidPayments: {
              ...shop.prepaidPayments,
              [dueDate]: (shop.prepaidPayments?.[dueDate] ?? 0) + amount,
            },
          };
        return {
          ...shop,
          paid: shop.paid + amount,
          credit: shop.credit - amount,
          status:
            shop.paid + amount >= shop.rent ? "Settled by Credit" : "Partial",
        };
      }),
    })),
  addShop: (shop) => set((state) => ({ shops: [...state.shops, shop] })),
  deleteShop: (id) =>
    set((state) => ({ shops: state.shops.filter((shop) => shop.id !== id) })),
  updateShop: (id, changes) =>
    set((state) => ({
      shops: state.shops.map((s) => (s.id === id ? { ...s, ...changes } : s)),
    })),
  addExpense: (expense) =>
    set((state) => ({ expenses: [expense, ...state.expenses] })),
  reset: () =>
    set({
      shops: initialShops.map((s) => ({ ...s })),
      expenses: [],
      propertyName: "Al Hafez Plaza",
    }),
}));

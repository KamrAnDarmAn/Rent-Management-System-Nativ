import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { RentCalendar } from "../types/shop";
import {
  normalizePreferences,
  type PreferenceValues,
} from "../domain/preferences";

export type Preferences = PreferenceValues & {
  setRentViewCalendar: (calendar: RentCalendar) => void;
  setLanguage: (v: "en" | "ps") => void;
  setTheme: (v: "light" | "dark" | "system") => void;
  setReminders: (v: boolean) => void;
  setReminderDay: (v: number) => void;
};

export const usePreferences = create<Preferences>()(
  persist(
    (set) => ({
      ...normalizePreferences(undefined),
      setRentViewCalendar: (rentViewCalendar) => set({ rentViewCalendar }),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setReminders: (reminders) => set({ reminders }),
      setReminderDay: (reminderDay) => set({ reminderDay }),
    }),
    {
      name: "rent-manager-preferences-v1",
      storage: createJSONStorage(() => AsyncStorage),
      skipHydration: true,
      partialize: (state) => normalizePreferences(state),
      merge: (persisted, current) => ({
        ...current,
        ...normalizePreferences(persisted),
      }),
    },
  ),
);

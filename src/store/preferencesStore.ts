import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { RentCalendar } from "../types/shop";

export type Preferences = {
  language: "en" | "ps";
  theme: "light" | "dark" | "system";
  reminders: boolean;
  lastBackupAt?: string;
  reminderDay: number;
  rentViewCalendar: RentCalendar;
  setRentViewCalendar: (calendar: RentCalendar) => void;
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
      rentViewCalendar: "gregorian",
      setRentViewCalendar: (rentViewCalendar) => set({ rentViewCalendar }),
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

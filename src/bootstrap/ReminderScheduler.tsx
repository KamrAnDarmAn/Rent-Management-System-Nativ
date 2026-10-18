import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { useLedger } from "../store/ledgerStore";
import { usePreferences } from "../store/preferencesStore";
import { syncReminders } from "../services/reminders";
import { useUI } from "../components/theme/UIContext";

export function ReminderScheduler() {
  const shops = useLedger((s) => s.shops);
  const { reminders, reminderDay, language } = usePreferences();
  const [resumed, setResumed] = useState(0);
  const { notify } = useUI();
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") setResumed((n) => n + 1);
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    const timeout = setTimeout(() => {
      void syncReminders(shops, reminders, reminderDay, language).catch(() => {
        if (reminders)
          notify(
            "Reminders could not be scheduled. Open reminder settings and try again.",
          );
      });
    }, 500);
    return () => clearTimeout(timeout);
  }, [shops, reminders, reminderDay, language, resumed]);
  return null;
}

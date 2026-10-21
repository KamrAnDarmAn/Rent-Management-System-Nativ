import { useState } from "react";
import { Platform } from "react-native";
import { Button } from "../../components/buttons/Button";
import { Info } from "../../components/feedback/Info";
import { Select } from "../../components/forms/Select";
import { ToggleRow } from "../../components/forms/ToggleRow";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { T } from "../../components/typography/T";
import { useUI } from "../../components/theme/UIContext";
import { useGo } from "../../hooks/useGo";
import { useToday } from "../../hooks/useToday";
import { usePreferences } from "../../store/preferencesStore";
import { useLedger } from "../../store/ledgerStore";
import { rentAccount } from "../../domain/rentAccount";
import {
  ReminderUnavailableError,
  requestReminderPermission,
  syncReminders,
} from "../../services/reminders";

export function RemindersScreen() {
  const { notify } = useUI(),
    prefs = usePreferences(),
    today = useToday(),
    go = useGo();
  const shops = useLedger((s) => s.shops);
  const [busy, setBusy] = useState(false);
  const overdue = shops.filter((s) => rentAccount(s, today).arrears > 0);
  return (
    <Page title="Reminders" subtitle="Never miss a rent collection again">
      <Info
        text={
          Platform.OS === "web"
            ? "Device notifications are available in the Android and iOS app. You can review unpaid rent here anytime."
            : "Reminders work offline. Notifications are scheduled for rent due dates at 9 AM Afghanistan time. Open GMM regularly to refresh upcoming reminders."
        }
      />
      <Card style={{ gap: 12 }}>
        <ToggleRow
          title="Rent Collection Reminder"
          subtitle="Get reminded before rent is due"
          icon="Bell"
          value={prefs.reminders}
          onChange={(enabled) => {
            if (busy) return;
            setBusy(true);
            void (async () => {
              try {
                if (enabled && !(await requestReminderPermission()))
                  return notify(
                    "Allow notifications in your device settings to enable reminders.",
                  );
                await syncReminders(
                  shops,
                  enabled,
                  prefs.reminderDay,
                  prefs.language,
                );
                prefs.setReminders(enabled);
              } catch (error) {
                notify(
                  error instanceof ReminderUnavailableError
                    ? error.message
                    : "Reminders could not be scheduled. Open reminder settings and try again.",
                );
              } finally {
                setBusy(false);
              }
            })();
          }}
        />
        <Select
          label="Days Before Rent Is Due"
          value={String(prefs.reminderDay)}
          options={[1, 2, 3, 5, 7, 10].map(String)}
          onChange={(v) => prefs.setReminderDay(Number(v))}
        />
      </Card>
      <Card style={{ gap: 10 }}>
        <T weight="bold">Overdue Rent</T>
        <T>{overdue.length}</T>
        <Button
          title="View Shops"
          onPress={() => go("collect")}
          variant="outline"
        />
      </Card>
    </Page>
  );
}

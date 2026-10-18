import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { Shop } from "../types/shop";
import { kabulDate, rentalPeriod, rentDueDate } from "../domain/rentSchedule";
import { rentAccount } from "../domain/rentAccount";
import { translateText } from "../i18n/translate";

if (Platform.OS !== "web")
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

export async function requestReminderPermission() {
  if (Platform.OS === "web") return false;
  if (Platform.OS === "android")
    await Notifications.setNotificationChannelAsync("gmm-rent", {
      name: "GMM Rent",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  const result = await Notifications.requestPermissionsAsync();
  return (
    result.granted ||
    result.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}
let queue = Promise.resolve();
export function syncReminders(
  shops: Shop[],
  enabled: boolean,
  daysBefore: number,
  language: "en" | "ps",
) {
  if (Platform.OS === "web") return Promise.resolve();
  queue = queue
    .catch(() => {})
    .then(async () => {
      const permission = await Notifications.getPermissionsAsync();
      const existing = (
        await Notifications.getAllScheduledNotificationsAsync()
      ).filter((n) => n.identifier.startsWith("gmm-rent:"));
      for (const n of existing)
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      if (
        !enabled ||
        !(
          permission.granted ||
          permission.ios?.status ===
            Notifications.IosAuthorizationStatus.PROVISIONAL
        )
      )
        return;
      const today = kabulDate();
      const jobs: { identifier: string; date: Date; shop: Shop }[] = [];
      for (const shop of shops.filter((s) => s.occupied)) {
        const current = rentalPeriod(shop.startDate, today, shop.rentCalendar);
        for (
          let n = Math.max(0, current.offset);
          n <= Math.max(0, current.offset) + 12;
          n++
        ) {
          const due = rentDueDate(shop.startDate, n, shop.rentCalendar);
          if (shop.tenancyEndDate && due > shop.tenancyEndDate) continue;
          if (
            (rentAccount(shop, due).periods.find((p) => p.date === due)?.due ??
              0) === 0
          )
            continue;
          const trigger = new Date(
            Date.parse(`${due}T09:00:00+04:30`) - daysBefore * 86400000,
          );
          if (trigger.getTime() <= Date.now()) continue;
          jobs.push({
            identifier: `gmm-rent:${shop.id}:${due}`,
            date: trigger,
            shop,
          });
        }
      }
      for (const job of jobs
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 50)) {
        await Notifications.scheduleNotificationAsync({
          identifier: job.identifier,
          content: {
            title: "GMM",
            body:
              translateText(
                "Rent is due soon. Open GMM to review this shop.",
                language,
              ) + ` ${job.shop.number}`,
            data: { shopId: job.shop.id },
            sound: false,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: job.date,
            channelId: "gmm-rent",
          },
        });
      }
    });
  return queue;
}

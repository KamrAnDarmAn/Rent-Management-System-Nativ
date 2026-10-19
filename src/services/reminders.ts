import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";
import type { Shop } from "../types/shop";
import { reminderPlan } from "../domain/reminderPlan";
import { translateText } from "../i18n/translate";

export class ReminderUnavailableError extends Error {
  constructor() {
    super(
      Platform.OS === "web"
        ? "Device notifications are available in the Android and iOS app. You can review unpaid rent here anytime."
        : "Device reminders are unavailable in this build. Install a current GMM app build to enable notifications.",
    );
  }
}

// Loading notifications eagerly can prevent the ledger from opening in a
// runtime with missing native modules (including Expo Go). Only this optional
// feature should fail; never take the saved ledger down with it.
let notificationModule:
  Promise<typeof import("expo-notifications") | null> | undefined;
async function loadNotifications() {
  // Metro may report module-evaluation failures as fatal before a promise can
  // catch them. Inspect native capabilities before evaluating the SDK barrel.
  const required = [
    "ExpoNotificationScheduler",
    "ExpoNotificationsHandlerModule",
    "ExpoNotificationPermissionsModule",
    ...(Platform.OS === "android" ? ["ExpoTopicSubscriptionModule"] : []),
  ];
  if (required.some((name) => !requireOptionalNativeModule(name))) return null;
  return (notificationModule ??= import("expo-notifications")
    .then((Notifications) => {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      return Notifications;
    })
    .catch(() => null));
}

export async function requestReminderPermission() {
  if (Platform.OS === "web") throw new ReminderUnavailableError();
  const Notifications = await loadNotifications();
  if (!Notifications) throw new ReminderUnavailableError();
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
      const Notifications = await loadNotifications();
      if (!Notifications) {
        if (enabled) throw new ReminderUnavailableError();
        return;
      }
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
      for (const job of reminderPlan(shops, daysBefore)) {
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

import { expect, test } from "@playwright/test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { reminderPlan } from "../src/domain/reminderPlan";
import { rentDueDate } from "../src/domain/rentSchedule";
import { translateText } from "../src/i18n/translate";
import type { Shop } from "../src/types/shop";

const shop: Shop = {
  id: 1,
  number: "01",
  name: "Test",
  keeper: "Ali",
  phone: "",
  address: "",
  notes: "",
  startDate: "2026-10-01",
  rentLedgerStartDate: "2026-10-01",
  rent: 1000,
  paid: 0,
  credit: 0,
  status: "Unpaid",
  occupied: true,
  image: 0,
};
const now = new Date("2026-10-19T10:00:00Z");

test("reminders use 9 AM Kabul time, lead days and future triggers only", () => {
  const jobs = reminderPlan([shop], 5, now);
  expect(jobs[0].identifier).toBe("gmm-rent:1:2026-11-01");
  expect(jobs[0].date.toISOString()).toBe("2026-10-27T04:30:00.000Z");
  expect(
    reminderPlan([shop], 5, new Date("2026-10-27T04:30:00Z"))[0].identifier,
  ).toBe("gmm-rent:1:2026-12-01");
  expect(jobs.every((j) => j.date > now)).toBe(true);
});

test("prepaid installments and advance receipts suppress already covered reminders without changing the ledger", () => {
  const prepaid: Shop = {
    ...shop,
    rentalType: "prepaid",
    prepaidRent: { startDate: shop.startDate, amount: 3000, monthlyRent: 1000 },
  };
  const advance: Shop = {
    ...shop,
    rentReceipts: [
      { id: "advance", date: "2026-10-01", amount: 3500, method: "Cash" },
    ],
  };
  const original = JSON.stringify([prepaid, advance]);
  expect(reminderPlan([prepaid], 5, now)[0].identifier).toBe(
    "gmm-rent:1:2027-01-01",
  );
  // A partly covered installment still needs a reminder.
  expect(reminderPlan([advance], 5, now)[0].identifier).toBe(
    "gmm-rent:1:2027-01-01",
  );
  expect(JSON.stringify([prepaid, advance])).toBe(original);
});

test("ended, vacant and archived tenancies stop reminders; Shamsi follows the first of the month", () => {
  expect(
    reminderPlan(
      [
        { ...shop, tenancyEndDate: "2026-10-25" },
        { ...shop, id: 2, occupied: false },
        { ...shop, id: 3, archivedAt: "2026-10-19" },
        { ...shop, id: 4, deletedAt: "2026-10-19" },
      ],
      5,
      now,
    ),
  ).toEqual([]);
  const shamsi: Shop = {
    ...shop,
    rentCalendar: "shamsi",
    startDate: "2026-10-10",
    rentLedgerStartDate: "2026-10-10",
  };
  const nextDue = rentDueDate(shamsi.startDate, 1, "shamsi");
  expect(reminderPlan([shamsi], 1, now)[0].identifier).toBe(
    `gmm-rent:1:${nextDue}`,
  );
});

test("the 50-notification limit selects the earliest dates across all shops", () => {
  const shops = Array.from({ length: 60 }, (_, i) => ({
    ...shop,
    id: i + 1,
    startDate: i < 30 ? "2026-10-20" : "2026-10-21",
    rentLedgerStartDate: "2026-10-20",
  }));
  const jobs = reminderPlan(
    shops.reverse(),
    1,
    new Date("2026-10-18T12:00:00Z"),
  );
  expect(jobs).toHaveLength(50);
  expect(
    jobs.slice(0, 30).every((j) => j.identifier.endsWith(":2026-10-20")),
  ).toBe(true);
  expect(new Set(jobs.map((j) => j.identifier)).size).toBe(50);
});

// Execute the actual native service with OS API doubles. This also exercises
// module-load failure, which a browser cannot reproduce.
function nativeService(os = "android", missing: string | false = false) {
  const events: string[] = [];
  let granted = true;
  let provisional = false;
  let failCancel = false;
  let scheduled = [
    { identifier: "gmm-rent:old" },
    { identifier: "other-feature:keep" },
  ];
  const jobs: Parameters<
    typeof import("expo-notifications").scheduleNotificationAsync
  >[0][] = [];
  const permission = () => ({
    granted,
    ...(provisional ? { ios: { status: 3 } } : {}),
  });
  const notifications = {
    AndroidImportance: { DEFAULT: 3 },
    IosAuthorizationStatus: { PROVISIONAL: 3 },
    SchedulableTriggerInputTypes: { DATE: "date" },
    setNotificationHandler: () => {
      events.push("handler");
    },
    setNotificationChannelAsync: async () => {
      events.push("channel");
    },
    requestPermissionsAsync: async () => {
      events.push("request");
      return permission();
    },
    getPermissionsAsync: async () => permission(),
    getAllScheduledNotificationsAsync: async () => scheduled,
    cancelScheduledNotificationAsync: async (id: string) => {
      if (failCancel) {
        failCancel = false;
        throw new Error("OS scheduling failure");
      }
      events.push(`cancel:${id}`);
      scheduled = scheduled.filter((n) => n.identifier !== id);
    },
    scheduleNotificationAsync: async (
      job: Parameters<
        typeof import("expo-notifications").scheduleNotificationAsync
      >[0],
    ) => {
      events.push(`schedule:${job.identifier}`);
      jobs.push(job);
      scheduled.push({ identifier: job.identifier! });
    },
  };
  const exports = {} as typeof import("../src/services/reminders");
  const code = ts.transpileModule(
    readFileSync("src/services/reminders.ts", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  runInNewContext(code, {
    exports,
    require: (id: string) => {
      if (id === "react-native") return { Platform: { OS: os } };
      if (id === "expo")
        return {
          requireOptionalNativeModule: (name: string) =>
            name === missing ? null : {},
        };
      if (id === "../domain/reminderPlan") return { reminderPlan };
      if (id === "../i18n/translate") return { translateText };
      if (id === "expo-notifications") {
        events.push("load");
        if (missing)
          throw new Error(
            "Cannot find native module 'ExpoTopicSubscriptionModule'",
          );
        return notifications;
      }
      throw new Error(`Unexpected dependency ${id}`);
    },
  });
  return {
    service: exports,
    events,
    scheduled: () => scheduled,
    jobs,
    provisional: () => {
      granted = false;
      provisional = true;
    },
    deny: () => {
      granted = false;
    },
    failCancel: () => {
      failCancel = true;
    },
  };
}

test("a missing optional native notification module cannot crash startup or a disabled ledger", async () => {
  for (const [os, missing] of [
    ["android", "ExpoTopicSubscriptionModule"],
    ["ios", "ExpoNotificationScheduler"],
    ["ios", "ExpoNotificationsHandlerModule"],
    ["ios", "ExpoNotificationPermissionsModule"],
  ]) {
    const { service, events } = nativeService(os, missing);
    expect(events).toEqual([]);
    await service.syncReminders([], false, 5, "en");
    await assert.rejects(
      service.requestReminderPermission(),
      /unavailable in this build/,
    );
    await assert.rejects(
      service.syncReminders([], true, 5, "en"),
      /unavailable in this build/,
    );
    // Never evaluate a native SDK import known to fail under Metro's loader.
    expect(events).toEqual([]);
  }
});

test("reminders request the Android channel before permission, cancel only their own jobs and recover after an OS error", async () => {
  const native = nativeService();
  expect(await native.service.requestReminderPermission()).toBe(true);
  expect(native.events).toEqual(["load", "handler", "channel", "request"]);
  native.failCancel();
  await assert.rejects(
    native.service.syncReminders([], false, 5, "en"),
    /OS scheduling failure/,
  );
  await native.service.syncReminders([], false, 5, "en");
  expect(native.scheduled()).toEqual([{ identifier: "other-feature:keep" }]);
  native.deny();
  expect(await native.service.requestReminderPermission()).toBe(false);
  await native.service.syncReminders([shop], true, 5, "en");
  expect(native.events.some((event) => event.startsWith("schedule:"))).toBe(
    false,
  );
});

test("web reminder requests explain device availability without loading native modules", async () => {
  const { service, events } = nativeService("web");
  await service.syncReminders([shop], true, 5, "en");
  await assert.rejects(
    service.requestReminderPermission(),
    /Android and iOS app/,
  );
  expect(events).toEqual([]);
});

test("native scheduling creates localized dated jobs and a queued disable removes them", async () => {
  const native = nativeService();
  const startDate = rentDueDate(new Date().toISOString().slice(0, 10), 1);
  const shops = [{ ...shop, startDate, rentLedgerStartDate: startDate }];
  await Promise.all([
    native.service.syncReminders(shops, true, 5, "ps"),
    native.service.syncReminders(shops, false, 5, "ps"),
  ]);
  expect(native.jobs.length).toBeGreaterThan(0);
  expect(native.jobs[0]).toMatchObject({
    content: {
      title: "GMM",
      body:
        translateText("Rent is due soon. Open GMM to review this shop.", "ps") +
        " 01",
      data: { shopId: shop.id },
      sound: false,
    },
    trigger: { type: "date", channelId: "gmm-rent" },
  });
  expect(native.scheduled()).toEqual([{ identifier: "other-feature:keep" }]);
});

test("iOS provisional permission schedules reminders without creating an Android channel", async () => {
  const native = nativeService("ios");
  native.provisional();
  expect(await native.service.requestReminderPermission()).toBe(true);
  const startDate = rentDueDate(new Date().toISOString().slice(0, 10), 1);
  await native.service.syncReminders(
    [{ ...shop, startDate, rentLedgerStartDate: startDate }],
    true,
    5,
    "en",
  );
  expect(native.jobs.length).toBeGreaterThan(0);
  expect(native.events).not.toContain("channel");
});

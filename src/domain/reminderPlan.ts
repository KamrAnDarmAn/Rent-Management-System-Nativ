import type { Shop } from "../types/shop";
import { rentAccount } from "./rentAccount";
import { kabulDate, rentalPeriod, rentDueDate } from "./rentSchedule";

// Keep under the device notification limit, choosing the earliest dates across
// all shops. Plan against one clock value so crossing Kabul midnight is atomic.
export function reminderPlan(
  shops: Shop[],
  daysBefore: number,
  now = new Date(),
) {
  const today = kabulDate(now);
  const jobs: { identifier: string; date: Date; shop: Shop }[] = [];
  for (const shop of shops.filter(
    (s) => s.occupied && !s.archivedAt && !s.deletedAt,
  )) {
    const current = rentalPeriod(shop.startDate, today, shop.rentCalendar);
    for (
      let n = Math.max(0, current.offset);
      n <= Math.max(0, current.offset) + 12;
      n++
    ) {
      const due = rentDueDate(shop.startDate, n, shop.rentCalendar);
      if (shop.tenancyEndDate && due > shop.tenancyEndDate) break;
      const trigger = new Date(
        Date.parse(`${due}T09:00:00+04:30`) - daysBefore * 86400000,
      );
      if (trigger.getTime() <= now.getTime()) continue;
      if (
        (rentAccount(shop, due).periods.find((p) => p.date === due)?.due ??
          0) === 0
      )
        continue;
      jobs.push({
        identifier: `gmm-rent:${shop.id}:${due}`,
        date: trigger,
        shop,
      });
    }
  }
  return jobs.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 50);
}

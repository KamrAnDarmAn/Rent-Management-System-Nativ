import { useMemo, useState } from "react";
import { buildRentReport, type ReportMode } from "../../../domain/reports";
import { ledgerStartDate } from "../../../domain/rentAccount";
import { useToday } from "../../../hooks/useToday";
import { usePreferences } from "../../../store/preferencesStore";
import { useLedger } from "../../../store/ledgerStore";
import { calendarParts, supportedCalendarDate } from "../../../utils/calendar";

export function useRentReport() {
  const today = useToday();
  const calendar = usePreferences((s) => s.rentViewCalendar);
  const setCalendar = usePreferences((s) => s.setRentViewCalendar);
  const activeShops = useLedger((s) => s.shops);
  const archivedShops = useLedger((s) => s.archivedShops);
  const shops = useMemo(
    () => [...activeShops, ...archivedShops],
    [activeShops, archivedShops],
  );
  const expenses = useLedger((s) => s.expenses);
  const [date, setDate] = useState(today);
  const [mode, setMode] = useState<ReportMode>("monthly");
  const [shopId, setShopId] = useState<number>();
  const candidates = shops.filter(
    (shop) => (shop.rentCalendar ?? "gregorian") === calendar,
  );
  const selected = candidates.find((shop) => shop.id === shopId);
  const report = useMemo(
    () =>
      buildRentReport(shops, expenses, {
        date,
        mode,
        calendar,
        shopId: selected?.id,
        today,
      }),
    [shops, expenses, date, mode, calendar, selected?.id, today],
  );
  const currentYear = calendarParts(today, calendar).year;
  const historyDates = candidates
    .flatMap((shop) => [
      ledgerStartDate(shop, today),
      ...(shop.rentReceipts ?? []).map((receipt) => receipt.date),
      ...(shop.rentTransactions ?? []).map((entry) => entry.date),
    ])
    .concat(expenses.flatMap((expense) => (expense.date ? [expense.date] : [])))
    .filter(
      (value) => supportedCalendarDate(value, calendar) && value <= today,
    );
  const firstYear = Math.min(
    currentYear - 4,
    ...historyDates.map((value) => calendarParts(value, calendar).year),
  );
  const years = Array.from(
    { length: currentYear - Math.max(1, firstYear) + 1 },
    (_, index) => currentYear - index,
  );
  return {
    report,
    today,
    calendar,
    candidates,
    selected,
    date,
    setDate,
    mode,
    setMode,
    setShopId,
    years,
    setCalendar: (value: typeof calendar) => {
      setCalendar(value);
      setDate(today);
      setShopId(undefined);
    },
  };
}

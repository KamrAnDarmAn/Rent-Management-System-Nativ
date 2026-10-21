import { useState } from "react";
import { View } from "react-native";
import { Button } from "../../components/buttons/Button";
import { Metric } from "../../components/data-display/Metric";
import { SummaryLine } from "../../components/data-display/SummaryLine";
import { EmptySearch } from "../../components/feedback/EmptySearch";
import { CalendarMonthPicker } from "../../components/filters/CalendarMonthPicker";
import { Chips } from "../../components/filters/Chips";
import { Search } from "../../components/filters/Search";
import { CalendarChoice } from "../../components/forms/CalendarChoice";
import { Page } from "../../components/layout/Page";
import { Row } from "../../components/layout/Row";
import { useUI } from "../../components/theme/UIContext";
import { rentPosition } from "../../domain/rent";
import { rentCollections } from "../../domain/rentCollections";
import { useGo } from "../../hooks/useGo";
import { useToday } from "../../hooks/useToday";
import { usePreferences } from "../../store/preferencesStore";
import { useLedger } from "../../store/ledgerStore";
import {
  addCalendarMonths,
  calendarMonthStart,
  formatRentMonth,
} from "../../utils/calendar";
import { money } from "../../utils/format";
import { CollectionGreeting } from "./components/CollectionGreeting";
import { CollectionProperty } from "./components/CollectionProperty";
import { CollectionShopCard } from "./components/CollectionShopCard";
import { CollectionStatusGrid } from "./components/CollectionStatusGrid";
import { CollectionSummary } from "./components/CollectionSummary";

export function CollectScreen() {
  const go = useGo();
  const today = useToday();
  const { language } = useUI();
  const calendar = usePreferences((s) => s.rentViewCalendar);
  const setCalendar = usePreferences((s) => s.setRentViewCalendar);
  const [month, setMonth] = useState(today);
  const monthStart = calendarMonthStart(month, calendar);
  const nextMonth = addCalendarMonths(monthStart, 1, calendar);
  const monthEnd = new Date(Date.parse(`${nextMonth}T00:00:00Z`) - 86400000)
    .toISOString()
    .slice(0, 10);
  const asOf =
    today >= monthStart && today < nextMonth
      ? today
      : today < monthStart
        ? monthStart
        : monthEnd;
  const records = useLedger((s) => s.shops);
  const shops = records
    .filter(
      (shop) =>
        shop.occupied && (shop.rentCalendar ?? "gregorian") === calendar,
    )
    .map((shop) => ({
      ...shop,
      ...rentPosition(shop, asOf, today),
    }));
  const propertyName = useLedger((s) => s.propertyName);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const counts: Record<string, number> = {
    All: shops.length,
    Paid: 0,
    Partial: 0,
    Unpaid: 0,
    Overdue: 0,
  };
  shops.forEach((shop) => {
    const status = shop.status === "Settled by Credit" ? "Paid" : shop.status;
    counts[status]++;
  });
  const expected = shops.reduce((sum, shop) => sum + BigInt(shop.charge), 0n);
  const settled = shops.reduce(
    (sum, shop) => sum + BigInt(Math.min(shop.paid, shop.charge)),
    0n,
  );
  const received = rentCollections(shops, monthStart, nextMonth, today).total;
  const filtered = shops.filter(
    (s) =>
      `${s.name} ${s.keeper} ${s.number} ${s.phone}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter === "All" ||
        s.status === filter ||
        (filter === "Paid" && s.status === "Settled by Credit")),
  );
  return (
    <Page back={false} contentGap={6}>
      <CollectionGreeting today={today} />
      <CollectionProperty
        propertyName={propertyName}
        monthLabel={formatRentMonth(month, calendar, language)}
      />
      <CollectionSummary
        expected={expected}
        settled={settled}
        remaining={expected > settled ? expected - settled : 0n}
      />
      <Row gap={7} style={{ alignItems: "stretch" }}>
        <Metric
          style={{ flex: 1 }}
          label="Payments Received (Selected Month)"
          value={money(received)}
          tone="green"
          icon="Banknote"
          detail="Cash and other payments"
        />
        <Metric
          style={{ flex: 1 }}
          label="Outstanding Rent"
          value={money(
            shops.reduce((sum, shop) => sum + BigInt(shop.totalDue), 0n),
          )}
          tone="red"
          icon="FileWarning"
          detail="Includes older unpaid rent"
        />
      </Row>
      <SummaryLine
        label="Previous Months Due"
        value={money(
          shops.reduce((sum, shop) => sum + BigInt(shop.arrears), 0n),
        )}
      />
      <CollectionStatusGrid onSelect={setFilter} counts={counts} />
      <CalendarChoice
        label="View Calendar"
        value={calendar}
        onChange={(value) => {
          setCalendar(value);
          setMonth(today);
          setFilter("All");
        }}
      />
      <CalendarMonthPicker
        value={month}
        calendar={calendar}
        onChange={setMonth}
      />
      <Search
        value={search}
        onChange={setSearch}
        onFilter={() => setFilter(filter === "All" ? "Overdue" : "All")}
      />
      <Chips
        options={Object.keys(counts).map(
          (status) => `${status} (${counts[status]})`,
        )}
        selected={`${filter} (${counts[filter]})`}
        onSelect={(value) => setFilter(value.split(" (")[0])}
      />
      <View style={{ gap: 4 }}>
        {filtered.map((shop) => (
          <CollectionShopCard key={shop.id} shop={shop} />
        ))}
        {filtered.length === 0 && <EmptySearch />}
        {!records.length && (
          <Button
            title="Add First Shop"
            icon="Plus"
            onPress={() => go("add-shop")}
          />
        )}
      </View>
      <Row>
        <Button
          title="Collect Rent"
          icon="Plus"
          onPress={() => go("collect-rent")}
          style={{ flex: 1 }}
          compact
        />
        <Button
          title="Month Closing"
          icon="CalendarCheck"
          onPress={() => go("month-closing")}
          variant="outline"
          style={{ flex: 1 }}
          compact
        />
      </Row>
    </Page>
  );
}

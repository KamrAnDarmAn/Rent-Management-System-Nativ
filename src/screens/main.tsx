import React, { useState } from "react";
import { View, Pressable, Image, TextInput, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Badge,
  BarChart,
  Button,
  Card,
  Divider,
  Donut,
  Icon,
  IconButton,
  IconName,
  IconTile,
  Info,
  Logo,
  Metric,
  Page,
  Progress,
  Row,
  Section,
  Select,
  T,
  TrendChart,
  UIContext,
  dark,
  light,
  money,
  number,
  toneColors,
  useGo,
  useUI,
} from "../ui";
import { usePreferences, usePreviewLedger } from "../store";
import { screenReferences, shopImages } from "../data";
import { ScreenId, Shop, ShopStatus } from "../types";
import { rentalTag, rentPosition } from "../rent";
import { useToday } from "../useToday";

export const statusTone = (status: ShopStatus) =>
  status === "Paid"
    ? "green"
    : status === "Partial"
      ? "orange"
      : status === "Settled by Credit"
        ? "blue"
        : "red";
export const statusIcon = (status: ShopStatus): IconName =>
  status === "Paid"
    ? "CircleCheck"
    : status === "Partial" || status === "Overdue"
      ? "Clock3"
      : status === "Settled by Credit"
        ? "CreditCard"
        : "CircleAlert";

export function Offline() {
  return <Badge label="Offline" icon="Wifi" tone="green" />;
}
export function Search({
  value,
  onChange,
  placeholder = "Search shops or shopkeeper…",
  onFilter,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onFilter?: () => void;
}) {
  const { c, language } = useUI();
  return (
    <Row>
      <Card style={{ flex: 1, paddingVertical: 0, minHeight: 41 }}>
        <Row>
          <Icon name="Search" size={17} color={c.sub} />
          <TextInput
            accessibilityLabel="Search shops"
            placeholder={
              language === "ps" ? "دوکان یا دوکاندار ولټوئ…" : placeholder
            }
            placeholderTextColor={c.sub}
            value={value}
            onChangeText={onChange}
            style={{
              flex: 1,
              minWidth: 0,
              height: 39,
              color: c.text,
              fontSize: 11,
              fontFamily: "Inter_400Regular",
            }}
          />
        </Row>
      </Card>
      <IconButton
        name="ListFilter"
        label="Filter shops"
        onPress={onFilter ?? (() => {})}
        size={41}
      />
    </Row>
  );
}
export function Chips({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  const { c } = useUI();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 5 }}
      style={{ flexGrow: 0 }}
    >
      {options.map((option) => (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: option === selected }}
          key={option}
          onPress={() => onSelect(option)}
          style={{
            minHeight: 30,
            paddingHorizontal: 10,
            borderRadius: 20,
            backgroundColor: option === selected ? c.primary : c.surface,
            borderWidth: 1,
            borderColor: option === selected ? c.primary : c.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <T
            size={10}
            color={
              option === selected ? (c === dark ? "#082722" : "#fff") : c.sub
            }
            weight="medium"
          >
            {option}
          </T>
        </Pressable>
      ))}
    </ScrollView>
  );
}
export function MonthPicker({
  month,
  onChange,
}: {
  month: number;
  onChange: (v: number) => void;
}) {
  const { c } = useUI();
  const date = new Date(2026, month, 1);
  const label = date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  return (
    <Row>
      <IconButton
        name="ChevronLeft"
        label="Previous month"
        onPress={() => onChange(month - 1)}
      />
      <Card style={{ flex: 1, paddingVertical: 9 }}>
        <Row style={{ justifyContent: "center" }}>
          <T weight="semibold">{label}</T>
          <Icon name="ChevronDown" size={13} color={c.sub} />
          <Icon name="CalendarDays" size={16} color={c.sub} />
        </Row>
      </Card>
      <IconButton
        name="ChevronRight"
        label="Next month"
        onPress={() => onChange(month + 1)}
      />
    </Row>
  );
}

export function CollectScreen() {
  const { c, notify, language } = useUI();
  const go = useGo();
  const today = useToday();
  const records = usePreviewLedger((s) => s.shops);
  const shops = records.map((shop) => ({
    ...shop,
    ...rentPosition(shop, today),
  }));
  const propertyName = usePreviewLedger((s) => s.propertyName);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All (20)");
  const [month, setMonth] = useState(2);
  const filtered = shops.filter(
    (s) =>
      `${s.name} ${s.keeper} ${s.number} ${s.phone}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter.startsWith("All") || s.status === filter.split(" (")[0]),
  );
  return (
    <Page back={false} contentGap={6}>
      <Row>
        <Icon name="Sun" size={34} color="#ffb400" />
        <View style={{ flex: 1 }}>
          <T weight="bold" size={19}>
            Good Morning!
          </T>
          <T color={c.sub} size={11}>
            Manage Collections with Ease
          </T>
        </View>
        <View>
          <IconButton
            name="Bell"
            label="Reminders"
            onPress={() => go("reminders")}
          />
          <View
            style={{
              position: "absolute",
              width: 7,
              height: 7,
              borderRadius: 5,
              backgroundColor: c.red,
              top: 5,
              right: 7,
            }}
          />
        </View>
      </Row>
      <Card style={{ paddingVertical: 9 }}>
        <Row>
          <Icon name="Store" size={29} />
          <Pressable onPress={() => go("setup-property")} style={{ flex: 1 }}>
            <Row>
              <T size={15} weight="bold">
                {propertyName}
              </T>
              <Icon name="ChevronDown" size={14} color={c.text} />
            </Row>
            <Row gap={5}>
              <T size={11} color={c.sub}>
                March 2026
              </T>
              <Icon name="CalendarDays" size={12} color={c.sub} />
            </Row>
          </Pressable>
          <Offline />
        </Row>
      </Card>
      <Card tone="teal" style={{ padding: 12, gap: 5, borderColor: c.border }}>
        <Row
          style={{ justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <View>
            <T size={11} color={c.sub}>
              Total Expected Rent (This Month)
            </T>
            <T size={27} weight="bold" style={{ letterSpacing: -1 }}>
              {money(420000)}
            </T>
          </View>
          <View style={{ alignItems: "flex-end", paddingTop: 3 }}>
            <Badge label="64%" icon="ArrowUp" tone="green" />
            <T size={8} color={c.sub}>
              vs last month
            </T>
          </View>
        </Row>
        <Row>
          <Progress value={64} height={10} />
          <T weight="bold" size={12} color={c.primary}>
            64%
          </T>
        </Row>
        <Row style={{ marginTop: 1 }}>
          <View style={{ flex: 1 }}>
            <T size={11} color={c.sub}>
              Collected
            </T>
            <T weight="bold" size={20} color={c.green}>
              {money(268000)}
            </T>
          </View>
          <View style={{ width: 1, height: 35, backgroundColor: c.border }} />
          <View style={{ flex: 1, paddingLeft: 10 }}>
            <T size={11} color={c.sub}>
              Remaining
            </T>
            <T weight="bold" size={20}>
              {money(152000)}
            </T>
          </View>
        </Row>
      </Card>
      <Row gap={7} style={{ flexWrap: "wrap" }}>
        {(
          [
            { label: "Paid", count: 12, tone: "green" },
            { label: "Partial", count: 4, tone: "orange" },
            { label: "Unpaid", count: 3, tone: "red" },
            { label: "Overdue", count: 1, tone: "red" },
          ] as const
        ).map((s) => (
          <Pressable
            key={s.label}
            onPress={() => setFilter(`${s.label} (${s.count})`)}
            style={{ flexBasis: "48%", flexGrow: 1 }}
          >
            <Card tone={s.tone} style={{ padding: 8, gap: 2 }}>
              <Row style={{ justifyContent: "space-between" }}>
                <T size={21} weight="bold" color={c[s.tone]}>
                  {s.count}
                </T>
                <Icon name="Store" size={15} color={c[s.tone]} />
              </Row>
              <T size={11} weight="medium" color={c[s.tone]}>
                {s.label}
              </T>
            </Card>
          </Pressable>
        ))}
      </Row>
      <MonthPicker month={month} onChange={setMonth} />
      <Search
        value={search}
        onChange={setSearch}
        onFilter={() =>
          setFilter(filter === "All (20)" ? "Overdue (1)" : "All (20)")
        }
      />
      <Chips
        options={[
          "All (20)",
          "Paid (12)",
          "Partial (4)",
          "Unpaid (3)",
          "Overdue (1)",
        ]}
        selected={filter}
        onSelect={setFilter}
      />
      <View style={{ gap: 4 }}>
        {filtered.map((shop) => (
          <Card
            key={shop.id}
            onPress={() => go("shop-details", shop.id)}
            style={{ padding: 6 }}
          >
            <Row gap={11}>
              <IconTile name="Store" tone={statusTone(shop.status)} size={43} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <T weight="bold" size={13}>
                  {language === "ps"
                    ? `دوکان ${shop.number}`
                    : `Shop ${shop.number}`}
                </T>
                <T size={11} color={c.sub} lines={1}>
                  {shop.id === 1 ? shop.keeper : shop.name}
                </T>
                <T size={10} color={c.sub}>
                  {shop.phone}
                </T>
                {shop.occupied && shop.rentalType === "prepaid" && (
                  <Badge label="Prepaid" tone="blue" small />
                )}
              </View>
              <View style={{ flex: 1.05, gap: 1 }}>
                <Badge
                  label={shop.status}
                  tone={statusTone(shop.status)}
                  icon={statusIcon(shop.status)}
                  small
                />
                <T
                  size={13}
                  weight="bold"
                  color={shop.status === "Paid" ? c.green : c.text}
                >
                  {money(shop.rent)}
                </T>
                <T
                  size={9}
                  color={
                    shop.status === "Unpaid" || shop.status === "Overdue"
                      ? c.red
                      : c.sub
                  }
                >
                  {shop.prepaid
                    ? shop.prepaid.currentDueDate
                      ? `AFN ${number(shop.prepaid.currentApplied)}`
                      : "Not started"
                    : shop.status === "Paid"
                      ? "Paid on 5 Mar 2026"
                      : shop.status === "Partial"
                        ? `Paid: ${number(shop.paid)} · Due: ${number(rentPosition(shop, today).due)}`
                        : shop.status === "Unpaid"
                          ? "No payment yet"
                          : shop.status === "Overdue"
                            ? "15 days overdue"
                            : `Used credit: ${number(shop.rent)}`}
                </T>
              </View>
              <Icon name="ChevronRight" size={17} color={c.sub} />
            </Row>
          </Card>
        ))}
        {filtered.length === 0 && <EmptySearch />}
      </View>
      <Row>
        <Button
          title="Collect Rent"
          icon="Plus"
          onPress={() => go("collect-rent", 2)}
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

function EmptySearch() {
  const { c } = useUI();
  return (
    <Card style={{ alignItems: "center", gap: 7, padding: 24 }}>
      <IconTile name="Search" size={46} />
      <T weight="semibold">No matching shops</T>
      <T color={c.sub} size={11}>
        Try another name or clear your filters.
      </T>
    </Card>
  );
}

export function ShopsScreen() {
  const { c } = useUI();
  const go = useGo();
  const shops = usePreviewLedger((s) => s.shops);
  const occupied = shops.filter((shop) => shop.occupied).length;
  const prepaid = shops.filter(
    (shop) => shop.occupied && shop.rentalType === "prepaid",
  ).length;
  const today = useToday();
  const vacant = shops.length - occupied;
  const occupiedPercent = shops.length
    ? Math.round((occupied / shops.length) * 100)
    : 0;
  const vacantPercent = shops.length ? 100 - occupiedPercent : 0;
  const filters = [
    `All (${shops.length})`,
    `Occupied (${occupied})`,
    `Vacant (${vacant})`,
    `Prepaid (${prepaid})`,
  ];
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const filtered = shops.filter(
    (s) =>
      `${s.name} ${s.keeper} ${s.number} ${s.phone}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter.startsWith("All") ||
        (filter.startsWith("Prepaid")
          ? s.occupied && s.rentalType === "prepaid"
          : filter.startsWith("Occupied")
            ? s.occupied
            : !s.occupied)),
  );
  return (
    <View style={{ flex: 1 }}>
      <Page
        title="Shops"
        subtitle="Manage Your Shops with Ease"
        back={false}
        trailing={<Offline />}
      >
        <Row gap={8}>
          <Metric
            label="Total Shops"
            value={String(shops.length)}
            icon="Store"
            tone="teal"
          />
          <Metric
            label="Occupied Shops"
            value={String(occupied)}
            icon="Store"
            tone="green"
            detail={`${occupiedPercent}% Occupied`}
          />
          <Metric
            label="Vacant Shops"
            value={String(vacant)}
            icon="Store"
            tone="muted"
            detail={`${vacantPercent}% Vacant`}
          />
        </Row>
        <Search
          value={search}
          onChange={setSearch}
          placeholder="Search shops, shopkeeper or number…"
          onFilter={() =>
            setFilter(filter.startsWith("Vacant") ? "All" : "Vacant")
          }
        />
        <Chips
          options={filters}
          selected={
            filters.find((option) =>
              option.startsWith(filter.split(" (")[0]),
            ) ?? filters[0]
          }
          onSelect={setFilter}
        />
        {filtered.map((shop) => (
          <Card
            key={shop.id}
            onPress={() => go("shop-details", shop.id)}
            style={{ padding: 8 }}
          >
            <Row>
              <Image
                source={shopImages[shop.image]}
                style={{ width: 55, height: 59, borderRadius: 8 }}
              />
              <View style={{ flex: 1.1, minWidth: 0 }}>
                <T weight="bold" size={13}>{`Shop #${shop.number}`}</T>
                <T size={10} color={c.sub} lines={1}>
                  {shop.name}
                </T>
                <T size={10} color={c.sub}>
                  {shop.keeper}
                </T>
                <T size={9} color={c.sub}>
                  {shop.phone}
                </T>
              </View>
              <View
                style={{ width: 1, height: 47, backgroundColor: c.border }}
              />
              <View style={{ flex: 1.05 }}>
                <Badge
                  label={rentalTag(shop)}
                  tone={
                    shop.occupied
                      ? shop.rentalType === "prepaid"
                        ? "blue"
                        : "green"
                      : "muted"
                  }
                  icon={shop.occupied ? "CircleCheck" : "Store"}
                  small
                />
                <Row style={{ marginTop: 6 }}>
                  <View style={{ flex: 1 }}>
                    <T size={8} color={c.sub}>
                      Monthly Rent
                    </T>
                    <T size={10} weight="bold">
                      {money(shop.rent)}
                    </T>
                  </View>
                  <View>
                    <T size={8} color={c.sub}>
                      Balance
                    </T>
                    <T size={10} weight="bold" color={c.primary}>
                      {number(rentPosition(shop, today).due)}
                    </T>
                  </View>
                </Row>
              </View>
              <Icon name="ChevronRight" size={15} color={c.sub} />
            </Row>
          </Card>
        ))}
        {filtered.length === 0 && <EmptySearch />}
        <View style={{ height: 65 }} />
      </Page>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add Shop"
        onPress={() => go("add-shop")}
        style={{
          position: "absolute",
          right: 15,
          bottom: 15,
          width: 70,
          height: 70,
          borderRadius: 35,
          backgroundColor: c.primary,
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          boxShadow: "0 5px 18px #007e7933",
        }}
      >
        <Icon name="Plus" size={26} color="#fff" />
        <T size={10} color="#fff" weight="semibold">
          Add Shop
        </T>
      </Pressable>
    </View>
  );
}

export const categories = [
  { name: "Maintenance", percent: 35, amount: 32400, color: "#08b5a3" },
  { name: "Utilities", percent: 22, amount: 20400, color: "#11a9a8" },
  { name: "Salaries", percent: 18, amount: 16700, color: "#8b5cf6" },
  { name: "Marketing", percent: 10, amount: 9300, color: "#ef4c83" },
  { name: "Personal", percent: 8, amount: 7400, color: "#ff9f24" },
  { name: "Others", percent: 7, amount: 6300, color: "#a7b5c8" },
];
export function ExpenseDonut() {
  const { c } = useUI();
  return (
    <Row gap={12}>
      <Donut />
      <View style={{ flex: 1, gap: 9 }}>
        {categories.map((cat) => (
          <Row key={cat.name} gap={5}>
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: cat.color,
              }}
            />
            <T size={9} color={c.sub} style={{ flex: 1 }}>
              {cat.name}
            </T>
            <T size={9} weight="semibold">{`${cat.percent}%`}</T>
            <T size={8} color={c.sub}>
              {number(cat.amount)}
            </T>
          </Row>
        ))}
      </View>
    </Row>
  );
}
export function SpendScreen() {
  const { c } = useUI();
  const go = useGo();
  const extra = usePreviewLedger((s) => s.expenses);
  return (
    <Page
      title="Expenses"
      subtitle="March 2026  ▢"
      back={false}
      trailing={<Offline />}
    >
      <Card tone="teal">
        <Row>
          <IconTile name="Wallet" size={45} />
          <View style={{ flex: 1 }}>
            <T size={11} color={c.sub}>
              Total Expenses
            </T>
            <T size={24} weight="bold">
              {money(92500 + extra.reduce((n, e) => n + e.amount, 0))}
            </T>
            <T size={9} color={c.red}>
              ↑ 12%{" "}
              <T size={9} color={c.sub}>
                vs last month
              </T>
            </T>
          </View>
          <View style={{ gap: 8 }}>
            {[
              ["House", "Property", "68,500"],
              ["UserRound", "Personal", "12,000"],
              ["Package", "Goods Taken", "12,000"],
            ].map(([icon, text, value]) => (
              <Row key={text} gap={4}>
                <Icon name={icon as IconName} size={12} />
                <T size={8} color={c.sub}>
                  {text}
                </T>
                <T size={9} weight="semibold">
                  {value}
                </T>
              </Row>
            ))}
          </View>
        </Row>
      </Card>
      <Row>
        <Metric
          label="Property Expenses"
          value={money(68500)}
          tone="blue"
          icon="House"
          detail="74%"
        />
        <Metric
          label="Personal Expenses"
          value={money(12000)}
          tone="teal"
          icon="UserRound"
          detail="13%"
        />
        <Metric
          label="Goods Taken From Shops"
          value={money(12000)}
          tone="orange"
          icon="Package"
          detail="13%"
        />
      </Row>
      <Row>
        <Card
          tone="red"
          style={{ flex: 1 }}
          onPress={() => go("goods-settlement", 2)}
        >
          <Row>
            <IconTile name="FileText" tone="red" size={35} />
            <View style={{ flex: 1 }}>
              <T size={10} color={c.sub}>
                Unsettled Goods Payables
              </T>
              <T weight="bold" size={14} color={c.red}>
                {money(25000)}
              </T>
            </View>
            <Icon name="ChevronRight" size={14} color={c.sub} />
          </Row>
        </Card>
        <Card
          tone="blue"
          style={{ flex: 1 }}
          onPress={() => go("goods-taken", 1)}
        >
          <T size={10} color={c.sub}>
            Total Goods Taken
          </T>
          <T weight="bold" size={17}>
            {money(12000)}
          </T>
          <T size={9} color={c.sub}>
            3 shops · 2 unsettled
          </T>
        </Card>
      </Row>
      <Row>
        <Button
          title="Add Expense"
          icon="Plus"
          onPress={() => go("add-expense")}
          style={{ flex: 1 }}
          compact
        />
        <Button
          title="Record Goods Taken"
          icon="Package"
          onPress={() => go("goods-taken", 1)}
          variant="secondary"
          style={{ flex: 1 }}
          compact
        />
      </Row>
      <Card>
        <Section title="Expense Categories" action="This Month">
          <ExpenseDonut />
        </Section>
      </Card>
      <Card style={{ padding: 10 }}>
        <Section
          title="Recent Spending Transactions"
          action="View All"
          onPress={() => go("shop-financial-report", 1)}
        >
          <View>
            {extra.map((e, i) => (
              <TransactionRow
                key={`extra-${i}`}
                title={e.description}
                subtitle={e.category}
                amount={e.amount}
                icon="Receipt"
                tone="teal"
              />
            ))}
            <TransactionRow
              title="Shop 01 - AC Maintenance"
              subtitle="Property · Shop 01"
              amount={8500}
              icon="Wrench"
              tone="blue"
            />
            <TransactionRow
              title="Electricity Bill"
              subtitle="Property · All Shops"
              amount={18500}
              icon="Zap"
              tone="teal"
            />
            <TransactionRow
              title="Staff Salary - Ahmad"
              subtitle="Personal"
              amount={12000}
              icon="UserRound"
              tone="teal"
            />
            <TransactionRow
              title="Social Media Ads"
              subtitle="Personal"
              amount={4500}
              icon="Megaphone"
              tone="orange"
            />
            <TransactionRow
              title="Goods Taken - Bilal Electronics"
              subtitle="From Shops"
              amount={12000}
              icon="ShoppingCart"
              tone="orange"
              onPress={() => go("goods-settlement", 2)}
            />
          </View>
        </Section>
      </Card>
    </Page>
  );
}
export function TransactionRow({
  title,
  subtitle,
  amount,
  icon = "Wallet",
  tone = "teal",
  onPress,
}: {
  title: string;
  subtitle: string;
  amount: number;
  icon?: IconName;
  tone?: "teal" | "blue" | "orange" | "red" | "purple";
  onPress?: () => void;
}) {
  const { c } = useUI();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: c.border,
      }}
    >
      <Row>
        <IconTile name={icon} tone={tone} size={29} />
        <View style={{ flex: 1 }}>
          <T size={10} weight="medium">
            {title}
          </T>
          <T size={9} color={c.sub}>
            {subtitle}
          </T>
        </View>
        <T size={10} weight="semibold">
          {money(amount)}
        </T>
        {onPress && <Icon name="ChevronRight" size={13} color={c.sub} />}
      </Row>
    </Pressable>
  );
}

export function ReportsScreen() {
  const { c, notify } = useUI();
  const go = useGo();
  const [month, setMonth] = useState("March 2026");
  const [scope, setScope] = useState("All Shops");
  const metrics: {
    label: string;
    value: number;
    tone: "teal" | "green" | "blue" | "orange" | "purple" | "red";
    icon: IconName;
    detail: string;
  }[] = [
    {
      label: "Total Expected Rent",
      value: 420000,
      tone: "teal",
      icon: "Database",
      detail: "↑ 12% vs last month",
    },
    {
      label: "Cash Collected",
      value: 268000,
      tone: "green",
      icon: "Wallet",
      detail: "↑ 18% vs last month",
    },
    {
      label: "Other-Method Collections",
      value: 22000,
      tone: "blue",
      icon: "CreditCard",
      detail: "↑ 18% vs last month",
    },
    {
      label: "Credits Applied",
      value: 22000,
      tone: "orange",
      icon: "CreditCard",
      detail: "↑ 47% vs last month",
    },
    {
      label: "Goods Offsets",
      value: 12000,
      tone: "purple",
      icon: "Package",
      detail: "↑ 20% vs last month",
    },
    {
      label: "Outstanding Rent",
      value: 152000,
      tone: "red",
      icon: "TriangleAlert",
      detail: "↑ 5% vs last month",
    },
    {
      label: "Total Expenses",
      value: 92500,
      tone: "blue",
      icon: "FileText",
      detail: "↓ 12% vs last month",
    },
    {
      label: "Net Cash Flow",
      value: 175500,
      tone: "teal",
      icon: "ChartNoAxesColumnIncreasing",
      detail: "Cash received − cash spent",
    },
  ];
  return (
    <Page
      title="Reports"
      subtitle="Insights for a Better Tomorrow"
      back={false}
      trailing={<Offline />}
    >
      <Row>
        <Select
          value={month}
          options={["March 2026", "February 2026", "January 2026"]}
          onChange={setMonth}
        />
        <Select
          value={scope}
          options={["All Shops", "Shop 01", "Shop 02"]}
          onChange={setScope}
        />
      </Row>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {metrics.map((m) => (
          <Metric
            key={m.label}
            compact
            label={m.label}
            value={number(m.value)}
            tone={m.tone}
            icon={m.icon}
            detail={
              m.label === "Net Cash Flow"
                ? "Cash basis · AFN"
                : m.detail.split(" vs")[0]
            }
            style={{ flexBasis: "23%", minWidth: 0, padding: 7 }}
          />
        ))}
      </View>
      <Row style={{ alignItems: "stretch" }} gap={7}>
        <Card style={{ flex: 1, padding: 8 }}>
          <Section title="Expected vs Collected">
            <BarChart small />
          </Section>
        </Card>
        <Card style={{ flex: 1, padding: 8 }}>
          <Section title="Cash Collection Trend">
            <TrendChart />
          </Section>
        </Card>
      </Row>
      <Row style={{ alignItems: "stretch" }} gap={7}>
        <Card style={{ flex: 1, padding: 8 }}>
          <Section title="Outstanding by Shop">
            <View style={{ gap: 9 }}>
              {[45000, 32000, 28000, 25000, 22000].map((v, i) => (
                <Pressable
                  key={i}
                  onPress={() => go("shop-financial-report", i + 1)}
                >
                  <Row gap={5}>
                    <T size={8} color={c.sub}>{`Shop 0${i + 1}`}</T>
                    <Progress
                      value={v / 500}
                      height={11}
                      color={i < 2 ? "#ff6b80" : "#ffb34e"}
                    />
                    <T size={8}>{number(v)}</T>
                  </Row>
                </Pressable>
              ))}
            </View>
          </Section>
        </Card>
        <Card style={{ flex: 1, padding: 8, alignItems: "center" }}>
          <T weight="semibold" size={11}>
            Expenses by Category
          </T>
          <Donut compact />
          <Row gap={4}>
            <Badge label="Property 74%" tone="blue" small />
          </Row>
        </Card>
      </Row>
      <Card>
        <Section title="Yearly Summary (2025 – 2026)">
          <BarChart />
        </Section>
      </Card>
      <Button
        title="Export CSV Summary"
        icon="Download"
        variant="outline"
        onPress={() =>
          notify(
            "CSV export will connect to the production ledger. This screen currently displays sample reports.",
          )
        }
        compact
      />
      <T color={c.sub} size={9}>
        Sample March 2026 report · values are reference fixtures.
      </T>
    </Page>
  );
}

export function SettingsScreen() {
  const { c, notify } = useUI();
  const go = useGo();
  const prefs = usePreferences();
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const item = (
    title: string,
    subtitle: string,
    icon: IconName,
    tone: "green" | "blue" | "orange" | "teal" | "purple" | "red",
    action: () => void,
    value?: string,
  ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={action}
      style={{ paddingVertical: 8 }}
    >
      <Row gap={11}>
        <IconTile name={icon} tone={tone} size={35} />
        <View style={{ flex: 1 }}>
          <T size={14} weight="semibold">
            {title}
          </T>
          <T size={10} color={c.sub}>
            {subtitle}
          </T>
        </View>
        {value && (
          <T size={11} color={c.sub}>
            {value}
          </T>
        )}
        <Icon name="ChevronRight" color={c.sub} size={17} />
      </Row>
    </Pressable>
  );
  return (
    <Page
      title="Settings"
      subtitle="Manage your app preferences"
      back={false}
      leading={
        <View
          style={{
            width: 49,
            height: 49,
            borderRadius: 13,
            backgroundColor: c.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="Settings" size={31} color="#fff" strokeWidth={2.8} />
        </View>
      }
    >
      <Card style={{ paddingVertical: 6 }}>
        <T size={10} color={c.sub} weight="medium" style={{ paddingTop: 5 }}>
          GENERAL
        </T>
        {item(
          "Language",
          "Choose your preferred language",
          "Globe",
          "green",
          () => go("language"),
          prefs.language === "en" ? "English⌄" : "پښتو⌄",
        )}
        <Divider />
        {item(
          "Appearance",
          "Choose light, dark or system theme",
          "Palette",
          "blue",
          () => setAppearanceOpen(!appearanceOpen),
          prefs.theme === "system"
            ? "System⌄"
            : prefs.theme === "dark"
              ? "Dark⌄"
              : "Light⌄",
        )}
        {appearanceOpen && (
          <Chips
            options={["Light", "Dark", "System"]}
            selected={prefs.theme[0].toUpperCase() + prefs.theme.slice(1)}
            onSelect={(value) => {
              prefs.setTheme(
                value.toLowerCase() as "light" | "dark" | "system",
              );
              setAppearanceOpen(false);
            }}
          />
        )}
        <Divider />
        {item(
          "Currency",
          "Default currency for rent amounts",
          "Database",
          "orange",
          () => notify("AFN · whole afghanis. This ledger uses one currency."),
          "AFN",
        )}
      </Card>
      <Card style={{ paddingVertical: 6 }}>
        <T size={10} color={c.sub} weight="medium" style={{ paddingTop: 5 }}>
          NOTIFICATIONS
        </T>
        {item(
          "Rent Reminders",
          "Manage collection and backup reminders",
          "Bell",
          "green",
          () => go("reminders"),
          prefs.reminders ? "On" : "Off",
        )}
      </Card>
      <Card style={{ paddingVertical: 6 }}>
        <T size={10} color={c.sub} weight="medium" style={{ paddingTop: 5 }}>
          DATA & STORAGE
        </T>
        {item(
          "Backup & Restore",
          "Keep your data safe and restore anytime",
          "DatabaseBackup",
          "teal",
          () => go("backup-restore"),
        )}
        <Divider />
        {item(
          "Device Transfer",
          "Move your data to another device",
          "Smartphone",
          "purple",
          () => go("device-transfer"),
        )}
        <Divider />
        {item(
          "Data Management",
          "View sample data and preview states",
          "Trash2",
          "red",
          () => go("empty-states"),
        )}
      </Card>
      <Card style={{ paddingVertical: 6 }}>
        <T size={10} color={c.sub} weight="medium" style={{ paddingTop: 5 }}>
          ABOUT
        </T>
        {item(
          "About Shop Rent Manager",
          "Visual preview · sample data · not a live ledger",
          "Info",
          "blue",
          () =>
            notify(
              "Shop Rent Manager v1.0.0 · UI preview. Sample transactions reset when the app restarts.",
            ),
          "v1.0.0",
        )}
      </Card>
      <Button
        title="Explore All Screens"
        icon="PanelsTopLeft"
        onPress={() => go("screen-gallery")}
        variant="outline"
      />
    </Page>
  );
}

export function ScreenGallery() {
  const { c } = useUI();
  const go = useGo();
  return (
    <Page
      title="Screen Library"
      subtitle="Every reference, built as a native screen"
    >
      <Info
        title="Interactive visual preview"
        text="Sample data powers these screens. Settings persist; financial records are demo-only. Production database, encryption, and transfer are separate implementation stages."
      />
      {[...new Set(screenReferences.map((s) => s.group))].map((group) => (
        <Section key={group} title={group}>
          <View style={{ gap: 6 }}>
            {screenReferences
              .filter((s) => s.group === group)
              .map((screen, i) => (
                <Card key={screen.id} onPress={() => go(screen.id)}>
                  <Row>
                    <IconTile
                      name="PanelsTopLeft"
                      tone={i % 2 ? "blue" : "teal"}
                      size={32}
                    />
                    <View style={{ flex: 1 }}>
                      <T weight="semibold" size={12}>
                        {screen.title}
                      </T>
                      <T size={9} color={c.sub}>
                        {screen.file}
                      </T>
                    </View>
                    <Icon name="ChevronRight" size={16} color={c.sub} />
                  </Row>
                </Card>
              ))}
          </View>
        </Section>
      ))}
    </Page>
  );
}

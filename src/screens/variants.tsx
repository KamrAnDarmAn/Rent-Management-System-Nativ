import React from "react";
import { View, Image, Pressable, ActivityIndicator } from "react-native";
import {
  Badge,
  Button,
  Card,
  Check,
  Field,
  Icon,
  IconName,
  IconTile,
  Info,
  Logo,
  Page,
  Progress,
  Row,
  Section,
  T,
  light,
  money,
  useGo,
  useUI,
} from "../ui";
import { usePreferences } from "../store";
import { ScreenId } from "../types";

export function WelcomeScreen({ splash = false }: { splash?: boolean }) {
  const { c } = useUI();
  const go = useGo();
  const setLanguage = usePreferences((s) => s.setLanguage);
  if (splash)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: c.bg,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 35,
          gap: 10,
        }}
      >
        <View style={{ flex: 1 }} />
        <Logo size={110} />
        <T size={27} weight="bold" style={{ letterSpacing: -1 }}>
          Shop Rent Manager
        </T>
        <T size={14} color={c.sub}>
          Simple. Organized. Always in Control.
        </T>
        <Image
          source={require("../../assets/reference/shop-illustration.png")}
          resizeMode="contain"
          style={{ width: "100%", height: 235, marginTop: 15 }}
        />
        <Pressable
          accessibilityLabel="Continue from splash"
          onPress={() => go("get-started")}
          style={{ alignItems: "center", gap: 10, marginTop: 20 }}
        >
          <ActivityIndicator size="large" color={c.primary} />
          <T size={13} color={c.sub}>
            Loading…
          </T>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Button
          title="Continue"
          onPress={() => go("get-started")}
          variant="ghost"
          compact
        />
        <T size={10} color={c.sub} style={{ paddingBottom: 25 }}>
          Manage Shops · Grow Peacefully
        </T>
      </View>
    );
  return (
    <Page
      back={false}
      noPadding
      footer={
        <View style={{ gap: 10 }}>
          <Button
            title="Get Started"
            icon="ArrowRight"
            onPress={() => go("setup-property")}
          />
          <Pressable onPress={() => go("collect")}>
            <T
              size={11}
              color={c.sub}
              style={{ textAlign: "center", paddingVertical: 4 }}
            >
              Explore the sample app
            </T>
          </Pressable>
        </View>
      }
    >
      <Row
        style={{
          justifyContent: "flex-end",
          paddingHorizontal: 18,
          paddingTop: 20,
        }}
      >
        <Card style={{ padding: 8, borderRadius: 22 }}>
          <Row>
            <Icon name="Globe" size={17} />
            <Pressable onPress={() => setLanguage("en")}>
              <T size={12} color={c.primary}>
                English
              </T>
            </Pressable>
            <T color={c.border}>|</T>
            <Pressable onPress={() => setLanguage("ps")}>
              <T size={14} color={c.sub}>
                پښتو
              </T>
            </Pressable>
          </Row>
        </Card>
      </Row>
      <Row style={{ paddingHorizontal: 20, marginTop: 15, marginBottom: 5 }}>
        <Logo size={64} />
        <View style={{ flex: 1 }}>
          <T size={21} weight="bold" style={{ letterSpacing: -0.7 }}>
            Shop Rent Manager
          </T>
          <T size={11} color={c.sub}>
            Simple. Organized. Always in Control.
          </T>
        </View>
      </Row>
      <Image
        source={require("../../assets/reference/shops-illustration.png")}
        style={{ width: "100%", height: 225 }}
        resizeMode="contain"
      />
      <View style={{ paddingHorizontal: 25, gap: 12 }}>
        <T
          size={28}
          weight="bold"
          style={{ textAlign: "center", letterSpacing: -1 }}
        >
          Manage your shops{`\n`}with confidence.
        </T>
        <T size={16} color={c.sub} style={{ textAlign: "center" }}>
          Track rent, payments, credits and expenses — even offline.
        </T>
      </View>
      <Row style={{ marginTop: 13, paddingHorizontal: 16 }}>
        {[
          { title: "Offline\nFirst", icon: "WifiOff" },
          { title: "Your Data\nStays on Device", icon: "Database" },
          { title: "Secure &\nPrivate", icon: "ShieldCheck" },
          {
            title: "Built for\nLandlords",
            icon: "ChartNoAxesColumnIncreasing",
          },
        ].map((feature) => (
          <View
            key={feature.title}
            style={{ flex: 1, alignItems: "center", gap: 7 }}
          >
            <IconTile name={feature.icon as IconName} size={46} />
            <T size={10} color={c.sub} style={{ textAlign: "center" }}>
              {feature.title}
            </T>
          </View>
        ))}
      </Row>
      <Row style={{ justifyContent: "center", paddingVertical: 11 }}>
        {[0, 1, 2].map((n) => (
          <View
            key={n}
            style={{
              width: 7,
              height: 7,
              borderRadius: 5,
              backgroundColor: n === 0 ? c.primary : c.border,
            }}
          />
        ))}
      </Row>
    </Page>
  );
}

export function EmptyStatesScreen() {
  const artwork = [
    require("../../assets/reference/empty-shops.png"),
    require("../../assets/reference/empty-keepers.png"),
    require("../../assets/reference/empty-payments.png"),
    require("../../assets/reference/empty-expenses.png"),
    require("../../assets/reference/empty-overdue.png"),
    require("../../assets/reference/empty-reports.png"),
  ];
  const { c } = useUI();
  const go = useGo();
  const states: {
    title: string;
    description: string;
    action: string;
    icon: IconName;
    tone: "teal" | "orange" | "blue" | "purple" | "red" | "green";
    route: ScreenId;
  }[] = [
    {
      title: "No shops added yet",
      description:
        "Add your first shop to get started and manage rent collections easily.",
      action: "Add Shop",
      icon: "Store",
      tone: "teal",
      route: "add-shop",
    },
    {
      title: "No shopkeepers added",
      description:
        "Add shopkeepers to assign shops and track their rent payments.",
      action: "Add Shopkeeper",
      icon: "UsersRound",
      tone: "orange",
      route: "add-shop",
    },
    {
      title: "No payments recorded",
      description: "Once you receive rent payments, they'll appear here.",
      action: "Record Payment",
      icon: "CreditCard",
      tone: "blue",
      route: "collect-rent",
    },
    {
      title: "No expenses added",
      description:
        "Add your shop expenses to keep track of your spending clearly.",
      action: "Add Expense",
      icon: "FilePlus2",
      tone: "purple",
      route: "add-expense",
    },
    {
      title: "No overdue rent",
      description:
        "Great! All your rent is paid. Check shops to stay up to date.",
      action: "View Shops",
      icon: "CircleCheck",
      tone: "red",
      route: "shops",
    },
    {
      title: "No reports available",
      description:
        "Reports will be generated when you add shops and record transactions.",
      action: "View Reports",
      icon: "ChartNoAxesColumnIncreasing",
      tone: "green",
      route: "reports",
    },
  ];
  return (
    <Page
      title="Shop Rent Manager"
      subtitle="Manage Collections with Ease"
      back={false}
      leading={<Logo size={38} />}
      trailing={
        <Pressable onPress={() => go("reminders")}>
          <Icon name="Bell" color={c.text} />
        </Pressable>
      }
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {states.map((state, index) => (
          <Card
            key={state.title}
            tone={state.tone}
            style={{
              width: "48%",
              flexGrow: 1,
              alignItems: "center",
              padding: 13,
              gap: 10,
            }}
          >
            <Image
              source={artwork[index]}
              resizeMode="contain"
              style={{ width: "100%", height: 66 }}
            />
            <T size={12} weight="bold" style={{ textAlign: "center" }}>
              {state.title}
            </T>
            <T
              size={10}
              color={c.sub}
              style={{ textAlign: "center", minHeight: 55 }}
            >
              {state.description}
            </T>
            <Button
              title={state.action}
              icon="Plus"
              onPress={() => go(state.route)}
              compact
              variant={state.tone === "teal" ? "primary" : "secondary"}
              style={{ alignSelf: "stretch" }}
            />
          </Card>
        ))}
      </View>
      <Card tone="blue">
        <Row>
          <Image
            source={require("../../assets/reference/empty-backup.png")}
            resizeMode="contain"
            style={{ width: 80, height: 65 }}
          />
          <View style={{ flex: 1, gap: 5 }}>
            <T size={13} weight="bold">
              No backups yet
            </T>
            <T size={10} color={c.sub}>
              Create a backup to keep your data safe and secure.
            </T>
            <Button
              title="Create Backup"
              icon="DatabaseBackup"
              compact
              variant="outline"
              onPress={() => go("backup-restore")}
            />
          </View>
        </Row>
      </Card>
    </Page>
  );
}

export function ErrorStatesScreen() {
  const { c, notify } = useUI();
  const go = useGo();
  const states: {
    title: string;
    text: string;
    action: string;
    icon: IconName;
    tone: "red" | "orange" | "blue" | "green";
    route?: ScreenId;
  }[] = [
    {
      title: "Insufficient Credit",
      text: "Available construction credit is less than the selected rent amount.",
      action: "Adjust Credit",
      icon: "Wallet",
      tone: "red",
      route: "apply-credit",
    },
    {
      title: "Exceeds Allowed Allocation",
      text: "The selected amount exceeds outstanding rent. Review your allocation.",
      action: "Use a Different Amount",
      icon: "TriangleAlert",
      tone: "orange",
      route: "collect-rent",
    },
    {
      title: "Month is Closed",
      text: "Reopen the month to change charges or transactions dated in that month.",
      action: "View Details",
      icon: "LockKeyhole",
      tone: "red",
      route: "month-closing",
    },
    {
      title: "Backup Failed",
      text: "The backup could not be completed. Your existing records are unchanged.",
      action: "Try Again",
      icon: "CloudAlert",
      tone: "red",
      route: "backup-restore",
    },
    {
      title: "Invalid File",
      text: "The selected file is not a valid compatible backup package.",
      action: "Choose Another File",
      icon: "FileWarning",
      tone: "red",
      route: "backup-restore",
    },
    {
      title: "Transfer Conflict",
      text: "The combined history would overspend credit. No changes were imported.",
      action: "Review Changes",
      icon: "TriangleAlert",
      tone: "orange",
      route: "device-transfer",
    },
    {
      title: "Permission Denied",
      text: "Local network access is needed to discover and connect to nearby devices.",
      action: "Review Permissions",
      icon: "ShieldAlert",
      tone: "red",
    },
    {
      title: "Connection Interrupted",
      text: "The transfer was interrupted. Your existing data is safe. Retry when connected.",
      action: "Resume",
      icon: "WifiOff",
      tone: "blue",
      route: "device-transfer",
    },
    {
      title: "Payment Saved Successfully",
      text: "A successful save appears only after the transaction is durably committed.",
      action: "View History",
      icon: "CircleCheck",
      tone: "green",
      route: "rent-history",
    },
    {
      title: "Transaction Reversed",
      text: "The reversal is linked to the original entry and preserved in history.",
      action: "View Transaction",
      icon: "Undo2",
      tone: "blue",
      route: "reverse-transaction",
    },
  ];
  return (
    <Page
      title="Shop Rent Manager"
      subtitle="Error & Edge States"
      back={false}
      leading={<Logo size={37} />}
    >
      <Row style={{ alignItems: "flex-start" }}>
        <Card style={{ flex: 1, padding: 9, gap: 5 }}>
          <T size={11} weight="bold">
            01. Invalid Amount
          </T>
          <Field
            label="Amount"
            value="-500"
            error="Amount must be greater than zero."
            numeric
          />
        </Card>
        <Card style={{ flex: 1, padding: 9, gap: 5 }}>
          <T size={11} weight="bold">
            02. Duplicate Shop Number
          </T>
          <Field
            label="Shop Number"
            value="01"
            error="Shop number already exists."
          />
        </Card>
      </Row>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {states.map((state, i) => (
          <Card
            key={state.title}
            tone={state.tone}
            style={{ width: "48%", flexGrow: 1, padding: 9, gap: 7 }}
          >
            <Row style={{ alignItems: "flex-start" }}>
              <Icon name={state.icon} size={20} color={c[state.tone]} />
              <T
                size={11}
                weight="bold"
                style={{ flex: 1 }}
              >{`${String(i + 3).padStart(2, "0")}. ${state.title}`}</T>
            </Row>
            <T size={9} color={c.sub} style={{ minHeight: 48 }}>
              {state.text}
            </T>
            <Button
              title={state.action}
              onPress={() =>
                state.route
                  ? go(state.route)
                  : notify(
                      "Permission handling will connect to native device services.",
                    )
              }
              compact
              variant="outline"
            />
          </Card>
        ))}
      </View>
    </Page>
  );
}

export function DesignSystemScreen() {
  const { c } = useUI();
  const go = useGo();
  return (
    <Page
      title="Design System"
      subtitle="Modern · Simple · Reliable · Offline First"
    >
      <Row>
        <Logo size={58} />
        <View>
          <T size={21} weight="bold">
            Shop Rent Manager
          </T>
          <T size={11} color={c.sub}>
            UI / UX DESIGN SYSTEM
          </T>
        </View>
      </Row>
      <Section title="01. Color System">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {[
            { label: "Primary", value: "#0f766e" },
            { label: "Primary Dark", value: "#115e59" },
            { label: "Primary Light", value: "#ccfbf1" },
            { label: "Background", value: "#f8fafc" },
            { label: "Text", value: "#0f172a" },
            { label: "Success", value: "#15803d" },
            { label: "Warning", value: "#d97706" },
            { label: "Danger", value: "#dc2626" },
            { label: "Info", value: "#2563eb" },
          ].map((color) => (
            <View key={color.label} style={{ width: "30%", gap: 5 }}>
              <View
                style={{
                  height: 47,
                  borderRadius: 9,
                  backgroundColor: color.value,
                  borderWidth: 1,
                  borderColor: c.border,
                }}
              />
              <T size={10} weight="semibold">
                {color.label}
              </T>
              <T size={9} color={c.sub}>
                {color.value}
              </T>
            </View>
          ))}
        </View>
      </Section>
      <Section title="Dark Theme Colors">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {[
            { label: "Background", color: "#0b1220" },
            { label: "Surface", color: "#111827" },
            { label: "Elevated Surface", color: "#1e293b" },
            { label: "Primary Accent", color: "#2dd4bf" },
            { label: "Primary Text", color: "#f8fafc" },
            { label: "Secondary Text", color: "#94a3b8" },
            { label: "Border", color: "#334155" },
            { label: "Success", color: "#4ade80" },
            { label: "Warning", color: "#fbbf24" },
          ].map((swatch) => (
            <View key={swatch.label} style={{ width: "30%", gap: 4 }}>
              <View
                style={{
                  height: 42,
                  backgroundColor: swatch.color,
                  borderRadius: 9,
                  borderWidth: 1,
                  borderColor: c.border,
                }}
              />
              <T size={10}>{swatch.label}</T>
              <T size={9} color={c.sub}>
                {swatch.color}
              </T>
            </View>
          ))}
        </View>
      </Section>
      <Card>
        <Section title="02. Typography">
          <T size={32} weight="bold">
            Large Title
          </T>
          <T size={24} weight="semibold">
            Section Title
          </T>
          <T size={18} weight="semibold">
            Card Title
          </T>
          <T size={16}>Regular Text</T>
          <T size={14} color={c.sub}>
            Secondary Text
          </T>
          <T size={12} color={c.sub}>
            Helper Text · مرستندوی متن
          </T>
        </Section>
      </Card>
      <Card>
        <Section title="03. Buttons">
          <Button title="Add Shop" icon="Plus" onPress={() => go("add-shop")} />
          <Button
            title="View Details"
            variant="secondary"
            onPress={() => go("shop-details")}
          />
          <Button
            title="Edit Shop"
            variant="outline"
            onPress={() => go("edit-shop")}
          />
          <Button
            title="Delete"
            variant="danger"
            onPress={() => go("error-states")}
          />
        </Section>
      </Card>
      <Card>
        <Section title="06. Input Fields">
          <Field label="Default" placeholder="Enter shop name" />
          <Field label="With Icon" placeholder="Search shops…" icon="Search" />
          <Field
            label="Error"
            value=""
            placeholder="Enter shop name"
            error="Shop name is required"
            readOnly
          />
          <Field label="Date" value="2026-03-15" icon="CalendarDays" readOnly />
        </Section>
      </Card>
      <Card tone="teal">
        <Section title="07. Financial Card">
          <Row>
            <IconTile name="Wallet" size={42} />
            <View style={{ flex: 1 }}>
              <T size={11} color={c.sub}>
                Total Collected (This Month)
              </T>
              <T size={25} weight="bold">
                {money(24000)}
              </T>
            </View>
            <Badge label="↑ 12%" tone="green" />
          </Row>
          <Row style={{ height: 75, alignItems: "flex-end" }}>
            {[35, 52, 40, 63, 48, 58, 44, 66, 54, 61].map((height, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height,
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  backgroundColor: i % 2 ? "#19b8a3" : "#8be5d5",
                }}
              />
            ))}
          </Row>
        </Section>
      </Card>
      <Card>
        <Section title="08. Bottom Navigation">
          <Row style={{ justifyContent: "space-around" }}>
            {[
              { label: "Collect", icon: "House" },
              { label: "Spend", icon: "Wallet" },
              { label: "Shops", icon: "Store" },
              { label: "Reports", icon: "ChartNoAxesColumnIncreasing" },
              { label: "Settings", icon: "Settings" },
            ].map((item) => (
              <View key={item.label} style={{ alignItems: "center", gap: 5 }}>
                <Icon name={item.icon as IconName} />
                <T size={9} color={c.sub}>
                  {item.label}
                </T>
              </View>
            ))}
          </Row>
        </Section>
      </Card>
      <Card>
        <Section title="04. Status Chips">
          <Row wrap>
            <Badge label="Paid" icon="CircleCheck" />
            <Badge label="Partial" tone="orange" icon="Clock3" />
            <Badge label="Overdue" tone="red" icon="CircleAlert" />
            <Badge label="Advance" tone="blue" icon="ArrowUp" />
            <Badge label="Vacant" tone="muted" icon="Store" />
          </Row>
        </Section>
      </Card>
      <Card>
        <Section title="05. Icons">
          <Row wrap>
            {[
              "House",
              "Store",
              "UsersRound",
              "CreditCard",
              "FileText",
              "ChartNoAxesColumnIncreasing",
              "CloudUpload",
              "Settings",
              "Search",
              "ListFilter",
              "CalendarDays",
              "Pencil",
              "Trash2",
              "Ellipsis",
              "Plus",
            ].map((name) => (
              <IconTile key={name} name={name as IconName} size={44} />
            ))}
          </Row>
        </Section>
      </Card>
    </Page>
  );
}

import { View } from "react-native";
import { Logo } from "../../components/branding/Logo";
import { Button } from "../../components/buttons/Button";
import { Badge } from "../../components/feedback/Badge";
import { Field } from "../../components/forms/Field";
import { Icon, type IconName } from "../../components/icons/Icon";
import { IconTile } from "../../components/icons/IconTile";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { Row } from "../../components/layout/Row";
import { Section } from "../../components/layout/Section";
import { useUI } from "../../components/theme/UIContext";
import { T } from "../../components/typography/T";
import { useGo } from "../../hooks/useGo";
import { money } from "../../utils/format";

export function DesignSystemScreen() {
  const { c, rtl } = useUI();
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
        <View
          style={{
            flexDirection: rtl ? "row-reverse" : "row",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
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
        <View
          style={{
            flexDirection: rtl ? "row-reverse" : "row",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
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

import { Image, Pressable, View } from "react-native";
import { Logo } from "../../components/branding/Logo";
import { Button } from "../../components/buttons/Button";
import { Icon, type IconName } from "../../components/icons/Icon";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { Row } from "../../components/layout/Row";
import { useUI } from "../../components/theme/UIContext";
import { T } from "../../components/typography/T";
import { useGo } from "../../hooks/useGo";
import { type ScreenId } from "../../navigation/types";

export function EmptyStatesScreen() {
  const artwork = [
    require("../../../assets/reference/empty-shops.png"),
    require("../../../assets/reference/empty-keepers.png"),
    require("../../../assets/reference/empty-payments.png"),
    require("../../../assets/reference/empty-expenses.png"),
    require("../../../assets/reference/empty-overdue.png"),
    require("../../../assets/reference/empty-reports.png"),
  ];
  const { c, rtl } = useUI();
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
      <View
        style={{
          flexDirection: rtl ? "row-reverse" : "row",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
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
            source={require("../../../assets/reference/empty-backup.png")}
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

import { useText } from "../../hooks/useText";
import { View } from "react-native";
import { Logo } from "../../components/branding/Logo";
import { Button } from "../../components/buttons/Button";
import { Field } from "../../components/forms/Field";
import { Icon, type IconName } from "../../components/icons/Icon";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { Row } from "../../components/layout/Row";
import { useUI } from "../../components/theme/UIContext";
import { T } from "../../components/typography/T";
import { useGo } from "../../hooks/useGo";
import { type ScreenId } from "../../navigation/types";

export function ErrorStatesScreen() {
  const t = useText();
  const { c, notify, rtl } = useUI();
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
      <View
        style={{
          flexDirection: rtl ? "row-reverse" : "row",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {states.map((state, i) => (
          <Card
            key={state.title}
            tone={state.tone}
            style={{ width: "48%", flexGrow: 1, padding: 9, gap: 7 }}
          >
            <Row style={{ alignItems: "flex-start" }}>
              <Icon name={state.icon} size={20} color={c[state.tone]} />
              <T size={11} weight="bold" style={{ flex: 1 }}>
                {t("{{number}}. {{title}}", {
                  number: String(i + 3).padStart(2, "0"),
                  title: state.title,
                })}
              </T>
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

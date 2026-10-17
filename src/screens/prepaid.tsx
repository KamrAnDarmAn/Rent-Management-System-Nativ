import React, { useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Shop } from "../types";
import { prepaidSummary, rentPosition } from "../rent";
import { useToday } from "../useToday";
import { usePreviewLedger } from "../store";
import {
  Badge,
  Button,
  Card,
  Divider,
  Field,
  Metric,
  Page,
  Progress,
  Row,
  T,
  money,
  useUI,
} from "../ui";

export function CollectPrepaidRentScreen({ shop }: { shop: Shop }) {
  const today = useToday();
  const { c, notify } = useUI();
  const navigation = useNavigation();
  const collect = usePreviewLedger((s) => s.collectPrepaid);
  const position = rentPosition(shop, today);
  const [amount, setAmount] = useState(String(position.due));
  const [error, setError] = useState(false);
  const save = () => {
    const value = Number(amount.replace(/,/g, ""));
    if (!Number.isSafeInteger(value) || value <= 0 || value > position.due) {
      setError(true);
      return;
    }
    collect(shop.id, value);
    notify("Payment added to the preview ledger.");
    if (navigation.canGoBack()) navigation.goBack();
  };
  return (
    <Page
      title="Collect Rent"
      footer={
        <Button
          title="Save Payment"
          onPress={save}
          disabled={position.due === 0}
        />
      }
    >
      <Card style={{ gap: 8 }}>
        <T size={18} weight="bold">{`Shop #${shop.number}`}</T>
        <T color={c.sub}>{shop.keeper}</T>
        <Badge label="Prepaid" tone="blue" />
        <T size={11}>Current rental period</T>
        <T>{position.prepaid?.currentDueDate ?? "Not started"}</T>
        <Row>
          <Metric
            label="Previously Settled"
            value={money(position.paid)}
            tone="muted"
          />
          <Metric
            label="Remaining Balance"
            value={money(position.due)}
            tone="teal"
          />
        </Row>
        {position.due === 0 && (
          <T color={c.primary}>
            No cash payment is due for this rental period.
          </T>
        )}
      </Card>
      {shop.prepaidRent && (
        <PrepaidSummary plan={shop.prepaidRent} today={today} />
      )}
      {position.due > 0 && (
        <Card style={{ gap: 10 }}>
          <Field
            label="Payment Amount"
            value={amount}
            onChangeText={(value) => {
              setAmount(value);
              setError(false);
            }}
            numeric
            suffix="AFN"
            error={
              error
                ? "Enter a positive amount no greater than the remaining rent."
                : undefined
            }
          />
          <T size={11} color={c.sub}>
            This payment settles the current rental period only.
          </T>
        </Card>
      )}
    </Page>
  );
}

export function PrepaidSummary({
  plan,
  today,
}: {
  plan: NonNullable<Shop["prepaidRent"]>;
  today: string;
}) {
  const { c } = useUI();
  const summary = prepaidSummary(plan, today);
  if (!summary) return null;
  return (
    <Card tone="teal" style={{ gap: 12 }}>
      <Row style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <T size={16} weight="bold">
          Prepaid Rent
        </T>
        <Badge
          label={summary.remaining ? "Advance available" : "Advance used up"}
          tone={summary.remaining ? "blue" : "orange"}
          small
        />
      </Row>
      <Row gap={6}>
        <Metric
          label="Advance Received"
          value={money(plan.amount)}
          tone="muted"
        />
        <Metric
          label="Applied to Rent"
          value={money(summary.applied)}
          tone="teal"
        />
      </Row>
      <Metric
        label="Advance Remaining"
        value={money(summary.remaining)}
        tone="teal"
      />
      <Progress value={(summary.applied / plan.amount) * 100} />
      <Divider />
      {[
        ["Calculated as of", today],
        ["Advance Start Date", plan.startDate],
        ["Monthly deduction", money(plan.monthlyRent)],
        ["Full months covered", String(summary.fullMonths)],
        ...(summary.partialAmount
          ? [["Extra partial-month coverage", money(summary.partialAmount)]]
          : []),
        ["Rent payments covered so far", String(summary.coveredPayments)],
        ["Full months remaining", String(summary.remainingFullMonths)],
        ...(summary.remainingPartialAmount
          ? [
              [
                "Partial amount remaining",
                money(summary.remainingPartialAmount),
              ],
            ]
          : []),
        ["Last advance application", summary.lastCoveredDate],
        ["Cash payments start", summary.firstCashDueDate],
        ...(summary.nextApplication
          ? [["Next automatic application", summary.nextApplication]]
          : []),
      ].map(([label, value]) => (
        <Row
          key={label}
          style={{ justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <T size={11} color={c.sub} style={{ flex: 1 }}>
            {label}
          </T>
          <T size={11} weight="semibold" style={{ flex: 1, textAlign: "auto" }}>
            {value}
          </T>
        </Row>
      ))}
      <View style={{ gap: 5 }}>
        <T size={10} color={c.sub}>
          Rent is applied on the start date and each monthly anniversary. A
          short month uses its last day.
        </T>
        <T size={10} color={c.sub}>
          The final payment may be partly covered. Construction credit is kept
          separately.
        </T>
      </View>
    </Card>
  );
}

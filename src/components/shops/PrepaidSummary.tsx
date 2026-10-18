import { prepaidAccountSummary } from "../../domain/prepaidAccount";
import { View } from "react-native";
import { prepaidSummary, monthlyRentAt } from "../../domain/rent";
import { type RentCalendar, type Shop } from "../../types/shop";
import { formatRentDate } from "../../utils/calendar";
import { RentCalendarBadge } from "./RentCalendarBadge";
import { money } from "../../utils/format";
import { Metric } from "../data-display/Metric";
import { Badge } from "../feedback/Badge";
import { Progress } from "../feedback/Progress";
import { Card } from "../layout/Card";
import { Divider } from "../layout/Divider";
import { Row } from "../layout/Row";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export function PrepaidSummary({
  plan,
  shop,
  today,
  calendar = plan.calendar ?? "gregorian",
}: {
  plan: NonNullable<Shop["prepaidRent"]>;
  shop?: Shop;
  today: string;
  calendar?: RentCalendar;
}) {
  const { c, language } = useUI();
  const summary = shop
    ? prepaidAccountSummary(shop, today)
    : prepaidSummary({ ...plan, calendar }, today);
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
      <RentCalendarBadge calendar={calendar} />
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
        [
          "Monthly deduction",
          money(shop ? monthlyRentAt(shop, today) : plan.monthlyRent),
        ],
        ...(summary.firstCharge !== plan.monthlyRent
          ? [["First partial-month rent", money(summary.firstCharge)]]
          : []),
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
            {formatRentDate(value, calendar, language)}
          </T>
        </Row>
      ))}
      <View style={{ gap: 5 }}>
        <T size={10} color={c.sub}>
          {calendar === "shamsi"
            ? "The first partial month is prorated. After that, rent is applied on the 1st of each Shamsi month."
            : "Rent is applied on the start date and each monthly anniversary. A short month uses its last day."}
        </T>
        <T size={10} color={c.sub}>
          The final payment may be partly covered. Construction credit is kept
          separately.
        </T>
      </View>
    </Card>
  );
}

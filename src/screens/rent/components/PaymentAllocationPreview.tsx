import type { RentAllocation, RentCalendar } from "../../../types/shop";
import { formatRentDate } from "../../../utils/calendar";
import { money } from "../../../utils/format";
import { SummaryLine } from "../../../components/data-display/SummaryLine";
import { Card } from "../../../components/layout/Card";
import { Section } from "../../../components/layout/Section";
import { useUI } from "../../../components/theme/UIContext";
import { T } from "../../../components/typography/T";

export function PaymentAllocationPreview({
  allocations,
  advance,
  remaining,
  calendar,
}: {
  allocations: RentAllocation[];
  advance: number;
  remaining: number;
  calendar: RentCalendar;
}) {
  const { c, language } = useUI();
  return (
    <Card tone="teal">
      <Section title="Payment Allocation">
        <T size={11} color={c.sub}>
          Oldest unpaid rent is settled first, then the current month. Extra
          money stays as a rent advance.
        </T>
        {allocations.map((allocation, index) => (
          <SummaryLine
            key={`${allocation.period}-${index}`}
            label={formatRentDate(allocation.period, calendar, language)}
            value={money(allocation.amount)}
          />
        ))}
        <SummaryLine
          label="Rent Advance After Payment"
          value={money(advance)}
        />
        <SummaryLine label="Remaining After Payment" value={money(remaining)} />
      </Section>
    </Card>
  );
}

import { Button } from "../../../components/buttons/Button";
import { Field } from "../../../components/forms/Field";
import { CalendarChoice } from "../../../components/forms/CalendarChoice";
import { CalendarDateField } from "../../../components/forms/CalendarDateField";
import { FormSection } from "../../../components/forms/FormSection";
import { Row } from "../../../components/layout/Row";
import { PrepaidSummary } from "../../../components/shops/PrepaidSummary";
import { useUI } from "../../../components/theme/UIContext";
import { T } from "../../../components/typography/T";
import { firstRentCharge, validDate } from "../../../domain/rent";
import { SummaryLine } from "../../../components/data-display/SummaryLine";
import { supportedCalendarDate } from "../../../utils/calendar";
import { validAmount } from "../../../utils/validation";
import type { useShopForm } from "../hooks/useShopForm";

export function ShopRentalFields({
  form,
}: {
  form: ReturnType<typeof useShopForm>;
}) {
  const {
    fields,
    field,
    occupied,
    setOccupied,
    rentalType,
    setRentalType,
    today,
    calendar,
    setCalendar,
  } = form;
  const { c } = useUI();
  return (
    <FormSection
      title="Rental Information"
      subtitle="Set rental amount and occupancy status"
      icon="Wallet"
      tone="green"
    >
      <CalendarChoice value={calendar} onChange={setCalendar} />
      <T size={10} color={c.sub}>
        {calendar === "shamsi"
          ? "Shamsi rent is due on the 1st. A mid-month start is charged only for the remaining days, rounded to whole afghanis."
          : "Gregorian rent is due on the tenancy start day each month. Short months use their last day."}
      </T>
      {form.editing && (
        <T size={10} color={c.sub}>
          Changing the calendar recalculates due dates and advance coverage.
          Recorded payment amounts are kept.
        </T>
      )}
      <Row style={{ alignItems: "flex-start" }}>
        <Field
          style={{ flex: 1 }}
          label="Monthly Rent (AFN)"
          {...field("rent")}
          placeholder="e.g. 12,000"
          numeric
          required
          icon="Banknote"
          helper="Amount charged per month"
        />
        <CalendarDateField
          style={{ flex: 1 }}
          label="Start Date"
          {...field("date")}
          calendar={calendar}
          required
          icon="CalendarDays"
        />
      </Row>
      <CalendarDateField
        label="Track Unpaid Rent From"
        {...field("ledgerDate")}
        calendar={calendar}
        required
        helper="Only months from this date are counted as unpaid. Earlier rent is not assumed unpaid."
      />
      {calendar === "shamsi" &&
        validAmount(fields.rent) &&
        supportedCalendarDate(fields.date, calendar) && (
          <SummaryLine
            label="First partial-month rent"
            value={`AFN ${firstRentCharge(validAmount(fields.rent)!, fields.date, calendar).toLocaleString("en-US")}`}
          />
        )}
      <T size={11} weight="medium">
        Occupancy Status *
      </T>
      <Row>
        {["Occupied", "Vacant"].map((option) => (
          <Button
            key={option}
            title={option}
            icon={option === "Occupied" ? "CircleCheck" : "House"}
            compact
            variant={occupied === option ? "secondary" : "outline"}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: occupied === option ? c.primary : c.border,
            }}
            onPress={() => setOccupied(option)}
          />
        ))}
      </Row>
      {occupied === "Occupied" && (
        <>
          <T size={11} weight="medium">
            Rental Payment Type
          </T>
          <Row>
            {(["monthly", "prepaid"] as const).map((type) => (
              <Button
                key={type}
                title={type === "monthly" ? "Monthly" : "Prepaid"}
                icon={type === "monthly" ? "CalendarDays" : "Wallet"}
                compact
                style={{ flex: 1 }}
                variant={rentalType === type ? "secondary" : "outline"}
                onPress={() => setRentalType(type)}
              />
            ))}
          </Row>
          <T size={10} color={c.sub}>
            {rentalType === "monthly"
              ? "The shopkeeper pays rent every month."
              : "An advance payment covers rent automatically each month."}
          </T>
          {rentalType === "prepaid" && (
            <>
              <Field
                label="Advance Rent Received (AFN)"
                {...field("advance")}
                numeric
                required
                placeholder="e.g. 4,000"
                icon="Wallet"
                helper="Total advance for this agreement, not the remaining balance."
              />
              <CalendarDateField
                label="Advance Start Date"
                {...field("advanceDate")}
                calendar={calendar}
                required
                icon="CalendarDays"
              />
              <T size={10} color={c.sub}>
                Enter the existing advance for this tenancy. Record new payments
                through Collect Rent.
              </T>
              <T size={10} color={c.sub}>
                Changing the amount, start date or rent recalculates this
                agreement.
              </T>
              {validAmount(fields.advance) &&
              validAmount(fields.rent) &&
              validDate(fields.advanceDate.trim()) ? (
                <PrepaidSummary
                  plan={{
                    amount: validAmount(fields.advance)!,
                    monthlyRent: validAmount(fields.rent)!,
                    startDate: fields.advanceDate.trim(),
                    calendar,
                    tenancyStartDate: fields.date,
                  }}
                  today={today}
                />
              ) : null}
            </>
          )}
        </>
      )}
    </FormSection>
  );
}

import { CalendarMonthPicker } from "../../../components/filters/CalendarMonthPicker";
import { Chips } from "../../../components/filters/Chips";
import { CalendarChoice } from "../../../components/forms/CalendarChoice";
import { Select } from "../../../components/forms/Select";
import { Card } from "../../../components/layout/Card";
import { Row } from "../../../components/layout/Row";
import { T } from "../../../components/typography/T";
import { useUI } from "../../../components/theme/UIContext";
import { useText } from "../../../hooks/useText";
import {
  calendarParts,
  normalizeDigits,
  parseCalendarDate,
} from "../../../utils/calendar";
import type { useRentReport } from "../hooks/useRentReport";

export function ReportFilters({
  model,
}: {
  model: ReturnType<typeof useRentReport>;
}) {
  const t = useText();
  const { c, language } = useUI();
  const label = (shop: (typeof model.candidates)[number]) =>
    `${t("Shop #{{number}}", { number: shop.number })} · ${t(shop.name)}`;
  const yearLabel = (year: number) =>
    language === "ps"
      ? String(year).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)])
      : String(year);
  return (
    <Card style={{ gap: 12 }}>
      <Chips
        options={["Monthly Report", "Yearly Report"]}
        selected={model.mode === "monthly" ? "Monthly Report" : "Yearly Report"}
        onSelect={(value) =>
          model.setMode(value === "Monthly Report" ? "monthly" : "yearly")
        }
      />
      <Row style={{ alignItems: "flex-start" }}>
        <CalendarChoice
          style={{ flex: 1 }}
          label="View Calendar"
          value={model.calendar}
          onChange={model.setCalendar}
        />
        <Select
          style={{ flex: 1 }}
          label="Report Scope"
          value={model.selected ? label(model.selected) : "All Shops"}
          options={["All Shops", ...model.candidates.map(label)]}
          onChange={(value) =>
            model.setShopId(
              model.candidates.find((shop) => label(shop) === value)?.id,
            )
          }
        />
      </Row>
      {model.mode === "monthly" ? (
        <CalendarMonthPicker
          value={model.date}
          calendar={model.calendar}
          onChange={model.setDate}
        />
      ) : (
        <Select
          label="Report Year"
          value={yearLabel(calendarParts(model.date, model.calendar).year)}
          options={model.years.map(yearLabel)}
          onChange={(value) =>
            model.setDate(
              parseCalendarDate(
                `${normalizeDigits(value).padStart(4, "0")}-01-01`,
                model.calendar,
              )!,
            )
          }
        />
      )}
      <T size={9} color={c.sub}>
        Only shops using the selected rent calendar are included.
      </T>
    </Card>
  );
}

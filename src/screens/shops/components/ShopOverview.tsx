import { monthlyRentAt } from "../../../domain/rentSchedule";
import { useText } from "../../../hooks/useText";
import { useState } from "react";
import { View } from "react-native";
import { Field } from "../../../components/forms/Field";
import { Card } from "../../../components/layout/Card";
import { Row } from "../../../components/layout/Row";
import { Section } from "../../../components/layout/Section";
import { useUI } from "../../../components/theme/UIContext";
import { T } from "../../../components/typography/T";
import { rentalTag } from "../../../domain/rent";
import { useGo } from "../../../hooks/useGo";
import { useLedger } from "../../../store/ledgerStore";
import type { Shop } from "../../../types/shop";
import { money } from "../../../utils/format";
import { calendarLabel, formatRentDate } from "../../../utils/calendar";

export function ShopOverview({
  shop,
  nextRentDue,
}: {
  shop: Shop;
  nextRentDue: string;
}) {
  const t = useText();
  const { c, language, notify } = useUI();
  const go = useGo();
  const [editNotes, setEditNotes] = useState(false);
  const [notes, setNotes] = useState(shop.notes);
  const updateShop = useLedger((state) => state.updateShop);
  return (
    <Row style={{ alignItems: "stretch" }} gap={7}>
      <Card style={{ flex: 1, padding: 9 }}>
        <Section
          title="Shop Information"
          action="Edit"
          onPress={() => go("edit-shop", shop.id)}
        >
          {[
            ["Shop Number", t("Shop #{{number}}", { number: shop.number })],
            ["Shop Name", shop.name],
            ["Address", shop.address || "—"],
            ["Status", rentalTag(shop)],
            ["Rent Calendar", calendarLabel(shop.rentCalendar)],
            [
              "Rental Payment Type",
              shop.rentalType === "prepaid" ? "Prepaid" : "Monthly",
            ],
            [
              "Start Date",
              formatRentDate(shop.startDate, shop.rentCalendar, language),
            ],
            ["Monthly Rent", money(monthlyRentAt(shop))],
          ].map(([k, v]) => (
            <View key={k} style={{ gap: 2 }}>
              <T size={9} color={c.sub}>
                {k}
              </T>
              <T size={10} weight="medium">
                {v}
              </T>
            </View>
          ))}
        </Section>
      </Card>
      <View style={{ flex: 1, gap: 8 }}>
        <Card style={{ padding: 9 }}>
          <Section
            title="Notes"
            action={editNotes ? "Done" : "Edit"}
            onPress={async () => {
              if (editNotes && !(await updateShop(shop.id, { notes })))
                return notify(useLedger.getState().error!);
              if (!editNotes) setNotes(shop.notes);
              setEditNotes(!editNotes);
            }}
          >
            {editNotes ? (
              <Field
                label="Notes"
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            ) : (
              <T size={10} color={c.sub}>
                {shop.notes || "—"}
              </T>
            )}
          </Section>
        </Card>
        <Card style={{ padding: 9 }}>
          <Section
            title="Important Dates"
            action="Edit"
            onPress={() => go("edit-shop", shop.id)}
          >
            {[
              [
                "Tenancy Start",
                formatRentDate(shop.startDate, shop.rentCalendar, language),
              ],
              [
                "Next Rent Due",
                formatRentDate(nextRentDue, shop.rentCalendar, language),
              ],
              [
                "Rent Due Day",
                shop.rentCalendar === "shamsi"
                  ? "1st of each Shamsi month"
                  : "Tenancy start day each month",
              ],
              [
                "Contract Type",
                shop.rentalType === "prepaid" ? "Prepaid" : "Monthly",
              ],
            ].map(([k, v]) => (
              <View key={k}>
                <T size={9} color={c.sub}>
                  {k}
                </T>
                <T size={10}>{v}</T>
              </View>
            ))}
          </Section>
        </Card>
      </View>
    </Row>
  );
}

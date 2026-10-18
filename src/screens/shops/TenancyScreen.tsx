import { useState } from "react";
import { Button } from "../../components/buttons/Button";
import { Metric } from "../../components/data-display/Metric";
import { CalendarDateField } from "../../components/forms/CalendarDateField";
import { Field } from "../../components/forms/Field";
import { ToggleRow } from "../../components/forms/ToggleRow";
import { Info } from "../../components/feedback/Info";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { ShopIdentity } from "../../components/shops/ShopIdentity";
import { useUI } from "../../components/theme/UIContext";
import { rentAccount } from "../../domain/rentAccount";
import { validDate } from "../../domain/rent";
import { useToday } from "../../hooks/useToday";
import { useShop } from "../../hooks/useShop";
import { useLedger } from "../../store/ledgerStore";
import { validAmount } from "../../utils/validation";
import { money } from "../../utils/format";
export function TenancyScreen({ shopId = 1 }: { shopId?: number }) {
  const { notify } = useUI(),
    shop = useShop(shopId),
    today = useToday();
  const [rent, setRent] = useState(String(shop.rent));
  const [effective, setEffective] = useState(today);
  const [endDate, setEndDate] = useState(shop.tenancyEndDate ?? today);
  const [vacant, setVacant] = useState(!shop.occupied);
  return (
    <Page
      title="Tenancy Lifecycle"
      subtitle="Manage tenancy changes for your shop"
      footer={
        <Button
          title="Save Changes"
          icon="CircleCheck"
          onPress={async () => {
            const n = validAmount(rent);
            if (!n) return notify("Enter a positive whole-AFN rent.");
            if (
              !validDate(effective) ||
              effective < today ||
              (vacant &&
                (!validDate(endDate) ||
                  endDate > today ||
                  endDate < shop.startDate))
            )
              return notify(
                "Choose today or a future effective date. A tenancy end date must be between its start and today.",
              );
            const changes = {
              rent: n,
              initialRent: shop.initialRent ?? shop.rent,
              rentRates:
                n === shop.rent
                  ? shop.rentRates
                  : [
                      ...(shop.rentRates ?? []).filter(
                        (r) => r.effective !== effective,
                      ),
                      { effective, amount: n },
                    ],
              occupied: !vacant,
              tenancyEndDate: vacant ? endDate : undefined,
            };
            if (!(await useLedger.getState().updateShop(shop.id, changes)))
              return notify(useLedger.getState().error!);
            notify("Tenancy updated.");
          }}
        />
      }
    >
      <ShopIdentity shop={shop} />
      <Card style={{ gap: 12 }}>
        <Field
          label="New Rent"
          value={rent}
          onChangeText={setRent}
          numeric
          suffix="AFN"
        />
        <CalendarDateField
          label="Effective Date"
          value={effective}
          onChangeText={setEffective}
          calendar={shop.rentCalendar}
        />
        <Info text="Rent changes apply from the selected date. Earlier rent stays unchanged, and a change during a month is prorated by days." />
      </Card>
      <Card style={{ gap: 12 }}>
        <ToggleRow
          title="Mark as Vacant"
          value={vacant}
          onChange={setVacant}
          icon="House"
        />
        <CalendarDateField
          label="End Date"
          value={endDate}
          onChangeText={setEndDate}
          calendar={shop.rentCalendar}
        />
        <Info
          text="The last day is included. Rent stops after the departure date, and unpaid rent and advances remain in history."
          tone="orange"
        />
      </Card>
      <Metric
        label="Outstanding Rent"
        value={money(rentAccount(shop).outstanding)}
        tone="red"
      />
      <Metric
        label="Construction Credit"
        value={money(shop.credit)}
        tone="teal"
      />
    </Page>
  );
}

import { monthlyRentAt } from "../../../domain/rentSchedule";
import { useText } from "../../../hooks/useText";
import { View } from "react-native";
import { Badge } from "../../../components/feedback/Badge";
import { Icon } from "../../../components/icons/Icon";
import { IconTile } from "../../../components/icons/IconTile";
import { Card } from "../../../components/layout/Card";
import { Row } from "../../../components/layout/Row";
import { statusIcon, statusTone } from "../../../components/shops/rentStatus";
import { useUI } from "../../../components/theme/UIContext";
import { T } from "../../../components/typography/T";
import { rentPosition } from "../../../domain/rent";
import { useGo } from "../../../hooks/useGo";
import type { Shop } from "../../../types/shop";
import { money, number } from "../../../utils/format";
import { RentCalendarBadge } from "../../../components/shops/RentCalendarBadge";

export function CollectionShopCard({
  shop,
}: {
  shop: Shop & ReturnType<typeof rentPosition>;
}) {
  const t = useText();
  const { c, language } = useUI();
  const go = useGo();
  return (
    <Card
      key={shop.id}
      onPress={() => go("shop-details", shop.id)}
      style={{ padding: 6 }}
    >
      <Row gap={11}>
        <IconTile name="Store" tone={statusTone(shop.status)} size={43} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <T weight="bold" size={13}>
            {language === "ps" ? `دوکان ${shop.number}` : `Shop ${shop.number}`}
          </T>
          <T size={11} color={c.sub} lines={1}>
            {shop.id === 1 ? shop.keeper : shop.name}
          </T>
          <T size={10} color={c.sub}>
            {shop.phone}
          </T>
          {shop.occupied && shop.rentalType === "prepaid" && (
            <Badge label="Prepaid" tone="blue" small />
          )}
          <RentCalendarBadge calendar={shop.rentCalendar} />
        </View>
        <View style={{ flex: 1.05, gap: 1 }}>
          <Badge
            label={shop.status}
            tone={statusTone(shop.status)}
            icon={statusIcon(shop.status)}
            small
          />
          <T
            size={13}
            weight="bold"
            color={shop.status === "Paid" ? c.green : c.text}
          >
            {money(monthlyRentAt(shop))}
          </T>
          <T
            size={9}
            color={
              shop.status === "Unpaid" || shop.status === "Overdue"
                ? c.red
                : c.sub
            }
          >
            {t("Paid: {{paid}} · Due: {{due}}", {
              paid: number(shop.paid),
              due: number(shop.totalDue),
            })}
          </T>
        </View>
        <Icon name="ChevronRight" size={17} color={c.sub} />
      </Row>
    </Card>
  );
}

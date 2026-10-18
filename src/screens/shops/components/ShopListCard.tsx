import { monthlyRentAt } from "../../../domain/rentSchedule";
import { useText } from "../../../hooks/useText";
import { Image, View } from "react-native";
import { Badge } from "../../../components/feedback/Badge";
import { Icon } from "../../../components/icons/Icon";
import { Card } from "../../../components/layout/Card";
import { Row } from "../../../components/layout/Row";
import { useUI } from "../../../components/theme/UIContext";
import { T } from "../../../components/typography/T";
import { shopImages } from "../../../data/shopImages";
import { rentalTag, rentPosition } from "../../../domain/rent";
import { useGo } from "../../../hooks/useGo";
import type { Shop } from "../../../types/shop";
import { money, number } from "../../../utils/format";
import { RentCalendarBadge } from "../../../components/shops/RentCalendarBadge";

export function ShopListCard({ shop, today }: { shop: Shop; today: string }) {
  const t = useText();
  const { c } = useUI();
  const go = useGo();
  return (
    <Card
      key={shop.id}
      onPress={() => go("shop-details", shop.id)}
      style={{ padding: 8 }}
    >
      <Row>
        <Image
          source={shopImages[shop.image]}
          style={{ width: 55, height: 59, borderRadius: 8 }}
        />
        <View style={{ flex: 1.1, minWidth: 0 }}>
          <T weight="bold" size={13}>
            {t("Shop #{{number}}", { number: shop.number })}
          </T>
          <T size={10} color={c.sub} lines={1}>
            {shop.name}
          </T>
          <T size={10} color={c.sub}>
            {shop.keeper}
          </T>
          <T size={9} color={c.sub}>
            {shop.phone}
          </T>
          <RentCalendarBadge calendar={shop.rentCalendar} />
        </View>
        <View style={{ width: 1, height: 47, backgroundColor: c.border }} />
        <View style={{ flex: 1.05 }}>
          <Badge
            label={rentalTag(shop)}
            tone={
              shop.occupied
                ? shop.rentalType === "prepaid"
                  ? "blue"
                  : "green"
                : "muted"
            }
            icon={shop.occupied ? "CircleCheck" : "Store"}
            small
          />
          <Row style={{ marginTop: 6 }}>
            <View style={{ flex: 1 }}>
              <T size={8} color={c.sub}>
                Monthly Rent
              </T>
              <T size={10} weight="bold">
                {money(monthlyRentAt(shop))}
              </T>
            </View>
            <View>
              <T size={8} color={c.sub}>
                Balance
              </T>
              <T size={10} weight="bold" color={c.primary}>
                {number(rentPosition(shop, today).totalDue)}
              </T>
            </View>
          </Row>
        </View>
        <Icon name="ChevronRight" size={15} color={c.sub} />
      </Row>
    </Card>
  );
}

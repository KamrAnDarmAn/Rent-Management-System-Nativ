import { monthlyRentAt } from "../../../domain/rentSchedule";
import { useText } from "../../../hooks/useText";
import { Image, Pressable, View } from "react-native";
import { Badge } from "../../../components/feedback/Badge";
import { Icon } from "../../../components/icons/Icon";
import { IconTile } from "../../../components/icons/IconTile";
import { Card } from "../../../components/layout/Card";
import { Divider } from "../../../components/layout/Divider";
import { Row } from "../../../components/layout/Row";
import { useUI } from "../../../components/theme/UIContext";
import { T } from "../../../components/typography/T";
import { shopImages } from "../../../data/shopImages";
import { rentalTag } from "../../../domain/rent";
import { useGo } from "../../../hooks/useGo";
import type { Shop } from "../../../types/shop";
import { money } from "../../../utils/format";
import { formatRentDate } from "../../../utils/calendar";
import { RentCalendarBadge } from "../../../components/shops/RentCalendarBadge";

export function ShopDetailsHeader({ shop }: { shop: Shop }) {
  const t = useText();
  const { c, language } = useUI();
  const go = useGo();
  return (
    <Card>
      <Row>
        <Image
          source={shopImages[shop.image]}
          style={{ width: 88, height: 70, borderRadius: 9 }}
        />
        <View style={{ flex: 1, gap: 5 }}>
          <Row style={{ justifyContent: "space-between" }}>
            <T size={20} weight="bold">
              {t("Shop #{{number}}", { number: shop.number })}
            </T>
            <Badge
              label={rentalTag(shop)}
              tone={
                shop.occupied
                  ? shop.rentalType === "prepaid"
                    ? "blue"
                    : "green"
                  : "muted"
              }
              small
            />
          </Row>
          <RentCalendarBadge calendar={shop.rentCalendar} />
          <T size={13} color={c.sub}>
            {shop.name || "—"}
          </T>
          <Row gap={4}>
            <Icon name="MapPin" size={13} color={c.sub} />
            <T size={10} color={c.sub}>
              {shop.address || "—"}
            </T>
          </Row>
        </View>
      </Row>
      <Divider />
      <Row>
        <IconTile name="UserRound" size={33} />
        <Pressable
          style={{ flex: 1 }}
          onPress={() => go("shopkeeper", shop.id)}
        >
          <T size={10} color={c.sub}>
            Current Shopkeeper
          </T>
          <T size={13} weight="semibold">
            {shop.keeper}
          </T>
          <T size={9} color={c.sub}>
            {shop.phone}
          </T>
        </Pressable>
        <IconTile name="CreditCard" size={33} />
        <View style={{ flex: 1 }}>
          <T size={10} color={c.sub}>
            Monthly Rent
          </T>
          <T size={15} weight="bold">
            {money(monthlyRentAt(shop))}
          </T>
          <T size={9} color={c.sub}>
            {t("Since {{date}}", {
              date: formatRentDate(shop.startDate, shop.rentCalendar, language),
            })}
          </T>
        </View>
      </Row>
    </Card>
  );
}

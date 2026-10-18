import { useText } from "../../hooks/useText";
import { Image, View } from "react-native";
import { shopImages } from "../../data/shopImages";
import { useGo } from "../../hooks/useGo";
import { type Shop } from "../../types/shop";
import { Badge } from "../feedback/Badge";
import { Icon } from "../icons/Icon";
import { Card } from "../layout/Card";
import { Row } from "../layout/Row";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";
import { RentCalendarBadge } from "./RentCalendarBadge";

export function ShopIdentity({
  shop,
  onPress,
}: {
  shop: Shop;
  onPress?: () => void;
}) {
  const t = useText();
  const { c } = useUI();
  const go = useGo();
  return (
    <Card onPress={onPress ?? (() => go("shopkeeper", shop.id))}>
      <Row>
        <Image
          source={shopImages[shop.image % shopImages.length]}
          style={{ width: 52, height: 49, borderRadius: 7 }}
        />
        <View style={{ flex: 1 }}>
          <T weight="bold" size={14}>
            {t("Shop #{{number}}", { number: shop.number })}
          </T>
          <T size={11} color={c.sub}>
            {shop.keeper}
          </T>
          <T size={10} color={c.sub}>
            {shop.phone}
          </T>
          <RentCalendarBadge calendar={shop.rentCalendar} />
        </View>
        <Badge label="Active" tone="green" small />
        <Icon name="ChevronRight" size={17} color={c.sub} />
      </Row>
    </Card>
  );
}

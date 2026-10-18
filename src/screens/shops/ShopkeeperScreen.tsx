import { useText } from "../../hooks/useText";
import { View } from "react-native";
import { Button } from "../../components/buttons/Button";
import { IconButton } from "../../components/buttons/IconButton";
import { Metric } from "../../components/data-display/Metric";
import { SummaryLine } from "../../components/data-display/SummaryLine";
import { TransactionRow } from "../../components/data-display/TransactionRow";
import { Badge } from "../../components/feedback/Badge";
import { Chips } from "../../components/filters/Chips";
import { Icon } from "../../components/icons/Icon";
import { Card } from "../../components/layout/Card";
import { Divider } from "../../components/layout/Divider";
import { Page } from "../../components/layout/Page";
import { Row } from "../../components/layout/Row";
import { Section } from "../../components/layout/Section";
import { ShopIdentity } from "../../components/shops/ShopIdentity";
import { useUI } from "../../components/theme/UIContext";
import { T } from "../../components/typography/T";
import { useGo } from "../../hooks/useGo";
import { useShop } from "../../hooks/useShop";
import { money } from "../../utils/format";
import { RentTransactionList } from "../../components/shops/RentTransactionList";
import { rentPosition } from "../../domain/rent";
import { useToday } from "../../hooks/useToday";

export function ShopkeeperScreen({ shopId = 1 }: { shopId?: number }) {
  const t = useText();
  const { c, notify } = useUI();
  const go = useGo();
  const shop = useShop(shopId);
  const today = useToday();
  return (
    <Page title="Shopkeeper">
      <ShopIdentity shop={shop} onPress={() => go("shop-details", shop.id)} />
      <Row>
        <Button
          title="Edit"
          icon="Pencil"
          onPress={() => go("edit-shop", shop.id)}
          style={{ flex: 1 }}
        />
        <Button
          title="View History"
          icon="Clock3"
          variant="outline"
          onPress={() => go("rent-history", shop.id)}
          style={{ flex: 1 }}
        />
      </Row>
      <Metric
        label="Outstanding Rent"
        value={money(rentPosition(shop, today).totalDue)}
        tone="red"
      />
      <Metric
        label="Construction Credit"
        value={money(shop.credit)}
        tone="teal"
      />
      <Card>
        <Section title="Transaction History">
          <RentTransactionList shop={shop} />
        </Section>
      </Card>
    </Page>
  );
}

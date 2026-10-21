import { Card } from "../../../components/layout/Card";
import { Section } from "../../../components/layout/Section";
import { useGo } from "../../../hooks/useGo";
import { useShop } from "../../../hooks/useShop";
import { RentTransactionList } from "../../../components/shops/RentTransactionList";
export function ShopRecentActivity({ shopId }: { shopId: number }) {
  const go = useGo(),
    shop = useShop(shopId);
  return (
    <Card style={{ padding: 16 }}>
      <Section
        size="large"
        title="Recent Activity"
        action="View All"
        onPress={() => go("shop-financial-report", shopId)}
      >
        <RentTransactionList shop={shop} />
      </Section>
    </Card>
  );
}

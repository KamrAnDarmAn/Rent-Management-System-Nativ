import { Pressable } from "react-native";
import { Icon, type IconName } from "../../../components/icons/Icon";
import { Card } from "../../../components/layout/Card";
import { Row } from "../../../components/layout/Row";
import { useUI } from "../../../components/theme/UIContext";
import { T } from "../../../components/typography/T";
import { useGo } from "../../../hooks/useGo";

export function ShopDetailTabs({ shopId }: { shopId: number }) {
  const { c } = useUI();
  const go = useGo();
  return (
    <Card style={{ padding: 5 }}>
      <Row gap={0}>
        {[
          { label: "Overview", icon: "House", id: undefined },
          { label: "Tenancy", icon: "UserRound", id: "tenancy-lifecycle" },
          { label: "Rent History", icon: "FileText", id: "rent-history" },
          { label: "Credits", icon: "Store", id: "construction-credit" },
          { label: "Goods", icon: "Package", id: "goods-settlement" },
          { label: "Activity", icon: "Clock3", id: "shop-financial-report" },
        ].map((tab, i) => (
          <Pressable
            key={tab.label}
            onPress={() => tab.id && go(tab.id as "rent-history", shopId)}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 9,
              borderRadius: 8,
              backgroundColor: i === 0 ? c.teal : "transparent",
              gap: 5,
            }}
          >
            <Icon
              name={tab.icon as IconName}
              size={19}
              color={i === 0 ? c.primary : c.sub}
            />
            <T size={8} color={i === 0 ? c.primary : c.sub}>
              {tab.label}
            </T>
          </Pressable>
        ))}
      </Row>
    </Card>
  );
}

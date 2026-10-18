import { Button } from "../../components/buttons/Button";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { T } from "../../components/typography/T";
import { useGo } from "../../hooks/useGo";
import { ShopDetailsFields } from "./components/ShopDetailsFields";
import { ShopFinancialFields } from "./components/ShopFinancialFields";
import { ShopNotesFields } from "./components/ShopNotesFields";
import { ShopRentalFields } from "./components/ShopRentalFields";
import { useShopForm } from "./hooks/useShopForm";

export function ShopFormScreen({ shopId }: { shopId?: number }) {
  const form = useShopForm(shopId);
  const { editing, shop, save } = form;
  const go = useGo();
  if (editing && !shop)
    return (
      <Page title="Edit Shop">
        <Card style={{ gap: 12 }}>
          <T size={18} weight="bold">
            Shop not found
          </T>
          <T>This shop is no longer available.</T>
          <Button title="Back to Shops" onPress={() => go("shops")} />
        </Card>
      </Page>
    );
  return (
    <Page
      title={editing ? "Edit Shop" : "Add Shop"}
      subtitle={
        editing
          ? "Update shop and shopkeeper details"
          : "Enter shop and shopkeeper details"
      }
      help
      footer={
        <Button
          title={editing ? "Update Shop" : "Save Shop"}
          icon="CircleCheck"
          onPress={save}
        />
      }
    >
      <ShopDetailsFields form={form} />
      <ShopRentalFields form={form} />
      <ShopFinancialFields form={form} />
      <ShopNotesFields form={form} />
    </Page>
  );
}

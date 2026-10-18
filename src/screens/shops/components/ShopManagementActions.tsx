import { useNavigation } from "@react-navigation/native";
import { useLedger } from "../../../store/ledgerStore";
import { Button } from "../../../components/buttons/Button";
import { Row } from "../../../components/layout/Row";
import { useUI } from "../../../components/theme/UIContext";
import { useGo } from "../../../hooks/useGo";
export function ShopManagementActions({
  shopId,
  onDelete,
}: {
  shopId: number;
  onDelete: () => void;
}) {
  const go = useGo();
  const { notify } = useUI();
  const navigation = useNavigation();
  return (
    <>
      <Button
        title="Delete Shop"
        icon="Trash2"
        variant="danger"
        onPress={onDelete}
      />
      <Row gap={5}>
        <Button
          title="Edit Shop"
          icon="Pencil"
          variant="secondary"
          onPress={() => go("edit-shop", shopId)}
          style={{ flex: 1 }}
          compact
        />
        <Button
          title="Change Rent"
          icon="TrendingUp"
          variant="secondary"
          onPress={() => go("tenancy-lifecycle", shopId)}
          style={{ flex: 1 }}
          compact
        />
        <Button
          title="End Tenancy"
          icon="Pause"
          variant="outline"
          onPress={() => go("tenancy-lifecycle", shopId)}
          style={{ flex: 1 }}
          compact
        />
        <Button
          title="Archive"
          icon="Archive"
          variant="outline"
          onPress={async () => {
            if (!(await useLedger.getState().archiveShop(shopId)))
              return notify(useLedger.getState().error!);
            navigation.reset({
              index: 0,
              routes: [
                { name: "Tabs" as never, params: { screen: "shops" } as never },
              ],
            });
            notify("Shop archived. Its history is preserved.");
          }}
          style={{ flex: 1 }}
          compact
        />
      </Row>
    </>
  );
}

import { useText } from "../../../hooks/useText";
import { Modal, View } from "react-native";
import { Button } from "../../../components/buttons/Button";
import { IconTile } from "../../../components/icons/IconTile";
import { Row } from "../../../components/layout/Row";
import { useUI } from "../../../components/theme/UIContext";
import { T } from "../../../components/typography/T";
import type { Shop } from "../../../types/shop";

export function DeleteShopDialog({
  shop,
  visible,
  onCancel,
  onConfirm,
}: {
  shop: Shop;
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const t = useText();
  const { c } = useUI();
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#0a1b3570",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          role="dialog"
          accessibilityViewIsModal
          accessibilityLabel={t("Delete this shop?")}
          style={{
            width: "100%",
            maxWidth: 400,
            padding: 20,
            borderRadius: 18,
            backgroundColor: c.surface,
            gap: 14,
          }}
        >
          <Row>
            <IconTile name="Trash2" tone="red" size={42} />
            <T size={20} weight="bold">
              Delete this shop?
            </T>
          </Row>
          <T size={14} weight="semibold">
            {t("Shop #{{number}} · {{name}}", {
              number: shop.number,
              name: shop.name,
            })}
          </T>
          <T color={c.sub}>
            This removes the shop from the active list. Its financial history is
            kept in Archived Shops. Other shops will be kept.
          </T>
          <Row>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onCancel}
              style={{ flex: 1 }}
            />
            <Button
              title="Delete Shop"
              icon="Trash2"
              variant="danger"
              onPress={onConfirm}
              style={{ flex: 1 }}
            />
          </Row>
        </View>
      </View>
    </Modal>
  );
}

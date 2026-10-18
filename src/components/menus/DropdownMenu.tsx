import { useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { MenuAnchor } from "../../hooks/useAnchoredMenu";
import { useText } from "../../hooks/useText";
import { Icon } from "../icons/Icon";
import { Row } from "../layout/Row";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";
import { placeMenu } from "./placement";

export function DropdownMenu({
  anchor,
  label,
  value,
  options,
  onChange,
  onClose,
}: {
  anchor: MenuAnchor | null;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onClose: () => void;
}) {
  const { c, rtl } = useUI();
  const t = useText();
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [contentHeight, setContentHeight] = useState(options.length * 48 + 8);
  if (!anchor) return null;
  const position = placeMenu(
    anchor,
    {
      width: window.width,
      top: insets.top + 8,
      bottom: Math.min(
        window.height - insets.bottom - 8,
        Keyboard.metrics?.()?.screenY ?? window.height,
      ),
    },
    contentHeight,
    rtl,
  );
  return (
    <Modal
      transparent
      visible
      animationType="none"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("Close menu")}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View
          accessibilityRole="menu"
          accessibilityLabel={t(label)}
          testID="dropdown-menu"
          style={{
            position: "absolute",
            ...position,
            backgroundColor: c.surface,
            borderRadius: 9,
            borderWidth: 1,
            borderColor: c.border,
            shadowColor: "#000",
            shadowOpacity: 0.16,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 12,
            overflow: "hidden",
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="always"
            bounces={false}
            style={{ maxHeight: position.maxHeight }}
            contentContainerStyle={{ padding: 3 }}
            onContentSizeChange={(_, height) => setContentHeight(height + 2)}
          >
            {options.map((option) => (
              <Pressable
                key={option}
                accessibilityRole="menuitem"
                accessibilityLabel={t(option)}
                accessibilityState={{ selected: option === value }}
                onPress={() => {
                  onClose();
                  onChange(option);
                }}
                style={{
                  minHeight: 48,
                  padding: 10,
                  justifyContent: "center",
                  borderRadius: 6,
                  backgroundColor: option === value ? c.teal : "transparent",
                }}
              >
                <Row>
                  <T size={12} style={{ flex: 1 }}>
                    {option}
                  </T>
                  {option === value && (
                    <Icon name="Check" size={15} color={c.primary} />
                  )}
                </Row>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

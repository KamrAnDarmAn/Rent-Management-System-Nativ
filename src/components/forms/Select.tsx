import { useText } from "../../hooks/useText";
import { useAnchoredMenu } from "../../hooks/useAnchoredMenu";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";
import { Icon } from "../icons/Icon";
import { DropdownMenu } from "../menus/DropdownMenu";
import { Row } from "../layout/Row";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export function Select({
  label,
  value,
  options,
  onChange,
  style,
}: {
  label?: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useText();
  const { c } = useUI();
  const menu = useAnchoredMenu();
  const open = !!menu.anchor;
  return (
    <View style={[{ gap: 5, minWidth: 0 }, style]}>
      {label && (
        <T size={11} weight="medium">
          {label}
        </T>
      )}
      <Pressable
        ref={menu.triggerRef}
        accessibilityRole="button"
        accessibilityLabel={t(label ?? value)}
        accessibilityState={{ expanded: open }}
        onPress={menu.open}
        style={{
          minHeight: 39,
          borderRadius: 7,
          borderWidth: 1,
          borderColor: open ? c.primary : c.border,
          paddingHorizontal: 10,
          justifyContent: "center",
          backgroundColor: c.surface,
        }}
      >
        <Row style={{ justifyContent: "space-between" }}>
          <T size={12} style={{ flex: 1 }}>
            {value}
          </T>
          <Icon
            name={open ? "ChevronUp" : "ChevronDown"}
            size={15}
            color={c.sub}
          />
        </Row>
      </Pressable>
      <DropdownMenu
        anchor={menu.anchor}
        label={label ?? value}
        value={value}
        options={options}
        onChange={onChange}
        onClose={menu.close}
      />
    </View>
  );
}

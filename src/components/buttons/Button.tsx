import { useText } from "../../hooks/useText";
import { useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";
import { type IconName, Icon } from "../icons/Icon";
import { Row } from "../layout/Row";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export function Button({
  title,
  onPress,
  icon,
  variant = "primary",
  style,
  compact = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void | Promise<unknown>;
  icon?: IconName;
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
  disabled?: boolean;
}) {
  const t = useText();
  const { c, notify } = useUI();
  const running = useRef(false);
  const [busy, setBusy] = useState(false);
  const press = async () => {
    if (running.current) return;
    running.current = true;
    try {
      const result = onPress();
      if (result && typeof result.then === "function") {
        setBusy(true);
        await result;
      }
    } catch {
      notify("Could not complete this action. Please try again.");
    } finally {
      running.current = false;
      setBusy(false);
    }
  };
  const fg = variant === "primary" || variant === "danger" ? "#fff" : c.primary;
  const contents = (
    <Row gap={7} style={{ justifyContent: "center" }}>
      {icon && <Icon name={icon} color={fg} size={compact ? 15 : 19} />}
      <T
        color={fg}
        size={compact ? 11 : 14}
        weight="semibold"
        style={{ textAlign: "center", flexShrink: 1 }}
      >
        {title}
      </T>
    </Row>
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(title)}
      disabled={disabled || busy}
      accessibilityState={{ disabled: disabled || busy, busy }}
      aria-disabled={disabled || busy}
      aria-busy={busy}
      onPress={press}
      style={({ pressed }) => [
        {
          minHeight: compact ? 34 : 46,
          borderRadius: 9,
          overflow: "hidden",
          opacity: disabled || busy ? 0.4 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {variant === "primary" ? (
        <LinearGradient
          colors={["#04988f", "#036b6c"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: compact ? 10 : 14,
            paddingVertical: 9,
          }}
        >
          {contents}
        </LinearGradient>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            borderRadius: 9,
            paddingHorizontal: compact ? 10 : 14,
            paddingVertical: 9,
            backgroundColor:
              variant === "danger"
                ? c.red
                : variant === "secondary"
                  ? c.teal
                  : "transparent",
            borderWidth: variant === "outline" ? 1 : 0,
            borderColor: c.border,
          }}
        >
          {contents}
        </View>
      )}
    </Pressable>
  );
}

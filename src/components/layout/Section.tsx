import React from "react";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";
import { Icon } from "../icons/Icon";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";
import { Row } from "./Row";

export function Section({
  title,
  action,
  onPress,
  children,
  style,
  size = "small",
}: {
  title: string;
  action?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  size?: "small" | "large";
}) {
  const { c, language } = useUI();
  return (
    <View style={[{ gap: size === "large" ? 16 : 10 }, style]}>
      <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
        <T
          weight={size === "large" ? "bold" : "semibold"}
          size={size === "large" ? (language === "ps" ? 18 : 16) : 13}
          style={size === "large" ? { flex: 1 } : undefined}
        >
          {title}
        </T>
        {action && (
          <Pressable
            accessibilityRole="button"
            onPress={onPress}
            style={
              size === "large"
                ? {
                    minHeight: 44,
                    minWidth: 44,
                    justifyContent: "center",
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    backgroundColor: c.muted,
                  }
                : undefined
            }
          >
            <Row gap={3}>
              <T
                size={size === "large" ? (language === "ps" ? 15 : 13) : 10}
                weight={size === "large" ? "medium" : "regular"}
                color={size === "large" ? c.primary : c.blue}
              >
                {action}
              </T>
              <Icon
                name="ChevronRight"
                size={size === "large" ? 15 : 12}
                color={size === "large" ? c.primary : c.blue}
              />
            </Row>
          </Pressable>
        )}
      </Row>
      {children}
    </View>
  );
}

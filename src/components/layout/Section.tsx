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
}: {
  title: string;
  action?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useUI();
  return (
    <View style={[{ gap: 10 }, style]}>
      <Row style={{ justifyContent: "space-between" }}>
        <T weight="semibold" size={13}>
          {title}
        </T>
        {action && (
          <Pressable accessibilityRole="button" onPress={onPress}>
            <Row gap={3}>
              <T size={10} color={c.blue}>
                {action}
              </T>
              <Icon name="ChevronRight" size={12} color={c.blue} />
            </Row>
          </Pressable>
        )}
      </Row>
      {children}
    </View>
  );
}

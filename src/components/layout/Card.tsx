import React from "react";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";
import { type Tone, toneColors } from "../theme/palette";
import { useUI } from "../theme/UIContext";

export function Card({
  children,
  style,
  tone,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: Tone;
  onPress?: () => void;
}) {
  const { c } = useUI();
  const styles: StyleProp<ViewStyle> = [
    {
      backgroundColor: tone ? toneColors(c, tone).bg : c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 13,
      padding: 12,
    },
    style,
  ];
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles, { opacity: pressed ? 0.75 : 1 }]}
    >
      {children}
    </Pressable>
  ) : (
    <View style={styles}>{children}</View>
  );
}

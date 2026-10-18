import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useUI } from "../theme/UIContext";

export function Row({
  children,
  style,
  gap = 8,
  wrap = false,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  gap?: number;
  wrap?: boolean;
}) {
  const { rtl } = useUI();
  return (
    <View
      style={[
        {
          flexDirection: rtl ? "row-reverse" : "row",
          alignItems: "center",
          gap,
          flexWrap: wrap ? "wrap" : "nowrap",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

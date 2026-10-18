import React from "react";
import { StyleProp, Text, TextStyle } from "react-native";
import { translateText } from "../../i18n/translate";
import { fontFamilies, type FontWeight } from "../theme/typography";
import { useUI } from "../theme/UIContext";

export function T({
  children,
  size = 13,
  weight = "regular",
  color,
  style,
  lines,
  translate = true,
}: {
  children: React.ReactNode;
  size?: number;
  weight?: FontWeight;
  color?: string;
  style?: StyleProp<TextStyle>;
  lines?: number;
  translate?: boolean;
}) {
  const { c, rtl, language } = useUI();
  const numericText =
    typeof children === "string" && /^[\d\s.,:/%+−#()\-]+$/.test(children);
  return (
    <Text
      numberOfLines={lines}
      style={[
        {
          color: color ?? c.text,
          fontSize: size,
          lineHeight: size * (language === "ps" ? 1.6 : 1.35),
          fontFamily: language === "ps" ? undefined : fontFamilies[weight],
          fontWeight:
            language === "ps" ? (weight === "bold" ? "700" : "400") : undefined,
          textAlign: rtl ? "right" : "left",
          writingDirection: rtl && !numericText ? "rtl" : "ltr",
        },
        style,
      ]}
    >
      {translate
        ? React.Children.map(children, (child) =>
            typeof child === "string" ? translateText(child, language) : child,
          )
        : children}
    </Text>
  );
}

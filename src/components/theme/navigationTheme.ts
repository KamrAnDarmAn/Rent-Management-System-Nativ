import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { dark, type Palette } from "./palette";

export function navigationTheme(c: Palette) {
  const base = c === dark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: c.primary,
      background: c.bg,
      card: c.surface,
      text: c.text,
      border: c.border,
    },
  };
}

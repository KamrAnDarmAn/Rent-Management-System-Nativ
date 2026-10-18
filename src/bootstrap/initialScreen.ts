import { Platform } from "react-native";
import { screenReferences } from "../data/screenReferences";
import type { ScreenId } from "../navigation/types";

export function initialScreen(): ScreenId | undefined {
  if (Platform.OS !== "web") return undefined;
  const value = new URLSearchParams(globalThis.location?.search).get("screen");
  return value &&
    (value === "screen-gallery" ||
      value === "edit-shop" ||
      screenReferences.some((s) => s.id === value))
    ? (value as ScreenId)
    : undefined;
}

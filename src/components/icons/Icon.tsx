import { type LucideProps } from "lucide-react-native";
import React from "react";
import Svg, { Path } from "react-native-svg";
import { useUI } from "../theme/UIContext";
import { iconComponents } from "./iconRegistry";

export type IconName = keyof typeof iconComponents;

export function Icon({
  name,
  size = 20,
  color,
  strokeWidth = 1.9,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const { c, rtl } = useUI();
  const Component = iconComponents[name] as React.ComponentType<LucideProps>;
  if (name === "Store")
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          fill={color ?? c.primary}
          d="M5 3h14l3 5H2l3-5Zm-3 6h20v.5a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0V9Zm2 4h3v7h4v-7h9v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7Zm10 2v3h4v-3h-4Z"
          fillRule="evenodd"
        />
      </Svg>
    );
  return (
    <Component
      size={size}
      color={color ?? c.primary}
      strokeWidth={strokeWidth}
      style={
        rtl && ["ChevronLeft", "ChevronRight", "ArrowRight"].includes(name)
          ? { transform: [{ scaleX: -1 }] }
          : undefined
      }
    />
  );
}

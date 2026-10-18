import { useText } from "../hooks/useText";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Platform, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../components/icons/Icon";
import { Row } from "../components/layout/Row";
import { useUI } from "../components/theme/UIContext";
import { T } from "../components/typography/T";
import { tabItems } from "./config";
import { type TabId } from "./types";

export function BottomBar({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: TabId) => void;
}) {
  const t = useText();
  const { c, rtl } = useUI();
  const insets = useSafeAreaInsets();
  return (
    <Row
      gap={0}
      style={{
        flexDirection: rtl ? "row-reverse" : "row",
        backgroundColor: c.surface,
        paddingTop: 6,
        paddingHorizontal: 8,
        paddingBottom: Math.max(Platform.OS === "web" ? 9 : 4, insets.bottom),
        borderTopWidth: 1,
        borderTopColor: c.border,
        minHeight: 65,
      }}
    >
      {tabItems.map((tab) => (
        <Pressable
          key={tab.id}
          accessibilityRole="tab"
          accessibilityLabel={t(tab.label)}
          accessibilityState={{ selected: selected === tab.id }}
          onPress={() => onSelect(tab.id)}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 13,
            gap: 4,
            paddingVertical: 7,
            minHeight: 48,
            backgroundColor: selected === tab.id ? c.teal : "transparent",
          }}
        >
          <Icon
            name={tab.icon}
            color={selected === tab.id ? c.primary : c.sub}
            size={23}
            strokeWidth={selected === tab.id ? 2.5 : 1.9}
          />
          <T
            size={10}
            weight={selected === tab.id ? "semibold" : "medium"}
            color={selected === tab.id ? c.primary : c.sub}
          >
            {tab.label}
          </T>
        </Pressable>
      ))}
    </Row>
  );
}

export function TabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <BottomBar
      selected={state.routes[state.index].name}
      onSelect={(id) => {
        const event = navigation.emit({
          type: "tabPress",
          target: state.routes.find((r) => r.name === id)?.key,
          canPreventDefault: true,
        });
        if (!event.defaultPrevented) navigation.navigate(id);
      }}
    />
  );
}

import { Pressable, ScrollView } from "react-native";
import { dark } from "../theme/palette";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export function Chips({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  const { c } = useUI();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 5 }}
      style={{ flexGrow: 0 }}
    >
      {options.map((option) => (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: option === selected }}
          key={option}
          onPress={() => onSelect(option)}
          style={{
            minHeight: 30,
            paddingHorizontal: 10,
            borderRadius: 20,
            backgroundColor: option === selected ? c.primary : c.surface,
            borderWidth: 1,
            borderColor: option === selected ? c.primary : c.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <T
            size={10}
            color={
              option === selected ? (c === dark ? "#082722" : "#fff") : c.sub
            }
            weight="medium"
          >
            {option}
          </T>
        </Pressable>
      ))}
    </ScrollView>
  );
}

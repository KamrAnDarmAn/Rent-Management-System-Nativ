import { View } from "react-native";
import { T } from "../../../components/typography/T";
import { useUI } from "../../../components/theme/UIContext";

export function ShopDetailFields({
  fields,
}: {
  fields: readonly (readonly [string, string])[];
}) {
  const { c, language } = useUI();
  return (
    <View>
      {fields.map(([label, value], index) => (
        <View
          key={label}
          style={{
            gap: 5,
            paddingVertical: 12,
            borderTopWidth: index ? 1 : 0,
            borderTopColor: c.border,
          }}
        >
          <T
            size={language === "ps" ? 15 : 13}
            color={c.text}
            style={{ opacity: 0.72 }}
          >
            {label}
          </T>
          <T size={language === "ps" ? 17 : 15} weight="medium">
            {value}
          </T>
        </View>
      ))}
    </View>
  );
}

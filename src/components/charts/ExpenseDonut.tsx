import { View } from "react-native";
import { categories } from "../../data/expenseCategories";
import { number } from "../../utils/format";
import { Row } from "../layout/Row";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";
import { Donut } from "./Donut";

export function ExpenseDonut() {
  const { c } = useUI();
  return (
    <Row gap={12}>
      <Donut />
      <View style={{ flex: 1, gap: 9 }}>
        {categories.map((cat) => (
          <Row key={cat.name} gap={5}>
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: cat.color,
              }}
            />
            <T size={9} color={c.sub} style={{ flex: 1 }}>
              {cat.name}
            </T>
            <T size={9} weight="semibold">{`${cat.percent}%`}</T>
            <T size={8} color={c.sub}>
              {number(cat.amount)}
            </T>
          </Row>
        ))}
      </View>
    </Row>
  );
}

import { View } from "react-native";
import { Badge } from "../../../components/feedback/Badge";
import { Progress } from "../../../components/feedback/Progress";
import { Card } from "../../../components/layout/Card";
import { Row } from "../../../components/layout/Row";
import { useUI } from "../../../components/theme/UIContext";
import { T } from "../../../components/typography/T";
import { money } from "../../../utils/format";

export function CollectionSummary({
  expected,
  settled,
  remaining,
}: {
  expected: bigint;
  settled: bigint;
  remaining: bigint;
}) {
  const { c } = useUI();
  const percent = expected
    ? Number((settled * 100n + expected / 2n) / expected)
    : 0;
  return (
    <Card tone="teal" style={{ padding: 12, gap: 5, borderColor: c.border }}>
      <Row
        style={{ justifyContent: "space-between", alignItems: "flex-start" }}
      >
        <View>
          <T size={11} color={c.sub}>
            Total Expected Rent (Selected Month)
          </T>
          <T size={27} weight="bold" style={{ letterSpacing: -1 }}>
            {money(expected)}
          </T>
        </View>
        <View style={{ alignItems: "flex-end", paddingTop: 3 }}>
          <Badge label={`${percent}%`} icon="CircleCheck" tone="green" />
          <T size={8} color={c.sub}>
            Settled Rent
          </T>
        </View>
      </Row>
      <Row>
        <Progress value={percent} height={10} />
        <T weight="bold" size={12} color={c.primary}>
          {`${percent}%`}
        </T>
      </Row>
      <Row style={{ marginTop: 1 }}>
        <View style={{ flex: 1 }}>
          <T size={11} color={c.sub}>
            Settled Rent
          </T>
          <T weight="bold" size={20} color={c.green}>
            {money(settled)}
          </T>
        </View>
        <View style={{ width: 1, height: 35, backgroundColor: c.border }} />
        <View style={{ flex: 1, paddingLeft: 10 }}>
          <T size={11} color={c.sub}>
            Remaining
          </T>
          <T weight="bold" size={20}>
            {money(remaining)}
          </T>
        </View>
      </Row>
    </Card>
  );
}

import { useState } from "react";
import { Pressable, View } from "react-native";
import { Button } from "../../../components/buttons/Button";
import { Progress } from "../../../components/feedback/Progress";
import { Badge } from "../../../components/feedback/Badge";
import { Card } from "../../../components/layout/Card";
import { Row } from "../../../components/layout/Row";
import { Section } from "../../../components/layout/Section";
import { useUI } from "../../../components/theme/UIContext";
import { T } from "../../../components/typography/T";
import { reportPercent, type RentReport } from "../../../domain/reports";
import { useGo } from "../../../hooks/useGo";
import { useText } from "../../../hooks/useText";
import { money } from "../../../utils/format";

export function ReportShopPerformance({ report }: { report: RentReport }) {
  const { c } = useUI();
  const go = useGo();
  const t = useText();
  const [expanded, setExpanded] = useState(false);
  const outstanding = report.shops.filter((row) => row.outstanding > 0n);
  const largest = outstanding[0]?.outstanding ?? 0n;
  return (
    <>
      <Card>
        <Section title="Outstanding by Shop">
          {!outstanding.length && (
            <T size={11} color={c.primary}>
              No outstanding rent in this scope.
            </T>
          )}
          {outstanding.slice(0, 5).map((row) => (
            <Pressable
              key={row.shop.id}
              accessibilityRole="button"
              accessibilityLabel={t("View report for {{shop}}", {
                shop: t("Shop #{{number}}", { number: row.shop.number }),
              })}
              onPress={() => go("shop-financial-report", row.shop.id)}
              style={{ gap: 6, paddingVertical: 6 }}
            >
              <Row style={{ justifyContent: "space-between" }}>
                <T
                  size={11}
                  style={{ flex: 1 }}
                  lines={1}
                >{`${t("Shop #{{number}}", { number: row.shop.number })} · ${t(row.shop.name)}`}</T>
                <T size={12} color={c.red} weight="bold">
                  {money(row.outstanding)}
                </T>
              </Row>
              <Row>
                <Progress
                  value={reportPercent(row.outstanding, largest)}
                  color={c.red}
                  height={9}
                />
              </Row>
            </Pressable>
          ))}
        </Section>
      </Card>
      <Card>
        <Section title="Shop Performance">
          {!report.shops.length && (
            <T size={11} color={c.sub}>
              No shops use this rent calendar yet.
            </T>
          )}
          {(expanded ? report.shops : report.shops.slice(0, 5)).map((row) => (
            <Pressable
              key={row.shop.id}
              accessibilityRole="button"
              accessibilityLabel={t("View report for {{shop}}", {
                shop: t("Shop #{{number}}", { number: row.shop.number }),
              })}
              onPress={() => go("shop-financial-report", row.shop.id)}
              style={{
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderColor: c.border,
                gap: 8,
              }}
            >
              <Row style={{ alignItems: "flex-start" }}>
                <View style={{ flex: 1, gap: 3 }}>
                  <T size={12} weight="bold">
                    {t("Shop #{{number}}", { number: row.shop.number })}
                  </T>
                  <T size={10} color={c.sub}>
                    {row.shop.name}
                  </T>
                  <T size={10} color={c.sub}>
                    {row.shop.keeper}
                  </T>
                </View>
                <Badge
                  label={row.shop.occupied ? row.status : "Vacant"}
                  tone={
                    row.status === "Paid"
                      ? "green"
                      : row.status === "Partial"
                        ? "orange"
                        : "muted"
                  }
                  small
                />
              </Row>
              <Row style={{ alignItems: "flex-start" }}>
                <View style={{ flex: 1, gap: 3 }}>
                  <T size={9} color={c.sub}>
                    Payments Received
                  </T>
                  <T size={12} weight="semibold" color={c.primary}>
                    {money(row.received)}
                  </T>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <T size={9} color={c.sub}>
                    Outstanding Rent
                  </T>
                  <T
                    size={12}
                    weight="semibold"
                    color={row.outstanding ? c.red : c.green}
                  >
                    {money(row.outstanding)}
                  </T>
                </View>
              </Row>
              <T size={9} color={c.sub}>
                {t("Settled {{settled}} of {{expected}}", {
                  settled: money(row.settled),
                  expected: money(row.expected),
                })}
              </T>
              <Row>
                <Progress
                  value={reportPercent(row.settled, row.expected)}
                  height={5}
                />
              </Row>
            </Pressable>
          ))}
          {report.shops.length > 5 && (
            <Button
              title={expanded ? "Show Fewer Shops" : "Show All Shops"}
              variant="outline"
              compact
              onPress={() => setExpanded(!expanded)}
            />
          )}
        </Section>
      </Card>
    </>
  );
}

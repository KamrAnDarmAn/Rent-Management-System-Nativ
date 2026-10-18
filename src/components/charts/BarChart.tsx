import { View } from "react-native";
import { Badge } from "../feedback/Badge";
import { Row } from "../layout/Row";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export function BarChart({ small = false }: { small?: boolean }) {
  const { c } = useUI();
  const months = small
    ? ["Expected", "Collected"]
    : [
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
        "Jan",
        "Feb",
        "Mar",
      ];
  return (
    <View style={{ gap: 8 }}>
      <Row
        style={{
          height: small ? 100 : 105,
          alignItems: "flex-end",
          borderBottomWidth: 1,
          borderColor: c.border,
          paddingHorizontal: 5,
        }}
        gap={small ? 30 : 5}
      >
        {months.map((m, i) => (
          <View
            key={m}
            style={{
              flex: 1,
              alignItems: "center",
              height: "100%",
              justifyContent: "flex-end",
            }}
          >
            <Row gap={3} style={{ alignItems: "flex-end", height: "100%" }}>
              <View
                style={{
                  width: small ? 35 : 7,
                  height: small ? (i ? 65 : 95) : 40 + ((i * 13) % 53),
                  backgroundColor: i === 1 && small ? "#10b99b" : "#399aff",
                  borderTopLeftRadius: 2,
                  borderTopRightRadius: 2,
                }}
              />
              {!small && (
                <View
                  style={{
                    width: 7,
                    height: 28 + ((i * 9) % 45),
                    backgroundColor: "#0fbb9d",
                    borderTopLeftRadius: 2,
                    borderTopRightRadius: 2,
                  }}
                />
              )}
            </Row>
          </View>
        ))}
      </Row>
      <Row gap={small ? 20 : 2}>
        {months.map((m) => (
          <T
            key={m}
            size={small ? 9 : 8}
            color={c.sub}
            style={{ flex: 1, textAlign: "center" }}
          >
            {m}
          </T>
        ))}
      </Row>
      <Row style={{ justifyContent: "center" }}>
        <Badge label="Expected" tone="blue" small />
        <Badge label="Collected" tone="teal" small />
      </Row>
    </View>
  );
}

import { View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { Row } from "../layout/Row";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export function TrendChart() {
  const { c, rtl } = useUI();
  return (
    <View>
      <Svg
        width="100%"
        height={105}
        viewBox="0 0 300 125"
        style={rtl ? { transform: [{ scaleX: -1 }] } : undefined}
      >
        {[20, 50, 80, 110].map((y) => (
          <Line key={y} x1="5" x2="290" y1={y} y2={y} stroke={c.border} />
        ))}
        <Path
          d="M8 106 L60 85 L112 52 L165 63 L220 30 L282 11 L282 110 L8 110Z"
          fill="#0fc2a2"
          opacity={0.14}
        />
        <Path
          d="M8 106 L60 85 L112 52 L165 63 L220 30 L282 11"
          fill="none"
          stroke="#0bb696"
          strokeWidth="3"
        />
        {[
          [8, 106],
          [60, 85],
          [112, 52],
          [165, 63],
          [220, 30],
          [282, 11],
        ].map(([x, y]) => (
          <Circle key={x} cx={x} cy={y} r={4} fill="#0bb696" />
        ))}
      </Svg>
      <Row>
        {["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"].map((m) => (
          <T
            key={m}
            size={9}
            color={c.sub}
            style={{ flex: 1, textAlign: "center" }}
          >
            {m}
          </T>
        ))}
      </Row>
    </View>
  );
}

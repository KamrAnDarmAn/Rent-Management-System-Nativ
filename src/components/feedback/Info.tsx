import { View } from "react-native";
import { type IconName, Icon } from "../icons/Icon";
import { Row } from "../layout/Row";
import { type Tone, toneColors } from "../theme/palette";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export function Info({
  title,
  text,
  tone = "blue",
  icon = "Info",
}: {
  title?: string;
  text: string;
  tone?: Tone;
  icon?: IconName;
}) {
  const { c } = useUI();
  const colors = toneColors(c, tone);
  return (
    <Row
      style={{
        padding: 10,
        borderRadius: 9,
        backgroundColor: colors.bg,
        alignItems: "flex-start",
      }}
    >
      <Icon name={icon} size={17} color={colors.fg} />
      <View style={{ flex: 1, gap: 3 }}>
        {title && (
          <T size={11} weight="semibold">
            {title}
          </T>
        )}
        <T size={10} color={c.sub}>
          {text}
        </T>
      </View>
    </Row>
  );
}

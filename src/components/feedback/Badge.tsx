import { type IconName, Icon } from "../icons/Icon";
import { Row } from "../layout/Row";
import { type Tone, toneColors } from "../theme/palette";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export function Badge({
  label,
  tone = "green",
  icon,
  small = false,
}: {
  label: string;
  tone?: Tone;
  icon?: IconName;
  small?: boolean;
}) {
  const { c } = useUI();
  const colors = toneColors(c, tone);
  return (
    <Row
      gap={4}
      style={{
        alignSelf: "flex-start",
        maxWidth: "100%",
        flexShrink: 1,
        backgroundColor: colors.bg,
        borderRadius: 20,
        paddingHorizontal: small ? 7 : 10,
        paddingVertical: small ? 2 : 5,
      }}
    >
      {icon && <Icon name={icon} color={colors.fg} size={small ? 11 : 13} />}
      <T
        size={small ? 9 : 11}
        weight="medium"
        color={colors.fg}
        style={{ flexShrink: 1 }}
      >
        {label}
      </T>
    </Row>
  );
}

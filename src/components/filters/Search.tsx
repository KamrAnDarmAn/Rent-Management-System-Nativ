import { useText } from "../../hooks/useText";
import { TextInput } from "react-native";
import { IconButton } from "../buttons/IconButton";
import { Icon } from "../icons/Icon";
import { Card } from "../layout/Card";
import { Row } from "../layout/Row";
import { useUI } from "../theme/UIContext";

export function Search({
  value,
  onChange,
  placeholder = "Search shops or shopkeeper…",
  onFilter,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onFilter?: () => void;
}) {
  const t = useText();
  const { c, language, rtl } = useUI();
  return (
    <Row>
      <Card style={{ flex: 1, paddingVertical: 0, minHeight: 41 }}>
        <Row>
          <Icon name="Search" size={17} color={c.sub} />
          <TextInput
            accessibilityLabel={t("Search shops")}
            placeholder={t(placeholder)}
            placeholderTextColor={c.sub}
            value={value}
            onChangeText={onChange}
            style={{
              flex: 1,
              minWidth: 0,
              height: 39,
              color: c.text,
              fontSize: 11,
              fontFamily: language === "ps" ? undefined : "Inter_400Regular",
              textAlign: rtl ? "right" : "left",
              writingDirection: rtl ? "rtl" : "ltr",
            }}
          />
        </Row>
      </Card>
      <IconButton
        name="ListFilter"
        label="Filter shops"
        onPress={onFilter ?? (() => {})}
        size={41}
      />
    </Row>
  );
}

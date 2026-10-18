import { useText } from "../../hooks/useText";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { type IconName, Icon } from "../icons/Icon";
import { IconTile } from "../icons/IconTile";
import { Row } from "../layout/Row";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  required,
  helper,
  multiline,
  numeric,
  error,
  suffix,
  readOnly = false,
  secure = false,
}: {
  label: string;
  value?: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  icon?: IconName;
  required?: boolean;
  helper?: string;
  multiline?: boolean;
  numeric?: boolean;
  error?: string;
  suffix?: string;
  readOnly?: boolean;
  secure?: boolean;
}) {
  const t = useText();
  const { c, rtl, language } = useUI();
  const [focused, setFocused] = useState(false);
  const dense = Boolean(helper) || !label;
  return (
    <Row gap={7} style={{ flex: 1, minWidth: 0, alignItems: "flex-start" }}>
      {dense && icon && <IconTile name={icon} size={28} />}
      <View style={{ flex: 1, gap: dense ? 4 : 5, minWidth: 0 }}>
        <Row gap={5}>
          {icon && !dense && <Icon name={icon} size={14} />}
          <T size={11} weight="medium">
            {label}
          </T>
          {required && <T color={c.red}>*</T>}
        </Row>
        <View
          style={{
            flexDirection: rtl ? "row-reverse" : "row",
            alignItems: multiline ? "flex-start" : "center",
            minHeight: multiline ? (dense ? 48 : 65) : dense ? 31 : 39,
            borderRadius: 7,
            borderWidth: 1,
            borderColor: error ? c.red : focused ? c.primary : c.border,
            backgroundColor: c.surface,
            paddingHorizontal: 10,
          }}
        >
          <TextInput
            accessibilityLabel={t(label)}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder ? t(placeholder) : undefined}
            placeholderTextColor={c.sub}
            editable={!readOnly}
            secureTextEntry={secure}
            autoCapitalize={secure ? "none" : "sentences"}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            keyboardType={numeric ? "numeric" : "default"}
            multiline={multiline}
            style={{
              flex: 1,
              color: c.text,
              fontSize: dense ? 11 : 12,
              fontFamily: language === "ps" ? undefined : "Inter_400Regular",
              writingDirection:
                numeric || label === "Phone Number" || label.includes("Date")
                  ? "ltr"
                  : rtl
                    ? "rtl"
                    : "ltr",
              minHeight: multiline ? (dense ? 46 : 60) : dense ? 30 : 38,
              textAlign: rtl ? "right" : "left",
              paddingVertical: dense ? 6 : 8,
              width: "100%",
            }}
          />
          {suffix && (
            <T size={11} color={c.sub}>
              {suffix}
            </T>
          )}
        </View>
        {(helper || error) && (
          <T size={dense ? 8 : 9} color={error ? c.red : c.sub}>
            {error ?? helper}
          </T>
        )}
      </View>
    </Row>
  );
}

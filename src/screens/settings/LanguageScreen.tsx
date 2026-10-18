import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { View } from "react-native";
import { Logo } from "../../components/branding/Logo";
import { Button } from "../../components/buttons/Button";
import { Badge } from "../../components/feedback/Badge";
import { Info } from "../../components/feedback/Info";
import { Icon } from "../../components/icons/Icon";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { Row } from "../../components/layout/Row";
import { Section } from "../../components/layout/Section";
import { useUI } from "../../components/theme/UIContext";
import { T } from "../../components/typography/T";
import { usePreferences } from "../../store/preferencesStore";

export function LanguageScreen() {
  const { c, notify } = useUI();
  const language = usePreferences((s) => s.language);
  const setLanguage = usePreferences((s) => s.setLanguage);
  const [selected, setSelected] = useState<"en" | "ps">(language);
  const nav = useNavigation();
  return (
    <Page
      title="Language"
      subtitle="Choose your preferred language for the app interface"
      footer={
        <Button
          title="Save & Apply"
          icon="Check"
          onPress={() => {
            setLanguage(selected);
            notify(selected === "ps" ? "ژبه بدله شوه" : "Language updated.");
          }}
        />
      }
    >
      <Card tone="teal" style={{ marginVertical: 12, paddingVertical: 23 }}>
        <Row>
          <View style={{ flex: 1, gap: 8 }}>
            <T size={23} weight="bold">
              Same App. Your Language.
            </T>
            <T size={11} color={c.sub}>
              Use GMM in the language you're most comfortable with.
            </T>
          </View>
          <View
            style={{
              flex: 1,
              height: 170,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                position: "absolute",
                left: 5,
                top: 13,
                width: 94,
                height: 143,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: "#9eddd8",
                backgroundColor: c.surface,
                transform: [{ rotate: "-9deg" }],
                padding: 9,
                gap: 9,
              }}
            >
              <Logo size={25} />
              <T size={7} weight="semibold">
                GMM
              </T>
              {["Collect", "Shops", "Reports", "Settings"].map((x) => (
                <Row key={x} gap={3}>
                  <Icon name="Store" size={9} />
                  <T size={7}>{x}</T>
                </Row>
              ))}
              <Badge label="LTR" small />
            </View>
            <View
              style={{
                position: "absolute",
                right: 0,
                top: 22,
                width: 93,
                height: 143,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: "#9dc5ee",
                backgroundColor: c.surface,
                transform: [{ rotate: "7deg" }],
                padding: 9,
                gap: 9,
              }}
            >
              <Logo size={25} />
              <T size={8} weight="semibold">
                د کرایې مدیر
              </T>
              {["راټولول", "دوکانونه", "راپورونه", "امستنې"].map((x) => (
                <Row key={x} gap={3}>
                  <T size={8} style={{ flex: 1 }}>
                    {x}
                  </T>
                  <Icon name="Store" size={9} />
                </Row>
              ))}
              <Badge label="RTL" tone="blue" small />
            </View>
          </View>
        </Row>
      </Card>
      <Section title="Select Language">
        {[
          {
            key: "en",
            name: "English",
            detail: "Use the app in English",
            flag: "🇬🇧",
          },
          {
            key: "ps",
            name: "پښتو",
            detail: "د پښتو ژبې لپاره دا انتخاب وکاروئ",
            flag: "پښتو",
          },
        ].map((lang) => (
          <Card
            key={lang.key}
            onPress={() => setSelected(lang.key as "en" | "ps")}
            tone={selected === lang.key ? "teal" : undefined}
            style={{
              borderColor: selected === lang.key ? c.primary : c.border,
              padding: 15,
            }}
          >
            <Row>
              <T size={lang.key === "en" ? 26 : 18}>{lang.flag}</T>
              <View style={{ flex: 1 }}>
                <T weight="semibold" size={15}>
                  {lang.name}
                </T>
                <T size={11} color={c.sub}>
                  {lang.detail}
                </T>
              </View>
              <Icon
                name={selected === lang.key ? "CircleDot" : "Circle"}
                color={selected === lang.key ? c.primary : c.border}
                size={20}
              />
            </Row>
          </Card>
        ))}
      </Section>
      <Info
        title="Interface Direction"
        text="English uses Left-to-Right (LTR) layout. پښتو uses Right-to-Left (RTL) layout for a more natural experience."
      />
    </Page>
  );
}

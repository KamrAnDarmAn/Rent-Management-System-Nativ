import { useText } from "../../hooks/useText";
import { ActivityIndicator, Image, Pressable, View } from "react-native";
import { Logo } from "../../components/branding/Logo";
import { Button } from "../../components/buttons/Button";
import { Icon, type IconName } from "../../components/icons/Icon";
import { IconTile } from "../../components/icons/IconTile";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { Row } from "../../components/layout/Row";
import { useUI } from "../../components/theme/UIContext";
import { T } from "../../components/typography/T";
import { useGo } from "../../hooks/useGo";
import { usePreferences } from "../../store/preferencesStore";

export function WelcomeScreen({ splash = false }: { splash?: boolean }) {
  const t = useText();
  const { c } = useUI();
  const go = useGo();
  const setLanguage = usePreferences((s) => s.setLanguage);
  if (splash)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: c.bg,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 35,
          gap: 10,
        }}
      >
        <View style={{ flex: 1 }} />
        <Logo size={110} />
        <T size={27} weight="bold" style={{ letterSpacing: -1 }}>
          GMM
        </T>
        <T size={14} color={c.sub}>
          Simple. Organized. Always in Control.
        </T>
        <Image
          source={require("../../../assets/reference/shop-illustration.png")}
          resizeMode="contain"
          style={{ width: "100%", height: 235, marginTop: 15 }}
        />
        <Pressable
          accessibilityLabel={t("Continue from splash")}
          onPress={() => go("get-started")}
          style={{ alignItems: "center", gap: 10, marginTop: 20 }}
        >
          <ActivityIndicator size="large" color={c.primary} />
          <T size={13} color={c.sub}>
            Loading…
          </T>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Button
          title="Continue"
          onPress={() => go("get-started")}
          variant="ghost"
          compact
        />
        <T size={10} color={c.sub} style={{ paddingBottom: 25 }}>
          Manage Shops · Grow Peacefully
        </T>
      </View>
    );
  return (
    <Page
      back={false}
      noPadding
      footer={
        <View style={{ gap: 10 }}>
          <Button
            title="Get Started"
            icon="ArrowRight"
            onPress={() => go("setup-property")}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => go("backup-restore")}
          >
            <T
              size={11}
              color={c.sub}
              style={{ textAlign: "center", paddingVertical: 4 }}
            >
              Restore Backup
            </T>
          </Pressable>
        </View>
      }
    >
      <Row
        style={{
          justifyContent: "flex-end",
          paddingHorizontal: 18,
          paddingTop: 20,
        }}
      >
        <Card style={{ padding: 8, borderRadius: 22 }}>
          <Row>
            <Icon name="Globe" size={17} />
            <Pressable onPress={() => setLanguage("en")}>
              <T size={12} color={c.primary}>
                English
              </T>
            </Pressable>
            <T color={c.border}>|</T>
            <Pressable onPress={() => setLanguage("ps")}>
              <T size={14} color={c.sub}>
                پښتو
              </T>
            </Pressable>
          </Row>
        </Card>
      </Row>
      <Row style={{ paddingHorizontal: 20, marginTop: 15, marginBottom: 5 }}>
        <Logo size={64} />
        <View style={{ flex: 1 }}>
          <T size={21} weight="bold" style={{ letterSpacing: -0.7 }}>
            GMM
          </T>
          <T size={11} color={c.sub}>
            Simple. Organized. Always in Control.
          </T>
        </View>
      </Row>
      <Image
        source={require("../../../assets/reference/shops-illustration.png")}
        style={{ width: "100%", height: 225 }}
        resizeMode="contain"
      />
      <View style={{ paddingHorizontal: 25, gap: 12 }}>
        <T
          size={28}
          weight="bold"
          style={{ textAlign: "center", letterSpacing: -1 }}
        >
          Manage your shops{`\n`}with confidence.
        </T>
        <T size={16} color={c.sub} style={{ textAlign: "center" }}>
          Track rent, payments, credits and expenses — even offline.
        </T>
      </View>
      <Row style={{ marginTop: 13, paddingHorizontal: 16 }}>
        {[
          { title: "Offline\nFirst", icon: "WifiOff" },
          { title: "Your Data\nStays on Device", icon: "Database" },
          { title: "Secure &\nPrivate", icon: "ShieldCheck" },
          {
            title: "Built for\nLandlords",
            icon: "ChartNoAxesColumnIncreasing",
          },
        ].map((feature) => (
          <View
            key={feature.title}
            style={{ flex: 1, alignItems: "center", gap: 7 }}
          >
            <IconTile name={feature.icon as IconName} size={46} />
            <T size={10} color={c.sub} style={{ textAlign: "center" }}>
              {feature.title}
            </T>
          </View>
        ))}
      </Row>
      <Row style={{ justifyContent: "center", paddingVertical: 11 }}>
        {[0, 1, 2].map((n) => (
          <View
            key={n}
            style={{
              width: 7,
              height: 7,
              borderRadius: 5,
              backgroundColor: n === 0 ? c.primary : c.border,
            }}
          />
        ))}
      </Row>
    </Page>
  );
}

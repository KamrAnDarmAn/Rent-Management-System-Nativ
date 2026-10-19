import { useText } from "../../hooks/useText";
import appConfig from "../../../app.json";
import type { Ref } from "react";
import { Pressable, View } from "react-native";
import { Button } from "../../components/buttons/Button";
import { DropdownMenu } from "../../components/menus/DropdownMenu";
import { useAnchoredMenu } from "../../hooks/useAnchoredMenu";
import { Icon, type IconName } from "../../components/icons/Icon";
import { IconTile } from "../../components/icons/IconTile";
import { Card } from "../../components/layout/Card";
import { Divider } from "../../components/layout/Divider";
import { Page } from "../../components/layout/Page";
import { Row } from "../../components/layout/Row";
import { useUI } from "../../components/theme/UIContext";
import { T } from "../../components/typography/T";
import { useGo } from "../../hooks/useGo";
import { usePreferences } from "../../store/preferencesStore";

export function SettingsScreen() {
  const t = useText();
  const { c, notify } = useUI();
  const go = useGo();
  const prefs = usePreferences();
  const appearance = useAnchoredMenu();
  const item = (
    title: string,
    subtitle: string,
    icon: IconName,
    tone: "green" | "blue" | "orange" | "teal" | "purple" | "red",
    action: () => void,
    value?: string,
    ref?: Ref<View>,
  ) => (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={t(title)}
      onPress={action}
      style={{ paddingVertical: 8 }}
    >
      <Row gap={11}>
        <IconTile name={icon} tone={tone} size={35} />
        <View style={{ flex: 1 }}>
          <T size={14} weight="semibold">
            {title}
          </T>
          <T size={10} color={c.sub}>
            {subtitle}
          </T>
        </View>
        {value && (
          <T size={11} color={c.sub}>
            {value}
          </T>
        )}
        <Icon name="ChevronRight" color={c.sub} size={17} />
      </Row>
    </Pressable>
  );
  return (
    <Page
      title="Settings"
      subtitle="Manage your app preferences"
      back={false}
      leading={
        <View
          style={{
            width: 49,
            height: 49,
            borderRadius: 13,
            backgroundColor: c.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="Settings" size={31} color="#fff" strokeWidth={2.8} />
        </View>
      }
    >
      <Card style={{ paddingVertical: 6 }}>
        <T size={10} color={c.sub} weight="medium" style={{ paddingTop: 5 }}>
          GENERAL
        </T>
        {item(
          "Language",
          "Choose your preferred language",
          "Globe",
          "green",
          () => go("language"),
          prefs.language === "en" ? "English⌄" : "پښتو⌄",
        )}
        <Divider />
        {item(
          "Appearance",
          "Choose light, dark or system theme",
          "Palette",
          "blue",
          appearance.open,
          prefs.theme === "system"
            ? "System⌄"
            : prefs.theme === "dark"
              ? "Dark⌄"
              : "Light⌄",
          appearance.triggerRef,
        )}
        <DropdownMenu
          anchor={appearance.anchor}
          label="Appearance"
          options={["Light", "Dark", "System"]}
          value={prefs.theme[0].toUpperCase() + prefs.theme.slice(1)}
          onClose={appearance.close}
          onChange={(value) => {
            prefs.setTheme(value.toLowerCase() as "light" | "dark" | "system");
          }}
        />
        <Divider />
        {item(
          "Currency",
          "Default currency for rent amounts",
          "Database",
          "orange",
          () => notify("AFN · whole afghanis. This ledger uses one currency."),
          "AFN",
        )}
      </Card>
      <Card style={{ paddingVertical: 6 }}>
        <T size={10} color={c.sub} weight="medium" style={{ paddingTop: 5 }}>
          NOTIFICATIONS
        </T>
        {item(
          "Rent Reminders",
          "Manage collection and backup reminders",
          "Bell",
          "green",
          () => go("reminders"),
          prefs.reminders ? "On" : "Off",
        )}
      </Card>
      <Card style={{ paddingVertical: 6 }}>
        <T size={10} color={c.sub} weight="medium" style={{ paddingTop: 5 }}>
          DATA & STORAGE
        </T>
        {item(
          "Backup & Restore",
          "Keep your data safe and restore anytime",
          "DatabaseBackup",
          "teal",
          () => go("backup-restore"),
        )}
        <Divider />
        {item(
          "Device Transfer",
          "Move your data to another device",
          "Smartphone",
          "purple",
          () => go("device-transfer"),
        )}
        <Divider />
        {item(
          "Data Management",
          "Property details, archived shops and history",
          "Trash2",
          "red",
          () => go("data-management"),
        )}
      </Card>
      <Card style={{ paddingVertical: 6 }}>
        <T size={10} color={c.sub} weight="medium" style={{ paddingTop: 5 }}>
          ABOUT
        </T>
        {item(
          "About GMM",
          "Offline rent and expense management",
          "Info",
          "blue",
          () =>
            notify(
              t("GMM v{{version}} · Your ledger is saved offline in SQLite.", {
                version: appConfig.expo.version,
              }),
            ),
          t("Version {{version}}", { version: appConfig.expo.version }),
        )}
      </Card>
    </Page>
  );
}

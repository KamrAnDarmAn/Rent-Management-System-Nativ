import { useState } from "react";
import { Button } from "../../components/buttons/Button";
import { Logo } from "../../components/branding/Logo";
import { CalendarChoice } from "../../components/forms/CalendarChoice";
import { Field } from "../../components/forms/Field";
import { Select } from "../../components/forms/Select";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { Info } from "../../components/feedback/Info";
import { T } from "../../components/typography/T";
import { useUI } from "../../components/theme/UIContext";
import { useLedger } from "../../store/ledgerStore";
import { usePreferences } from "../../store/preferencesStore";
export function SetupPropertyScreen() {
  const { c, notify } = useUI();
  const prefs = usePreferences();
  const [property, setProperty] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (saving) return;
    if (!property.trim()) return notify("Enter your property name.");
    setSaving(true);
    if (!(await useLedger.getState().completeSetup(property))) {
      setSaving(false);
      notify(useLedger.getState().error!);
    }
  };
  return (
    <Page
      title="GMM"
      subtitle="Initial Property Setup"
      footer={
        <Button
          title="Create Property"
          icon="CircleCheck"
          disabled={saving}
          onPress={save}
        />
      }
    >
      <Logo size={72} />
      <T size={24} weight="bold">
        Set Up Your First Property
      </T>
      <T color={c.sub}>
        Set your preferences, then add your shops. Everything is saved on this
        device.
      </T>
      <Card style={{ gap: 16 }}>
        <Field
          label="Property or Building Name"
          value={property}
          onChangeText={setProperty}
          placeholder="Enter your property name"
          required
          icon="Building2"
        />
        <Select
          label="Language"
          value={prefs.language === "ps" ? "پښتو" : "English"}
          options={["English", "پښتو"]}
          onChange={(v) => prefs.setLanguage(v === "پښتو" ? "ps" : "en")}
        />
        <CalendarChoice
          value={prefs.rentViewCalendar}
          onChange={prefs.setRentViewCalendar}
        />
        <Select
          label="Appearance"
          value={
            prefs.theme === "dark"
              ? "Dark"
              : prefs.theme === "light"
                ? "Light"
                : "System"
          }
          options={["Light", "Dark", "System"]}
          onChange={(v) =>
            prefs.setTheme(v.toLowerCase() as "light" | "dark" | "system")
          }
        />
        <Field label="Currency" value="AFN · Afghan Afghani" readOnly />
      </Card>
      <Info text="Each shop can use its own rent calendar. Shamsi rent is due on the first day of each month." />
      <Info
        title="Keep a safe copy"
        text="Create a backup regularly and save it outside this phone. Uninstalling GMM or losing your phone can remove local data."
        tone="orange"
      />
    </Page>
  );
}

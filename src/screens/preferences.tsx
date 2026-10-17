import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Badge,
  Button,
  Card,
  Divider,
  Field,
  Icon,
  IconTile,
  Info,
  Logo,
  Metric,
  Page,
  Progress,
  Row,
  Section,
  T,
  ToggleRow,
  money,
  useGo,
  useUI,
} from "../ui";
import { usePreferences } from "../store";
import { SummaryLine } from "./forms";
import { Chips } from "./main";

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
              Use Shop Rent Manager in the language you're most comfortable
              with.
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
                Shop Rent Manager
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
                <T weight="semibold" size={15} translate={false}>
                  {lang.name}
                </T>
                <T size={11} color={c.sub} translate={false}>
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

export function RemindersScreen() {
  const { c, notify } = useUI();
  const prefs = usePreferences();
  const go = useGo();
  const [overdue, setOverdue] = useState(true);
  const [received, setReceived] = useState(true);
  const [summary, setSummary] = useState(false);
  return (
    <Page title="Reminders" subtitle="Never miss a rent collection again">
      <Info
        title="Reminder preferences"
        text="This is the notification settings design. Rent notifications are deferred; no device notifications are scheduled in this preview."
        tone="green"
        icon="Bell"
      />
      <Card tone="red" onPress={() => go("collect")}>
        <Row>
          <IconTile name="CircleAlert" tone="red" size={32} />
          <View style={{ flex: 1 }}>
            <T weight="semibold" size={12}>
              Overdue Rent Reminder
            </T>
            <T size={10} color={c.sub}>
              You have 3 shops with overdue rent.
            </T>
          </View>
          <Badge label="View Shops" tone="red" small />
        </Row>
      </Card>
      <Card style={{ gap: 15 }}>
        <ToggleRow
          title="Rent Collection Reminder"
          subtitle="Get reminded before rent is due"
          value={prefs.reminders}
          onChange={prefs.setReminders}
          icon="CalendarDays"
        />
        <T size={11} color={c.sub}>
          Remind Me
        </T>
        <Row>
          {[1, 3, 5, 7, 10].map((day) => (
            <Pressable
              key={day}
              onPress={() => prefs.setReminderDay(day)}
              style={{
                flex: 1,
                paddingVertical: 12,
                backgroundColor:
                  prefs.reminderDay === day ? c.primary : c.muted,
                alignItems: "center",
                borderRadius: 8,
                gap: 3,
              }}
            >
              <T
                size={16}
                weight="bold"
                color={prefs.reminderDay === day ? "#fff" : c.text}
              >
                {day}
              </T>
              <T size={9} color={prefs.reminderDay === day ? "#fff" : c.sub}>
                {day === 1 ? "Day" : "Days"}
              </T>
            </Pressable>
          ))}
        </Row>
        <Row>
          <Card tone="teal" style={{ flex: 1 }}>
            <T size={11} weight="semibold">
              Reminder Preview
            </T>
            <T size={9} color={c.sub}>
              You will be notified {prefs.reminderDay} days before rent is due.
            </T>
          </Card>
          <Card tone="blue" style={{ flex: 1 }}>
            <T size={11} weight="semibold">
              Example Notification
            </T>
            <T size={9} color={c.sub}>
              Rent due in {prefs.reminderDay} days
            </T>
          </Card>
        </Row>
      </Card>
      <Card>
        <Section title="Other Reminders">
          <T size={10} color={c.sub}>
            Choose what else you want to be notified about.
          </T>
          <ToggleRow
            title="Overdue Rent Alerts"
            subtitle="Get notified when a shop's rent is overdue"
            value={overdue}
            onChange={setOverdue}
            icon="BellRing"
            tone="green"
          />
          <ToggleRow
            title="Payment Received"
            subtitle="Get notified when a payment is recorded"
            value={received}
            onChange={setReceived}
            icon="CreditCard"
            tone="blue"
          />
          <ToggleRow
            title="Monthly Summary"
            subtitle="Get a monthly summary of collections"
            value={summary}
            onChange={setSummary}
            icon="CalendarDays"
            tone="orange"
          />
        </Section>
      </Card>
      <Info
        title="Offline & Private"
        text="Backup reminders can appear inside the app. Preferences here do not request notification permission or schedule reminders yet."
        icon="Smartphone"
      />
    </Page>
  );
}

export function BackupScreen() {
  const { c, notify } = useUI();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const unavailable = () =>
    notify(
      "Encrypted backup is not connected yet. This visual preview cannot create or restore a real backup.",
    );
  return (
    <Page title="Backup & Restore" subtitle="Keep your data safe and secure">
      <Card tone="teal">
        <Row style={{ alignItems: "flex-start" }}>
          <IconTile name="ShieldCheck" tone="green" size={53} />
          <View style={{ flex: 1, gap: 6 }}>
            <T size={16} weight="bold">
              Your Data Stays on Your Device
            </T>
            <T size={11} color={c.sub}>
              All your shops, tenants, payments and settings stay on your
              device. No automatic cloud sync. Create a backup to keep a safe
              copy.
            </T>
          </View>
        </Row>
      </Card>
      <Card>
        <Row>
          <IconTile name="CircleCheck" tone="green" size={35} />
          <View style={{ flex: 1 }}>
            <T size={13} weight="semibold">
              Last Successful Backup
            </T>
            <T size={14} weight="bold">
              No backup created yet
            </T>
            <T size={10} color={c.sub}>
              Visual preview · sample ledger
            </T>
          </View>
          <Badge label="Not connected" tone="muted" small />
        </Row>
      </Card>
      <Button
        title="Create Encrypted Backup"
        icon="DatabaseBackup"
        onPress={() => setShowPassword(!showPassword)}
        style={{ minHeight: 80 }}
      />
      {showPassword && (
        <Card style={{ gap: 10 }}>
          <Field
            label="Backup Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Choose a strong backup password"
          />
          <Info
            text="Keep your password safely. Password encryption will be implemented with the backup service."
            tone="orange"
          />
          <Button
            title="Create Backup"
            icon="LockKeyhole"
            onPress={unavailable}
          />
        </Card>
      )}
      <Row>
        <Card tone="blue" onPress={unavailable} style={{ flex: 1 }}>
          <Row>
            <IconTile name="Upload" tone="blue" size={35} />
            <View style={{ flex: 1 }}>
              <T weight="semibold" size={12}>
                Export Backup
              </T>
              <T size={10} color={c.sub}>
                Save and share an encrypted backup file.
              </T>
            </View>
          </Row>
        </Card>
        <Card tone="purple" onPress={unavailable} style={{ flex: 1 }}>
          <Row>
            <IconTile name="Download" tone="purple" size={35} />
            <View style={{ flex: 1 }}>
              <T weight="semibold" size={12}>
                Import Backup
              </T>
              <T size={10} color={c.sub}>
                Restore compatible ledger history.
              </T>
            </View>
          </Row>
        </Card>
      </Row>
      <Card>
        <Row>
          <IconTile name="FileUp" tone="blue" size={35} />
          <View style={{ flex: 1 }}>
            <T weight="semibold" size={12}>
              Select Backup File
            </T>
            <T size={10} color={c.sub}>
              Choose a backup from device storage.
            </T>
          </View>
          <Button
            title="Choose File"
            icon="Folder"
            onPress={unavailable}
            variant="outline"
            compact
          />
        </Row>
      </Card>
      <Info
        title="Backup Security"
        text="Your backup will be password-encrypted. Keep an off-device copy and retain the password; losing both phones and the backup would lose the ledger."
        tone="orange"
        icon="LockKeyhole"
      />
      <Card>
        <Row>
          <IconTile name="Database" tone="green" size={35} />
          <View style={{ flex: 1 }}>
            <T size={12} weight="semibold">
              Backup Validation
            </T>
            <T size={10} color={c.sub}>
              Select a file before validating its contents.
            </T>
          </View>
          <Badge label="No file selected" tone="muted" small />
        </Row>
        <Divider />
        <Row>
          <Metric label="File Name" value="—" tone="muted" />
          <Metric label="File Size" value="—" tone="muted" />
          <Metric label="Records" value="—" tone="muted" />
          <Metric label="Shops" value="—" tone="muted" />
        </Row>
      </Card>
      <Card tone="red">
        <Row>
          <IconTile name="CircleAlert" tone="red" size={35} />
          <View style={{ flex: 1 }}>
            <T size={12} weight="semibold">
              Restore Confirmation
            </T>
            <T size={10} color={c.sub}>
              Validate and preview changes before importing. Conflicts block the
              whole import.
            </T>
          </View>
          <Button
            title="Restore Data"
            onPress={unavailable}
            variant="danger"
            compact
          />
        </Row>
      </Card>
      <Info
        title="Recovery Status"
        text="No restore in progress. Production backup and recovery are not connected in this UI build."
        icon="RefreshCw"
      />
    </Page>
  );
}

export function DeviceTransferScreen() {
  const { c, notify } = useUI();
  const [type, setType] = useState("Send Data");
  const [mode, setMode] = useState("Merge Compatible Data");
  const [selected, setSelected] = useState("iPhone 14 Pro");
  return (
    <Page
      title="Device Transfer"
      subtitle="Move or merge your shop data offline"
      help
      footer={
        <Button
          title="Start Transfer"
          icon="ArrowLeftRight"
          onPress={() =>
            notify(
              "Local-network transfer is not connected. These are sample devices; no data was sent.",
            )
          }
        />
      }
    >
      <Info
        title="100% Offline & Secure"
        text="The planned transfer uses the same Wi-Fi or hotspot. This screen is a preview, not live device discovery."
        icon="ShieldCheck"
        tone="teal"
      />
      <Section title="1. Choose Transfer Type">
        <Row>
          {[
            { label: "Send Data", icon: "Smartphone" },
            { label: "Receive Data", icon: "Download" },
          ].map((t) => (
            <Card
              key={t.label}
              tone={type === t.label ? "teal" : undefined}
              onPress={() => setType(t.label)}
              style={{
                flex: 1,
                alignItems: "center",
                gap: 8,
                paddingVertical: 16,
                borderColor: type === t.label ? c.primary : c.border,
              }}
            >
              <Icon name={t.icon as "Smartphone"} size={35} />
              <T size={15} weight="bold">
                {t.label}
              </T>
              <T size={10} color={c.sub} style={{ textAlign: "center" }}>
                {t.label === "Send Data"
                  ? "Share your shop data from this device"
                  : "Get shop data on this device"}
              </T>
            </Card>
          ))}
        </Row>
        <Chips
          options={["Merge Compatible Data", "Replace All Local Data"]}
          selected={mode}
          onSelect={setMode}
        />
      </Section>
      <Section
        title="2. Find Nearby Device"
        action="Refresh"
        onPress={() =>
          notify(
            "Device discovery is not connected; showing reference sample devices.",
          )
        }
      >
        <View style={{ gap: 7 }}>
          {[
            {
              name: "iPhone 14 Pro",
              person: "Ahmad's iPhone",
              last: "Just now",
            },
            { name: "iPhone 13", person: "Bilal's iPhone", last: "2 mins ago" },
            { name: "iPad Air", person: "Karim's iPad", last: "5 mins ago" },
          ].map((device) => (
            <Card
              key={device.name}
              tone={selected === device.name ? "teal" : undefined}
            >
              <Row>
                <IconTile
                  name="Smartphone"
                  tone={selected === device.name ? "teal" : "muted"}
                  size={37}
                />
                <View style={{ flex: 1 }}>
                  <T size={14} weight="semibold">
                    {device.name}
                  </T>
                  <T size={11} color={c.sub}>
                    {device.person}
                  </T>
                  <T size={9} color={c.sub}>
                    Sample device · {device.last}
                  </T>
                </View>
                <Icon name="Signal" color={c.green} size={19} />
                <Button
                  title={selected === device.name ? "Selected" : "Pair"}
                  onPress={() => setSelected(device.name)}
                  variant={selected === device.name ? "primary" : "outline"}
                  compact
                />
              </Row>
            </Card>
          ))}
        </View>
      </Section>
      <Card>
        <Section title="3. Pair and Confirm">
          <Row>
            <Card tone="teal" style={{ flex: 1 }}>
              <Row>
                <Icon name="Smartphone" size={28} />
                <View style={{ flex: 1 }}>
                  <T size={12} weight="semibold">
                    This Device
                  </T>
                  <T size={9} color={c.sub}>
                    Shop Rent Manager
                  </T>
                </View>
              </Row>
            </Card>
            <Icon name="ArrowLeftRight" size={24} />
            <Card tone="blue" style={{ flex: 1 }}>
              <T size={12} weight="semibold">
                Remote Device
              </T>
              <T size={10} color={c.sub}>
                {selected}
              </T>
            </Card>
          </Row>
          <Badge label="Preview · not paired" tone="muted" small />
        </Section>
      </Card>
      <Card>
        <Section title="4. Transfer Progress">
          <Row>
            <IconTile name="Files" />
            <View style={{ flex: 1 }}>
              <T size={12} weight="semibold">
                Ready to send
              </T>
              <T size={10} color={c.sub}>
                Transport not connected
              </T>
              <Row style={{ marginTop: 7 }}>
                <Progress value={0} />
                <T color={c.primary} weight="bold">
                  0%
                </T>
              </Row>
            </View>
          </Row>
        </Section>
      </Card>
      <Card>
        <Section title="5. Incoming Data Preview">
          <Row>
            <Metric label="Shops" value="12" tone="green" />
            <Metric label="Tenants" value="28" tone="blue" />
            <Metric label="Payments" value="156" tone="orange" />
            <Metric label="Expenses" value="18" tone="purple" />
          </Row>
          <Info
            title="Sample preview only"
            text="Actual packages will be validated for overspent credit, duplicate charges, reversals, and closed-month conflicts before any import."
            tone="orange"
            icon="TriangleAlert"
          />
        </Section>
      </Card>
    </Page>
  );
}

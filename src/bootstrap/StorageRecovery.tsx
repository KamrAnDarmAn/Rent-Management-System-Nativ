import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Button } from "../components/buttons/Button";
import { Field } from "../components/forms/Field";
import { Check } from "../components/forms/Check";
import { Info } from "../components/feedback/Info";
import { Card } from "../components/layout/Card";
import { T } from "../components/typography/T";
import { decodeBackup, type BackupPayload } from "../domain/backup";
import { pickBackupFile } from "../storage/backupFiles";
import { recoverDatabase } from "../storage/database";
import { usePreferences } from "../store/preferencesStore";
import type { LedgerData } from "../types/ledger";

export function StorageRecovery({
  retry,
  onRestored,
}: {
  retry: () => void;
  onRestored: (data: LedgerData) => void;
}) {
  const [password, setPassword] = useState("");
  const [preview, setPreview] = useState<BackupPayload>();
  const [file, setFile] = useState<{ name: string; contents: string }>();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await task();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not complete this action. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <ScrollView
      style={{ width: "100%", maxHeight: 550 }}
      contentContainerStyle={{ padding: 20, gap: 12 }}
    >
      <T>
        Your data could not be opened. It has not been deleted. Try again or
        restore a backup after checking device storage.
      </T>
      <Button title="Try Again" disabled={busy} onPress={retry} />
      <Card style={{ gap: 12 }}>
        <T weight="bold">Restore Backup</T>
        <Field
          label="Backup Password (Optional)"
          secure
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            setPreview(undefined);
            setConfirm(false);
          }}
        />
        <Button
          title="Choose File"
          disabled={busy}
          variant="outline"
          onPress={() =>
            run(async () => {
              const selected = await pickBackupFile();
              if (!selected) return;
              setFile(selected);
              setPreview(undefined);
              setConfirm(false);
              setPreview(await decodeBackup(selected.contents, password));
            })
          }
        />
        {file && (
          <Button
            title="Validate Backup"
            disabled={busy}
            variant="secondary"
            onPress={() =>
              run(async () => {
                setPreview(undefined);
                setConfirm(false);
                setPreview(await decodeBackup(file.contents, password));
              })
            }
          />
        )}
        {preview && (
          <View style={{ gap: 12 }}>
            <T weight="bold">Backup validated</T>
            <T>{preview.data.propertyName}</T>
            <Info
              text="The existing database will be kept. This backup will be saved in a new database on this device."
              tone="orange"
            />
            <Check
              checked={confirm}
              label="Use this backup as the current ledger"
              onPress={() => setConfirm(!confirm)}
            />
            <T>Use this backup as the current ledger</T>
            <Button
              title="Restore Data"
              disabled={busy || !confirm}
              onPress={() =>
                run(async () => {
                  const data = await recoverDatabase(preview.data);
                  usePreferences.setState({
                    ...preview.preferences,
                    reminders: false,
                  });
                  onRestored(data);
                })
              }
            />
          </View>
        )}
      </Card>
      {!!error && <Info text={error} tone="red" />}
    </ScrollView>
  );
}

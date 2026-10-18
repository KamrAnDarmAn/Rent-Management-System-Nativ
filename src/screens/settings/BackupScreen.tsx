import { formatSavedAt } from "../../utils/savedAt";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { getRandomBytes } from "expo-crypto";
import { Button } from "../../components/buttons/Button";
import { Info } from "../../components/feedback/Info";
import { Check } from "../../components/forms/Check";
import { Field } from "../../components/forms/Field";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { Row } from "../../components/layout/Row";
import { T } from "../../components/typography/T";
import { useUI } from "../../components/theme/UIContext";
import {
  backupPayload,
  decodeBackup,
  encodeBackup,
  type BackupPayload,
} from "../../domain/backup";
import { useLedger, ledgerData, whenLedgerIdle } from "../../store/ledgerStore";
import { usePreferences } from "../../store/preferencesStore";
import { ledgerPersistence } from "../../storage/connection";
import { pickBackupFile, saveBackupFile } from "../../storage/backupFiles";

export function BackupScreen() {
  const { c, notify, language } = useUI();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const active = useRef(false);
  const [file, setFile] = useState<{ name: string; contents: string } | null>(
    null,
  );
  const [validated, setValidated] = useState<BackupPayload | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [lastBackup, setLastBackup] = useState(
    usePreferences.getState().lastBackupAt,
  );
  const [recoveries, setRecoveries] = useState<
    { id: number; createdAt: string; action: string }[]
  >([]);
  useEffect(() => {
    let active = true;
    ledgerPersistence()
      .recoveries()
      .then((rows) => {
        if (active) setRecoveries(rows);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  const setup = useLedger((s) => s.setupComplete);
  const run = async (task: () => Promise<void>) => {
    if (active.current) return;
    active.current = true;
    setBusy(true);
    setError("");
    try {
      await task();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not complete the backup operation. Please try again.",
      );
    } finally {
      active.current = false;
      setBusy(false);
    }
  };
  const validate = async (selected = file) => {
    if (!selected) return;
    setValidated(null);
    setConfirmed(false);
    setValidated(await decodeBackup(selected.contents, password));
  };
  return (
    <Page title="Backup & Restore" subtitle="Keep your data safe and secure">
      <Info
        title="Your Data Stays on Your Device"
        text="Create a backup regularly and save it outside this phone. Uninstalling GMM or losing your phone can remove local data."
      />
      <Card style={{ gap: 10 }}>
        <T weight="bold">Last Created Backup</T>
        <T color={c.sub}>
          {lastBackup
            ? formatSavedAt(lastBackup, language)
            : "No backup created yet"}
        </T>
        <Field
          label="Backup Password (Optional)"
          value={password}
          secure
          onChangeText={(v) => {
            setPassword(v);
            setValidated(null);
            setConfirmed(false);
          }}
          helper="Use at least 10 characters for encryption. Leave empty for a readable JSON backup."
        />
        <Button
          title="Create Backup"
          icon="DatabaseBackup"
          disabled={busy || !setup}
          onPress={() =>
            void run(async () => {
              await whenLedgerIdle();
              const payload = backupPayload(
                ledgerData(useLedger.getState()),
                usePreferences.getState(),
              );
              const contents = await encodeBackup(
                payload,
                password,
                getRandomBytes,
              );
              await saveBackupFile(
                contents,
                `GMM-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
              );
              const now = new Date().toISOString();
              usePreferences.setState({ lastBackupAt: now });
              setLastBackup(now);
              notify("Backup created. Keep a copy outside this phone.");
            })
          }
        />
      </Card>
      <Card style={{ gap: 12 }}>
        <T weight="bold">Import Backup</T>
        <Button
          title="Choose File"
          icon="Folder"
          variant="outline"
          disabled={busy}
          onPress={() =>
            void run(async () => {
              const chosen = await pickBackupFile();
              if (!chosen) return;
              setFile(chosen);
              setValidated(null);
              setConfirmed(false);
              await validate(chosen);
            })
          }
        />
        {file && (
          <>
            <T>{file.name}</T>
            <Button
              title="Validate Backup"
              variant="secondary"
              disabled={busy}
              onPress={() => void run(() => validate())}
            />
          </>
        )}
        {validated && (
          <View style={{ gap: 10 }} testID="backup-preview">
            <T weight="semibold">Backup validated</T>
            <T>{validated.data.propertyName}</T>
            <T color={c.sub}>{formatSavedAt(validated.createdAt, language)}</T>
            <T>
              Shops:{" "}
              {validated.data.shops.length +
                validated.data.archivedShops.length}
            </T>
            <T>
              Payments:{" "}
              {[
                ...validated.data.shops,
                ...validated.data.archivedShops,
              ].reduce((n, s) => n + (s.rentReceipts?.length ?? 0), 0)}
            </T>
            <T>Expenses: {validated.data.expenses.length}</T>
            <Info
              text="Restoring replaces the current ledger. A recovery copy of the current data is kept on this device."
              tone="orange"
            />
            <Row>
              <Check
                checked={confirmed}
                label="Replace current data with this backup"
                onPress={() => setConfirmed(!confirmed)}
              />
              <T style={{ flex: 1 }}>Replace current data with this backup</T>
            </Row>
            <Button
              title="Restore Data"
              variant="danger"
              disabled={busy || !confirmed}
              onPress={() =>
                void run(async () => {
                  if (!(await useLedger.getState().restoreData(validated.data)))
                    throw new Error(useLedger.getState().error!);
                  // Permission to schedule notifications belongs to the new device.
                  usePreferences.setState({
                    ...validated.preferences,
                    reminders: false,
                  });

                  setValidated(null);
                  setFile(null);
                  setConfirmed(false);
                  setRecoveries(await ledgerPersistence().recoveries());
                  notify("Backup restored successfully.");
                })
              }
            />
          </View>
        )}
      </Card>
      {busy && <ActivityIndicator color={c.primary} />}
      {!!error && (
        <Info title="Backup could not be completed" text={error} tone="red" />
      )}
      <Info
        title="Backup Security"
        text="Password backups use AES-256-GCM encryption. Keep the password safely; it cannot be recovered. Unencrypted backups contain private financial records."
        tone="orange"
      />
      {recoveries.length > 0 && (
        <Card style={{ gap: 10 }}>
          <T weight="bold">On-device Recovery Copies</T>
          <T size={11} color={c.sub}>
            Recent changes can be recovered here. These copies are lost if the
            app is uninstalled.
          </T>
          {recoveries.slice(0, 5).map((r) => (
            <Button
              key={r.id}
              title={formatSavedAt(r.createdAt, language)}
              variant="outline"
              disabled={busy}
              onPress={() =>
                run(async () => {
                  setFile(null);
                  setError("");
                  setConfirmed(false);
                  try {
                    setValidated(
                      backupPayload(
                        await ledgerPersistence().recovery(r.id),
                        usePreferences.getState(),
                      ),
                    );
                  } catch {
                    setError("Recovery copy not found.");
                  }
                })
              }
            />
          ))}
        </Card>
      )}
    </Page>
  );
}

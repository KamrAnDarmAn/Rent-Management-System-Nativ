import { Button } from "../../components/buttons/Button";
import { Info } from "../../components/feedback/Info";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { T } from "../../components/typography/T";
import { useGo } from "../../hooks/useGo";

export function DeviceTransferScreen() {
  const go = useGo();
  return (
    <Page title="Device Transfer" subtitle="Move your data to another device">
      <Info
        title="Transfer with a backup"
        text="Create a backup on this phone. Copy the file to your new phone using a cable, Bluetooth, or a sharing app. Open GMM on the new phone and choose Restore Backup."
      />
      <Card style={{ gap: 12 }}>
        <T>
          Keep the original phone and backup until you have checked the shops,
          payments and balances on the new phone.
        </T>
        <Button
          title="Backup & Restore"
          icon="DatabaseBackup"
          onPress={() => go("backup-restore")}
        />
      </Card>
    </Page>
  );
}

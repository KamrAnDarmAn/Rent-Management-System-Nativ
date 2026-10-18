import { formatSavedAt } from "../../utils/savedAt";
import { useState } from "react";
import { Button } from "../../components/buttons/Button";
import { Field } from "../../components/forms/Field";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { T } from "../../components/typography/T";
import { useUI } from "../../components/theme/UIContext";
import { useGo } from "../../hooks/useGo";
import { useLedger } from "../../store/ledgerStore";
export function DataManagementScreen() {
  const state = useLedger(),
    { notify, language } = useUI(),
    go = useGo();
  const [name, setName] = useState(state.propertyName);
  return (
    <Page title="Data Management">
      <Card style={{ gap: 12 }}>
        <Field
          label="Property or Building Name"
          value={name}
          onChangeText={setName}
        />
        <Button
          title="Save Changes"
          onPress={async () => {
            if (!name.trim()) return notify("Enter your property name.");
            if (!(await state.setPropertyName(name.trim())))
              return notify(useLedger.getState().error!);
            notify("Property name updated.");
          }}
        />
      </Card>
      <T weight="bold">Archived Shops</T>
      {!state.archivedShops.length && (
        <Card>
          <T>No archived shops.</T>
        </Card>
      )}
      {state.archivedShops.map((s) => (
        <Card key={s.id} style={{ gap: 10 }}>
          <T weight="bold">
            {s.number} · {s.name}
          </T>
          <T>{s.keeper}</T>
          <Button
            title="View History"
            variant="outline"
            onPress={() => go("shop-financial-report", s.id)}
          />
          <Button
            title="Restore Shop"
            variant="secondary"
            onPress={async () => {
              if (!(await state.restoreShop(s.id)))
                return notify(useLedger.getState().error!);
              notify("Shop restored.");
            }}
          />
        </Card>
      ))}
      <Card style={{ gap: 8 }}>
        <T weight="bold">Recent Changes</T>
        {state.audit
          .slice(-30)
          .reverse()
          .map((a) => (
            <T key={a.id} size={11}>
              {formatSavedAt(a.date, language)} · {a.action}
            </T>
          ))}
      </Card>
      <Button
        title="Backup & Restore"
        icon="DatabaseBackup"
        variant="outline"
        onPress={() => go("backup-restore")}
      />
    </Page>
  );
}

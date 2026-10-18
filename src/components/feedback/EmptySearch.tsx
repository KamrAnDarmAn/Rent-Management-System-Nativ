import { IconTile } from "../icons/IconTile";
import { Card } from "../layout/Card";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export function EmptySearch() {
  const { c } = useUI();
  return (
    <Card style={{ alignItems: "center", gap: 7, padding: 24 }}>
      <IconTile name="Search" size={46} />
      <T weight="semibold">No matching shops</T>
      <T color={c.sub} size={11}>
        Try another name or clear your filters.
      </T>
    </Card>
  );
}

import { Field } from "../../../components/forms/Field";
import { FormSection } from "../../../components/forms/FormSection";
import type { useShopForm } from "../hooks/useShopForm";

export function ShopNotesFields({
  form,
}: {
  form: ReturnType<typeof useShopForm>;
}) {
  const { field } = form;
  return (
    <FormSection
      title="Additional Notes"
      subtitle="Keep extra information for future reference"
      icon="StickyNote"
      tone="orange"
    >
      <Field
        label="Notes (Optional)"
        {...field("notes")}
        placeholder="e.g. Shop renovation pending, special agreement…"
        icon="FileText"
        multiline
        helper="Any additional notes about this shop"
      />
    </FormSection>
  );
}

import { Field } from "../../../components/forms/Field";
import { FormSection } from "../../../components/forms/FormSection";
import type { useShopForm } from "../hooks/useShopForm";

export function ShopFinancialFields({
  form,
}: {
  form: ReturnType<typeof useShopForm>;
}) {
  const { editing, field } = form;
  return (
    <FormSection
      title="Financial Details"
      subtitle="Additional financial information (optional)"
      icon="FileText"
      tone="purple"
    >
      <Field
        label={
          editing
            ? "Available Construction Credit (AFN)"
            : "Initial Construction Credit (AFN)"
        }
        {...field("credit")}
        placeholder="e.g. 50,000"
        numeric
        icon="Hammer"
        helper={
          editing
            ? "Update the available construction credit for this shop."
            : "Construction paid by the shopkeeper creates credit against rent."
        }
      />
    </FormSection>
  );
}

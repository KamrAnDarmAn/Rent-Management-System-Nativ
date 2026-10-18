import { Field } from "../../../components/forms/Field";
import { FormSection } from "../../../components/forms/FormSection";
import { Row } from "../../../components/layout/Row";
import type { useShopForm } from "../hooks/useShopForm";

export function ShopDetailsFields({
  form,
}: {
  form: ReturnType<typeof useShopForm>;
}) {
  const { field } = form;
  return (
    <FormSection
      title="Shop Details"
      subtitle="Basic information about the shop"
      icon="Store"
    >
      <Row style={{ alignItems: "flex-start" }}>
        <Field
          label="Shop Number"
          {...field("number")}
          placeholder="e.g. Shop 07"
          required
          icon="Store"
          helper="Unique identifier for this shop"
        />
        <Field
          label="Shop Name"
          {...field("name")}
          placeholder="e.g. Ahmad Electronics"
          required
          icon="Store"
          helper="Display name for the shop"
        />
      </Row>
      <Row style={{ alignItems: "flex-start" }}>
        <Field
          label="Shopkeeper Name"
          {...field("keeper")}
          placeholder="e.g. Ahmad Khan"
          required
          icon="UserRound"
          helper="Full name of the shopkeeper"
        />
        <Field
          label="Phone Number"
          {...field("phone")}
          placeholder="070 1234567"
          required
          icon="Phone"
          helper="Valid mobile number for contact"
        />
      </Row>
      <Field
        label="Address"
        {...field("address")}
        placeholder="e.g. Ground Floor, Al Hafez Plaza, Main Road"
        icon="MapPin"
        multiline
        helper="Complete address or location details of the shop"
      />
    </FormSection>
  );
}

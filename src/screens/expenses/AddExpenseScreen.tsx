import { useDismissSavedForm } from "../../hooks/useDismissSavedForm";
import { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { Button } from "../../components/buttons/Button";
import { Chips } from "../../components/filters/Chips";
import { CalendarDateField } from "../../components/forms/CalendarDateField";
import { Field } from "../../components/forms/Field";
import { Select } from "../../components/forms/Select";
import { Icon, type IconName } from "../../components/icons/Icon";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { Row } from "../../components/layout/Row";
import { Section } from "../../components/layout/Section";
import { useUI } from "../../components/theme/UIContext";
import { T } from "../../components/typography/T";
import { validDate } from "../../domain/rent";
import { useToday } from "../../hooks/useToday";
import { useLedger } from "../../store/ledgerStore";
import { usePreferences } from "../../store/preferencesStore";
import type { Expense } from "../../types/expense";
import { validAmount } from "../../utils/validation";
export function AddExpenseScreen() {
  const { c, notify, rtl } = useUI();
  const dismissSavedForm = useDismissSavedForm();
  const saving = useRef(false);
  const viewCalendar = usePreferences((s) => s.rentViewCalendar);
  const add = useLedger((s) => s.addExpense);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Repairs");
  const [description, setDescription] = useState("");
  const today = useToday();
  const [date, setDate] = useState(today);
  const [type, setType] =
    useState<NonNullable<Expense["type"]>>("Property Expense");
  const [method, setMethod] = useState<NonNullable<Expense["method"]>>("Cash");
  const [shop, setShop] = useState("No Shop");
  const shops = useLedger((s) => s.shops);
  const linkedShop = shops.find((record) =>
    shop.startsWith(`Shop ${record.number} ·`),
  );
  const [notes, setNotes] = useState("");
  const categories: {
    label: string;
    icon: IconName;
  }[] = [
    { label: "Supplies", icon: "ShoppingCart" },
    { label: "Utilities", icon: "Zap" },
    { label: "Repairs", icon: "Wrench" },
    { label: "Maintenance", icon: "Settings2" },
    { label: "Construction", icon: "Building2" },
    { label: "Other", icon: "Ellipsis" },
  ];
  return (
    <Page
      title="Add Expense"
      subtitle="Record a new expense for your business"
      help
      footer={
        <Button
          title="Save Expense"
          icon="CircleCheck"
          onPress={async () => {
            if (saving.current) return;
            const n = validAmount(amount);
            if (!validDate(date))
              return notify("Enter a valid date in the selected calendar.");
            if (!n || !description.trim())
              return notify(
                "Enter a positive whole-AFN amount and description.",
              );
            saving.current = true;
            const saved = await add({
              amount: n,
              description: description.trim(),
              category,
              date,
              type,
              method,
              shopId: type === "Property Expense" ? linkedShop?.id : undefined,
              notes: notes.trim(),
            });
            if (!saved) {
              saving.current = false;
              return notify(useLedger.getState().error!);
            }
            notify("Expense saved.");
            dismissSavedForm();
          }}
        />
      }
    >
      <Field
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        numeric
        icon="Wallet"
        suffix="AFN"
      />
      <Section title="Category">
        <View
          style={{
            flexDirection: rtl ? "row-reverse" : "row",
            flexWrap: "wrap",
            gap: 7,
          }}
        >
          {categories.map((cat) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: category === cat.label }}
              key={cat.label}
              onPress={() => setCategory(cat.label)}
              style={{ width: "30%", flexGrow: 1 }}
            >
              <Card
                tone={category === cat.label ? "teal" : "muted"}
                style={{
                  paddingVertical: 11,
                  paddingHorizontal: 6,
                  alignItems: "center",
                  gap: 5,
                  borderColor: category === cat.label ? c.primary : c.border,
                }}
              >
                <Icon
                  name={cat.icon}
                  size={22}
                  color={category === cat.label ? c.primary : c.sub}
                />
                <T size={9} style={{ textAlign: "center" }}>
                  {cat.label}
                </T>
              </Card>
            </Pressable>
          ))}
        </View>
      </Section>
      <Field
        label="Description"
        value={description}
        onChangeText={setDescription}
        icon="FileText"
      />
      <CalendarDateField
        label="Date"
        value={date}
        onChangeText={setDate}
        calendar={linkedShop?.rentCalendar ?? viewCalendar}
        icon="CalendarDays"
      />
      <T size={12} weight="semibold">
        Expense Type
      </T>
      <Row style={{ alignItems: "stretch" }}>
        {(["Personal Expense", "Property Expense"] as const).map((v) => (
          <Card
            key={v}
            tone={type === v ? "teal" : "muted"}
            onPress={() => setType(v)}
            style={{ flex: 1, borderColor: type === v ? c.primary : c.border }}
          >
            <Row>
              <Icon name={v === "Personal Expense" ? "UserRound" : "House"} />
              <View style={{ flex: 1 }}>
                <T size={10} weight="semibold">
                  {v}
                </T>
                <T size={8} color={c.sub}>
                  {v === "Personal Expense"
                    ? "Not related to shops"
                    : "Related to shops/property"}
                </T>
              </View>
            </Row>
          </Card>
        ))}
      </Row>
      <Select
        label="Select Shop (Optional)"
        value={shop}
        options={[
          ...shops.map((record) => `Shop ${record.number} · ${record.keeper}`),
          "All Shops",
          "No Shop",
        ]}
        onChange={setShop}
      />
      <T size={11} weight="semibold">
        Payment Method
      </T>
      <Chips
        options={["Cash", "Bank Transfer", "Credit", "Other"]}
        selected={method}
        onSelect={(value) => setMethod(value as NonNullable<Expense["method"]>)}
      />
      <Field
        label="Notes (Optional)"
        value={notes}
        onChangeText={setNotes}
        placeholder="Add any additional details about this expense…"
        multiline
        icon="StickyNote"
      />
    </Page>
  );
}

import React, { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Badge,
  Button,
  Card,
  Check,
  Divider,
  Field,
  Icon,
  IconName,
  IconTile,
  Info,
  Metric,
  Page,
  Progress,
  Row,
  Section,
  Select,
  T,
  ToggleRow,
  money,
  number,
  useGo,
  useUI,
} from "../ui";
import { shopImages } from "../data";
import { usePreviewLedger } from "../store";
import { Shop } from "../types";
import { Chips, MonthPicker } from "./main";

export function useShop(id = 1) {
  return usePreviewLedger(
    (s) => s.shops.find((shop) => shop.id === id) ?? s.shops[0],
  );
}
export function ShopIdentity({
  shop,
  onPress,
}: {
  shop: Shop;
  onPress?: () => void;
}) {
  const { c } = useUI();
  const go = useGo();
  return (
    <Card onPress={onPress ?? (() => go("shopkeeper", shop.id))}>
      <Row>
        <Image
          source={shopImages[shop.image % shopImages.length]}
          style={{ width: 52, height: 49, borderRadius: 7 }}
        />
        <View style={{ flex: 1 }}>
          <T
            weight="bold"
            size={14}
          >{`Shop #${String(shop.id).padStart(2, "0")}`}</T>
          <T size={11} color={c.sub}>
            {shop.keeper}
          </T>
          <T size={10} color={c.sub}>
            {shop.phone}
          </T>
        </View>
        <Badge label="Active" tone="green" small />
        <Icon name="ChevronRight" size={17} color={c.sub} />
      </Row>
    </Card>
  );
}
function validAmount(value: string) {
  const n = Number(value.replace(/,/g, ""));
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}
export function FormSection({
  title,
  subtitle,
  icon,
  tone = "teal",
  children,
}: {
  title: string;
  subtitle: string;
  icon: IconName;
  tone?: "teal" | "green" | "purple" | "orange";
  children: React.ReactNode;
}) {
  const { c } = useUI();
  return (
    <Card style={{ gap: 10, padding: 10 }}>
      <Row>
        <IconTile name={icon} tone={tone} size={30} />
        <View style={{ flex: 1 }}>
          <T weight="bold" size={14}>
            {title}
          </T>
          <T size={10} color={c.sub}>
            {subtitle}
          </T>
        </View>
      </Row>
      {children}
    </Card>
  );
}

export function SetupPropertyScreen() {
  const { c, notify } = useUI();
  const go = useGo();
  const ledger = usePreviewLedger();
  const [property, setProperty] = useState("Al Hafez Plaza");
  const [shopNumber, setShopNumber] = useState("Shop 07");
  const [rent, setRent] = useState("15000");
  const [date, setDate] = useState("2026-03-01");
  const [keeper, setKeeper] = useState("Ahmad Khan");
  const [phone, setPhone] = useState("0701 234567");
  const [dueDay, setDueDay] = useState("5");
  const save = () => {
    const amount = validAmount(rent);
    const id = Number(shopNumber.replace(/\D/g, ""));
    if (!property.trim() || !amount || !id || !keeper.trim() || !phone.trim())
      return notify(
        "Enter a property, shop number, positive rent, and shopkeeper details.",
      );
    if (ledger.shops.some((s) => s.id === id))
      return notify(
        "That shop number already exists in the preview. Choose another number.",
      );
    ledger.setPropertyName(property.trim());
    ledger.addShop({
      id,
      name: shopNumber,
      keeper,
      phone,
      rent: amount,
      paid: 0,
      credit: 0,
      status: "Unpaid",
      occupied: true,
      image: (id - 1) % 6,
    });
    notify("Property and shop added to the preview ledger.");
    go("collect");
  };
  return (
    <Page
      title="Shop Rent Manager"
      subtitle="Initial Property Setup"
      trailing={<Badge label="Step 3 of 4" tone="teal" small />}
      footer={
        <Button
          title="Create Property & Add Shop"
          icon="ArrowRight"
          onPress={save}
        />
      }
    >
      <Row style={{ justifyContent: "space-between", paddingVertical: 12 }}>
        {["Welcome", "Preferences", "Property Setup", "Complete"].map(
          (label, i) => (
            <View key={label} style={{ flex: 1, alignItems: "center", gap: 5 }}>
              <IconTile
                name={i < 2 ? "Check" : i === 2 ? "Building2" : "Circle"}
                tone={i < 3 ? "teal" : "muted"}
                size={30}
              />
              <T size={9} color={i === 2 ? c.primary : c.sub}>
                {label}
              </T>
            </View>
          ),
        )}
      </Row>
      <Row style={{ alignItems: "center", marginBottom: 2 }}>
        <View style={{ flex: 1, gap: 8 }}>
          <T size={20} weight="bold">
            Set Up Your First Property
          </T>
          <T size={11} color={c.sub}>
            Add your building or plaza and create your first shop with a
            shopkeeper. You can add more shops anytime later.
          </T>
        </View>
        <Image
          source={require("../../assets/reference/property-illustration.png")}
          style={{ width: 118, height: 115 }}
          resizeMode="contain"
        />
      </Row>
      <FormSection
        title="Property / Building Details"
        subtitle="Basic information about your property"
        icon="Building2"
      >
        <Field
          label="Property or Building Name"
          value={property}
          onChangeText={setProperty}
          icon="Building2"
        />
        <Row>
          <View style={{ flex: 1.5 }}>
            <Select
              label="Currency"
              value="AFN · Afghan Afghani"
              options={["AFN · Afghan Afghani"]}
              onChange={() => {}}
            />
          </View>
          <Select
            label="Default Rent Due Day"
            value={dueDay}
            options={["1", "3", "5", "7", "10", "15", "20", "25", "28"]}
            onChange={setDueDay}
          />
        </Row>
      </FormSection>
      <FormSection
        title="Add First Shop"
        subtitle="Create your first shop in this property"
        icon="Store"
      >
        <Row>
          <Field
            label="Shop Name / Number"
            value={shopNumber}
            onChangeText={setShopNumber}
            icon="Store"
          />
          <Field
            label="Monthly Rent"
            value={rent}
            onChangeText={setRent}
            numeric
            icon="CreditCard"
          />
        </Row>
        <Field
          label="Start Date"
          value={date}
          onChangeText={setDate}
          icon="CalendarDays"
        />
      </FormSection>
      <FormSection
        title="Add Shopkeeper"
        subtitle="Assign a shopkeeper to this shop"
        icon="UserRound"
      >
        <Row>
          <Field
            label="Shopkeeper Name"
            value={keeper}
            onChangeText={setKeeper}
            icon="UserRound"
          />
          <Field
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            icon="Phone"
          />
        </Row>
      </FormSection>
    </Page>
  );
}

export function AddShopScreen({ setup = false }: { setup?: boolean }) {
  const { c, notify } = useUI();
  const go = useGo();
  const add = usePreviewLedger((s) => s.addShop);
  const shops = usePreviewLedger((s) => s.shops);
  const [fields, setFields] = useState({
    number: "",
    name: "",
    keeper: "",
    phone: "",
    address: "",
    rent: "",
    date: "2026-03-15",
    credit: "",
    notes: "",
    property: "Al Hafez Plaza",
  });
  const [occupied, setOccupied] = useState("Occupied");
  const [attempted, setAttempted] = useState(false);
  const field = (key: keyof typeof fields) => ({
    value: fields[key],
    onChangeText: (v: string) => setFields((prev) => ({ ...prev, [key]: v })),
  });
  const save = () => {
    setAttempted(true);
    const rent = validAmount(fields.rent);
    const id = Number(fields.number.replace(/\D/g, ""));
    if (
      !fields.name.trim() ||
      !fields.keeper.trim() ||
      !fields.phone.trim() ||
      !rent ||
      !id
    )
      return notify(
        "Enter a shop number, name, shopkeeper, phone, and a positive whole-AFN rent.",
      );
    if (shops.some((s) => s.id === id))
      return notify("That shop number already exists. Choose a unique number.");
    add({
      id,
      name: fields.name.trim(),
      keeper: fields.keeper.trim(),
      phone: fields.phone,
      rent,
      paid: 0,
      credit: Math.max(0, Number(fields.credit) || 0),
      occupied: occupied === "Occupied",
      status: "Unpaid",
      image: (id - 1) % 6,
    });
    notify("Shop added to the preview ledger.");
    go("shops");
  };
  return (
    <Page
      title={setup ? "Shop Rent Manager" : "Add Shop"}
      subtitle={
        setup ? "Initial Property Setup" : "Enter shop and shopkeeper details"
      }
      help
      footer={
        <Button
          title={setup ? "Create Property & Add Shop" : "Save Shop"}
          icon="CircleCheck"
          onPress={save}
        />
      }
    >
      {setup && (
        <>
          <Row style={{ justifyContent: "space-between", paddingVertical: 7 }}>
            {["Account", "Preferences", "Property Setup", "Complete"].map(
              (s, i) => (
                <View key={s} style={{ alignItems: "center", gap: 5 }}>
                  <IconTile
                    name={i < 2 ? "Check" : i === 2 ? "House" : "Circle"}
                    tone={i < 3 ? "teal" : "muted"}
                    size={25}
                  />
                  <T size={8} color={i === 2 ? c.primary : c.sub}>
                    {s}
                  </T>
                </View>
              ),
            )}
          </Row>
          <T weight="bold" size={19}>
            Set Up Your First Property
          </T>
          <T size={11} color={c.sub}>
            Add your building or plaza and create your first shop with a
            shopkeeper. You can add more shops anytime.
          </T>
          <Field
            label="Property or Building Name"
            {...field("property")}
            icon="Building2"
          />
        </>
      )}
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
            error={
              attempted && !fields.number
                ? "Shop number is required"
                : undefined
            }
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
      <FormSection
        title="Rental Information"
        subtitle="Set rental amount and occupancy status"
        icon="Wallet"
        tone="green"
      >
        <Row style={{ alignItems: "flex-start" }}>
          <Field
            label="Monthly Rent (AFN)"
            {...field("rent")}
            placeholder="e.g. 12,000"
            numeric
            required
            icon="Banknote"
            helper="Amount charged per month"
          />
          <Field
            label="Start Date"
            {...field("date")}
            required
            icon="CalendarDays"
            helper="Date when the shop was rented"
          />
        </Row>
        <T size={11} weight="medium">
          Occupancy Status *
        </T>
        <Row>
          {["Occupied", "Vacant"].map((option) => (
            <Button
              key={option}
              title={option}
              icon={option === "Occupied" ? "CircleCheck" : "House"}
              compact
              variant={occupied === option ? "secondary" : "outline"}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: occupied === option ? c.primary : c.border,
              }}
              onPress={() => setOccupied(option)}
            />
          ))}
        </Row>
      </FormSection>
      <FormSection
        title="Financial Details"
        subtitle="Additional financial information (optional)"
        icon="FileText"
        tone="purple"
      >
        <Field
          label="Initial Construction Credit (AFN)"
          {...field("credit")}
          placeholder="e.g. 50,000"
          numeric
          icon="Hammer"
          helper="Construction paid by the shopkeeper creates credit against rent."
        />
      </FormSection>
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
    </Page>
  );
}

export function CollectRentScreen({ shopId = 2 }: { shopId?: number }) {
  const { c, notify } = useUI();
  const shop = useShop(shopId);
  const nav = useNavigation();
  const collect = usePreviewLedger((s) => s.collect);
  const [amount, setAmount] = useState("15000");
  const [method, setMethod] = useState("Cash");
  const [date, setDate] = useState("2026-03-15");
  const [note, setNote] = useState("");
  const [month, setMonth] = useState(2);
  const [selected, setSelected] = useState([true, true, true, false]);
  const [allocation, setAllocation] = useState(["5000", "3000", "7000", "0"]);
  const [attempted, setAttempted] = useState(false);
  const save = () => {
    setAttempted(true);
    const n = validAmount(amount);
    if (!n) return notify("Enter a positive whole-AFN payment amount.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
      return notify("Use a valid YYYY-MM-DD payment date.");
    collect(shop.id, n);
    notify(
      "Payment added to the preview ledger. Production allocations are not connected yet.",
    );
    nav.goBack();
  };
  return (
    <Page
      title="Collect Rent"
      help
      footer={<Button title="Save Payment" icon="FileText" onPress={save} />}
    >
      <ShopIdentity shop={shop} />
      <Card style={{ gap: 9 }}>
        <MonthPicker month={month} onChange={setMonth} />
        <Row gap={6}>
          <Metric label="Monthly Rent" value={money(shop.rent)} tone="muted" />
          <Metric
            label="Previously Settled"
            value={money(shop.paid)}
            tone="muted"
          />
          <Metric
            label="Available Credit"
            value={money(shop.credit)}
            tone="muted"
          />
        </Row>
        <Row gap={6}>
          <Metric
            label="Remaining Balance"
            value={money(Math.max(0, shop.rent - shop.paid))}
            tone="teal"
          />
          <Metric
            label="Overdue (Previous Months)"
            value={money(8000)}
            tone="red"
          />
          <Metric
            label="Advance (Credit Balance)"
            value={money(5000)}
            tone="blue"
          />
        </Row>
      </Card>
      <Card style={{ gap: 10 }}>
        <Field
          label="Payment Amount"
          value={amount}
          onChangeText={setAmount}
          numeric
          suffix="AFN"
          error={
            attempted && !validAmount(amount)
              ? "Enter a positive whole amount"
              : undefined
          }
        />
        <Row gap={5}>
          {[
            "5000",
            "10000",
            "20000",
            String(Math.max(0, shop.rent - shop.paid)),
          ].map((v, i) => (
            <Button
              key={i}
              title={
                i === 3 ? `Full (${number(Number(v))})` : number(Number(v))
              }
              onPress={() => setAmount(v)}
              compact
              variant={i === 3 ? "secondary" : "outline"}
              style={{ flex: 1 }}
            />
          ))}
        </Row>
        <T size={11}>Payment Method</T>
        <Row>
          <Button
            title="Cash"
            icon="Banknote"
            onPress={() => setMethod("Cash")}
            variant={method === "Cash" ? "secondary" : "outline"}
            style={{ flex: 1 }}
            compact
          />
          <Button
            title="Other"
            icon="Landmark"
            onPress={() => setMethod("Other")}
            variant={method === "Other" ? "secondary" : "outline"}
            style={{ flex: 1 }}
            compact
          />
        </Row>
        <Row>
          <Field
            label="Payment Date"
            value={date}
            onChangeText={setDate}
            icon="CalendarDays"
          />
          <Field
            label="Note (Optional)"
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Advance payment"
            icon="FileText"
          />
        </Row>
      </Card>
      <Card tone="teal" style={{ gap: 11 }}>
        <Section
          title="Payment Allocation"
          action="Auto Allocate"
          onPress={() => {
            setAllocation([
              "5000",
              "3000",
              String(Math.max(0, Number(amount) - 8000)),
              "0",
            ]);
            setSelected([true, true, Number(amount) > 8000, false]);
          }}
        />
        {["Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026"].map((label, i) => (
          <Row key={label}>
            <Check
              checked={selected[i]}
              label={label}
              onPress={() =>
                setSelected((prev) => prev.map((v, n) => (n === i ? !v : v)))
              }
            />
            <View style={{ flex: 1 }}>
              <T size={11}>{label}</T>
              <T size={8} color={i < 2 ? c.red : c.primary}>
                {i < 2 ? "Overdue" : i === 2 ? "Current" : "Advance"}
              </T>
            </View>
            <View style={{ width: 70 }}>
              <Field
                label=""
                value={allocation[i]}
                onChangeText={(value) =>
                  setAllocation((prev) =>
                    prev.map((v, n) => (n === i ? value : v)),
                  )
                }
                numeric
              />
            </View>
            <T
              size={10}
              color={c.sub}
            >{`/ ${i === 0 ? "5,000" : i === 1 ? "3,000" : number(shop.rent)}`}</T>
            <Badge
              label={i < 2 ? "Full" : i === 2 ? "Partial" : "None"}
              tone={i < 2 ? "teal" : "muted"}
              small
            />
          </Row>
        ))}
      </Card>
      <Card tone="teal">
        <Row style={{ justifyContent: "space-between" }}>
          <T size={11}>Resulting Balance (After Payment)</T>
          <T size={17} weight="bold" color={c.primary}>
            {money(
              Math.max(0, shop.rent - shop.paid + 8000 - (Number(amount) || 0)),
            )}
          </T>
        </Row>
      </Card>
    </Page>
  );
}

export function AddExpenseScreen() {
  const { c, notify } = useUI();
  const nav = useNavigation();
  const add = usePreviewLedger((s) => s.addExpense);
  const [amount, setAmount] = useState("15000");
  const [category, setCategory] = useState("Repairs");
  const [description, setDescription] = useState("AC unit repair and service");
  const [date, setDate] = useState("2026-03-15");
  const [type, setType] = useState("Property Expense");
  const [method, setMethod] = useState("Cash");
  const [shop, setShop] = useState("Shop 01 · Ahmad Khan");
  const [notes, setNotes] = useState("");
  const categories: { label: string; icon: IconName }[] = [
    { label: "Repairs", icon: "Wrench" },
    { label: "Maintenance", icon: "Settings2" },
    { label: "Utilities", icon: "Zap" },
    { label: "Construction", icon: "Building2" },
    { label: "Supplies", icon: "ShoppingCart" },
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
          onPress={() => {
            const n = validAmount(amount);
            if (!n || !description.trim())
              return notify(
                "Enter a positive whole-AFN amount and description.",
              );
            add({ amount: n, description, category });
            notify("Expense added to the preview ledger.");
            nav.goBack();
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
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
          {categories.map((cat) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: category === cat.label }}
              key={cat.label}
              onPress={() => setCategory(cat.label)}
              style={{ width: "23%", flexGrow: 1 }}
            >
              <Card
                tone={category === cat.label ? "teal" : "muted"}
                style={{
                  paddingVertical: 11,
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
                <T size={9}>{cat.label}</T>
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
      <Field
        label="Date"
        value={date}
        onChangeText={setDate}
        icon="CalendarDays"
      />
      <T size={12} weight="semibold">
        Expense Type
      </T>
      <Row>
        {["Property Expense", "Personal Expense"].map((v, i) => (
          <Card
            key={v}
            tone={type === v ? "teal" : "muted"}
            onPress={() => setType(v)}
            style={{ flex: 1, borderColor: type === v ? c.primary : c.border }}
          >
            <Row>
              <Icon name={i ? "UserRound" : "House"} />
              <View style={{ flex: 1 }}>
                <T size={10} weight="semibold">
                  {v}
                </T>
                <T size={8} color={c.sub}>
                  {i ? "Not related to shops" : "Related to shops/property"}
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
          "Shop 01 · Ahmad Khan",
          "Shop 02 · Bilal Electronics",
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
        onSelect={setMethod}
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

export function GoodsTakenScreen({ shopId = 1 }: { shopId?: number }) {
  const { c, notify } = useUI();
  const shop = useShop(shopId);
  const [item, setItem] = useState("Tea Packets (Tapal 950g)");
  const [quantity, setQuantity] = useState("5");
  const [price, setPrice] = useState("850");
  const [unit, setUnit] = useState("Pcs.");
  const [date, setDate] = useState("2026-03-15");
  const [notes, setNotes] = useState("Tea packets taken for shop staff.");
  const [mode, setMode] = useState("offset");
  const total = Math.max(0, Number(quantity) * Number(price) || 0);
  const nav = useNavigation();
  return (
    <Page
      title="Goods Taken from Shop"
      help
      footer={
        <Button
          title="Record Goods"
          icon="CircleCheck"
          onPress={() => {
            if (!item.trim() || !validAmount(String(total)))
              return notify(
                "Enter an item and valid quantity and whole-AFN price.",
              );
            notify(
              "Goods form reviewed. Payables and rent offsets will connect to the production ledger.",
            );
          }}
        />
      }
    >
      <T size={11} weight="semibold">
        Select Shop *
      </T>
      <ShopIdentity shop={shop} />
      <Field
        label="Item Name"
        value={item}
        onChangeText={setItem}
        icon="Package"
        required
      />
      <Row>
        <Field
          label="Quantity"
          value={quantity}
          onChangeText={setQuantity}
          numeric
          icon="Hash"
          required
        />
        <Select
          label="Unit"
          value={unit}
          options={["Pcs.", "Kg", "Litre", "Box"]}
          onChange={setUnit}
        />
        <Field
          label="Unit Price (AFN)"
          value={price}
          onChangeText={setPrice}
          numeric
          icon="Tag"
          required
        />
      </Row>
      <Row>
        <Field
          label="Total Value (AFN)"
          value={number(total)}
          readOnly
          icon="Banknote"
        />
        <Field
          label="Date"
          value={date}
          onChangeText={setDate}
          icon="CalendarDays"
        />
      </Row>
      <Field
        label="Notes (Optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
        icon="FileText"
      />
      <Divider />
      <Section title="How to Record This?">
        <Row style={{ alignItems: "stretch" }}>
          {[
            {
              key: "offset",
              title: "Apply as Rent Deduction",
              sub: "Deduct the value from rent owed.",
              tone: "teal",
            },
            {
              key: "owed",
              title: "Record as Separate Expense / Payable",
              sub: "Keep rent unchanged; settle separately.",
              tone: "muted",
            },
          ].map((option) => (
            <Card
              key={option.key}
              tone={option.tone as "teal" | "muted"}
              onPress={() => setMode(option.key)}
              style={{
                flex: 1,
                gap: 7,
                borderColor: mode === option.key ? c.primary : c.border,
              }}
            >
              <Row>
                <Icon
                  name={mode === option.key ? "CircleDot" : "Circle"}
                  size={17}
                  color={mode === option.key ? c.primary : c.sub}
                />
                <T size={11} weight="semibold" style={{ flex: 1 }}>
                  {option.title}
                </T>
              </Row>
              <T size={10} color={c.sub}>
                {option.sub}
              </T>
              <T
                color={
                  mode === "offset" && option.key === "offset"
                    ? c.primary
                    : c.red
                }
                size={13}
                weight="bold"
              >
                {option.key === "offset" ? `− ${money(total)}` : "No Change"}
              </T>
            </Card>
          ))}
        </Row>
        <Chips
          options={["offset", "owed", "paid"]}
          selected={mode}
          onSelect={setMode}
        />
        <T size={10} color={c.sub}>
          Paid = paid separately · owed = owner payable · offset = reduce rent.
        </T>
      </Section>
      <Card tone="teal">
        <Section title="Transaction Summary">
          <Row>
            <View style={{ flex: 1, gap: 6 }}>
              <T size={10}>{`Shop #${shop.id} · ${shop.keeper}`}</T>
              <T size={10} color={c.sub}>
                {item}
              </T>
              <T
                size={10}
                color={c.sub}
              >{`${quantity} ${unit} × ${money(Number(price) || 0)}`}</T>
            </View>
            <View style={{ flex: 1 }}>
              <T size={10} color={c.sub}>
                New Rent Balance
              </T>
              <T size={23} weight="bold" color={c.primary}>
                {money(
                  Math.max(
                    0,
                    shop.rent - shop.paid - (mode === "offset" ? total : 0),
                  ),
                )}
              </T>
            </View>
          </Row>
        </Section>
      </Card>
    </Page>
  );
}

export function ApplyCreditScreen({ shopId = 2 }: { shopId?: number }) {
  const { c, notify } = useUI();
  const shop = useShop(shopId);
  const apply = usePreviewLedger((s) => s.applyCredit);
  const [amount, setAmount] = useState("10000");
  const [month, setMonth] = useState("April 2026");
  const [selected, setSelected] = useState("April 2026");
  const available = shop.credit;
  const nav = useNavigation();
  const save = () => {
    const n = validAmount(amount);
    if (!n || n > available || n > Math.max(0, shop.rent - shop.paid))
      return notify(
        "Choose an amount within available credit and unpaid rent.",
      );
    apply(shop.id, n);
    notify("Credit applied in the preview ledger.");
    nav.goBack();
  };
  return (
    <Page
      title="Apply Credit"
      subtitle="Settle rent using your construction credit"
      footer={<Button title="Apply Credit" icon="CircleCheck" onPress={save} />}
    >
      <Card tone="teal">
        <Row>
          <IconTile name="Wallet" />
          <View>
            <T size={12} weight="semibold">
              Available Construction Credit
            </T>
            <T size={26} weight="bold">
              {money(available)}
            </T>
            <T size={10} color={c.sub}>
              Usable for rent settlement (noncash)
            </T>
          </View>
        </Row>
      </Card>
      <Section title="Outstanding Rent by Month" action="View All">
        {["March 2026", "April 2026", "May 2026", "June 2026"].map((m) => (
          <Pressable
            key={m}
            onPress={() => {
              setMonth(m);
              setSelected(m);
            }}
          >
            <Row
              style={{
                padding: 8,
                backgroundColor: m === selected ? c.teal : c.surface,
                borderRadius: 7,
              }}
            >
              <Icon name="CalendarDays" size={16} color={c.sub} />
              <T size={12} style={{ flex: 1 }}>
                {m}
              </T>
              <T size={12} color={c.red} weight="medium">
                {money(shop.rent)}
              </T>
              <Check
                checked={selected === m}
                label={m}
                onPress={() => {
                  setSelected(m);
                  setMonth(m);
                }}
              />
            </Row>
          </Pressable>
        ))}
      </Section>
      <Card tone="teal">
        <Field
          label="Credit Amount to Apply"
          value={amount}
          onChangeText={setAmount}
          numeric
          suffix="AFN"
          helper={`Maximum available: ${money(Math.min(available, Math.max(0, shop.rent - shop.paid)))}`}
        />
      </Card>
      <Info
        title="This is a noncash settlement"
        text="Applying credit settles rent using available construction credit. It does not create new cash income."
      />
      <Card>
        <Section title="Month Allocation">
          <Row style={{ justifyContent: "space-between" }}>
            <T>{month}</T>
            <T color={c.primary} weight="bold">
              {money(Number(amount) || 0)}
            </T>
          </Row>
        </Section>
      </Card>
      <Card tone="teal">
        <Section title="Remaining Credit After Application">
          <Row>
            <Metric
              label="Current Credit"
              value={money(available)}
              tone="muted"
            />
            <Metric
              label="Rent to Apply"
              value={money(Number(amount) || 0)}
              tone="red"
            />
            <Metric
              label="Remaining Credit"
              value={money(Math.max(0, available - (Number(amount) || 0)))}
            />
          </Row>
        </Section>
      </Card>
      <Card>
        <Section title="Confirmation Summary">
          <SummaryLine label="Month" value={month} />
          <SummaryLine label="Rent Amount" value={money(shop.rent)} />
          <SummaryLine
            label="Credit to Apply"
            value={money(Number(amount) || 0)}
          />
          <SummaryLine
            label="Payment Type"
            value="Construction Credit (Noncash)"
          />
        </Section>
      </Card>
    </Page>
  );
}
export function SummaryLine({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  const { c } = useUI();
  return (
    <Row style={{ justifyContent: "space-between", paddingVertical: 3 }}>
      <T size={10} color={c.sub}>
        {label}
      </T>
      <T size={10} color={color ?? c.text} weight="medium">
        {value}
      </T>
    </Row>
  );
}

export function GoodsSettlementScreen({ shopId = 2 }: { shopId?: number }) {
  const { c, notify } = useUI();
  const shop = useShop(shopId);
  const [method, setMethod] = useState("Offset Against Rent");
  const [amount, setAmount] = useState("25000");
  return (
    <Page
      title="Goods Settlement"
      help
      footer={
        <Button
          title="Complete Settlement"
          icon="CircleCheck"
          onPress={() =>
            notify(
              "Settlement preview reviewed. Production goods payables are not connected yet.",
            )
          }
        />
      }
    >
      <ShopIdentity shop={shop} />
      <Card tone="teal">
        <Row>
          <View style={{ flex: 1 }}>
            <T size={11} color={c.sub}>
              Total Goods Received (This Month)
            </T>
            <T size={27} weight="bold">
              {money(55000)}
            </T>
          </View>
          <View>
            <T size={10} color={c.red}>
              Outstanding Payable
            </T>
            <T size={20} weight="bold" color={c.red}>
              {money(25000)}
            </T>
          </View>
        </Row>
        <Progress value={55} />
        <Row style={{ justifyContent: "space-between", marginTop: 8 }}>
          <T size={10}>Settled: AFN 30,000</T>
          <T size={10} color={c.primary}>
            55% settled
          </T>
        </Row>
      </Card>
      <Card>
        <Section title="Goods Records (This Month)" action="View All">
          {[
            {
              title: "Tea Packets (Tapal 950g)",
              value: 4250,
              status: "Unpaid",
            },
            { title: "Sugar (1 Kg)", value: 1000, status: "Partial" },
            { title: "Beverage Crate", value: 8000, status: "Settled" },
            { title: "Biscuits (Family Pack)", value: 1500, status: "Unpaid" },
            { title: "Chips (Large)", value: 2000, status: "Settled" },
          ].map((g, i) => (
            <Row key={g.title} style={{ paddingVertical: 5 }}>
              <IconTile
                name="Package"
                tone={
                  g.status === "Settled"
                    ? "green"
                    : g.status === "Partial"
                      ? "orange"
                      : "red"
                }
                size={27}
              />
              <View style={{ flex: 1 }}>
                <T size={10} weight="medium">
                  {g.title}
                </T>
                <T size={8} color={c.sub}>{`Mar ${15 - i}, 2026`}</T>
              </View>
              <T size={10} weight="semibold">
                {money(g.value)}
              </T>
              <Badge
                label={g.status}
                tone={
                  g.status === "Settled"
                    ? "green"
                    : g.status === "Partial"
                      ? "orange"
                      : "red"
                }
                small
              />
            </Row>
          ))}
        </Section>
      </Card>
      <Section title="Settlement Options">
        <Row>
          {["Settle by Cash", "Offset Against Rent"].map((v, i) => (
            <Card
              key={v}
              onPress={() => setMethod(v)}
              tone={method === v ? "teal" : "muted"}
              style={{
                flex: 1,
                borderColor: method === v ? c.primary : c.border,
              }}
            >
              <Row>
                <Icon name={method === v ? "CircleDot" : "Circle"} size={16} />
                <T size={11} weight="semibold" style={{ flex: 1 }}>
                  {v}
                </T>
              </Row>
              <T size={9} color={c.sub} style={{ marginTop: 6 }}>
                {i
                  ? "Use the goods payable to settle outstanding shop rent."
                  : "Pay the outstanding amount directly to the shopkeeper."}
              </T>
            </Card>
          ))}
        </Row>
        <Field
          label="Settlement Amount"
          value={amount}
          onChangeText={setAmount}
          numeric
          suffix="AFN"
        />
      </Section>
      <Card>
        <Section title="Settlement History" action="View All">
          {[12000, 15000, 3000].map((v, i) => (
            <SummaryLine
              key={i}
              label={`Mar ${10 - i}, 2026 · ${i % 2 ? "Rent offset" : "Cash paid"}`}
              value={money(v)}
              color={c.primary}
            />
          ))}
        </Section>
      </Card>
      <Card tone="teal">
        <Section title="Settlement Confirmation">
          <SummaryLine label="Before Payable" value={money(25000)} />
          <SummaryLine label="Settlement" value={money(Number(amount) || 0)} />
          <SummaryLine
            label="Remaining Payable"
            value={money(Math.max(0, 25000 - (Number(amount) || 0)))}
            color={c.primary}
          />
        </Section>
      </Card>
    </Page>
  );
}

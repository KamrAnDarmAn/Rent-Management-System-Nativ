import React, { useState } from "react";
import { View, Image, Pressable, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParams } from "../types";
import {
  Badge,
  BarChart,
  Button,
  Card,
  Check,
  Divider,
  Field,
  Icon,
  IconButton,
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
import { rentalTag, rentPosition } from "../rent";
import { useToday } from "../useToday";
import { PrepaidSummary } from "./prepaid";
import { usePreviewLedger } from "../store";
import { Chips, TransactionRow } from "./main";
import { FormSection, ShopIdentity, SummaryLine, useShop } from "./forms";

export function ShopDetailsScreen({ shopId = 1 }: { shopId?: number }) {
  const { c, notify } = useUI();
  const go = useGo();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const shop = usePreviewLedger((state) =>
    state.shops.find((s) => s.id === shopId),
  );
  const deleteShop = usePreviewLedger((state) => state.deleteShop);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const updateShop = usePreviewLedger((state) => state.updateShop);
  const [editNotes, setEditNotes] = useState(false);
  const today = useToday();
  const returnToShops = () =>
    navigation.reset({
      index: 0,
      routes: [{ name: "Tabs", params: { screen: "shops" } }],
    });
  if (!shop)
    return (
      <Page title="Shop Details">
        <Card style={{ gap: 12 }}>
          <T size={18} weight="bold">
            Shop not found
          </T>
          <T color={c.sub}>This shop is no longer available.</T>
          <Button title="Back to Shops" onPress={returnToShops} />
        </Card>
      </Page>
    );
  const position = rentPosition(shop, today);
  const footer = (
    <Button
      title="Collect Rent"
      icon="Banknote"
      onPress={() => go("collect-rent", shop.id)}
    />
  );
  return (
    <Page
      title="Shop Details"
      trailing={
        <IconButton
          name="Ellipsis"
          label="More shop actions"
          onPress={() => go("shop-financial-report", shop.id)}
        />
      }
      footer={footer}
    >
      <Modal
        transparent
        visible={confirmDelete}
        animationType="fade"
        onRequestClose={() => setConfirmDelete(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#0a1b3570",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            role="dialog"
            accessibilityViewIsModal
            accessibilityLabel="Delete this shop?"
            style={{
              width: "100%",
              maxWidth: 400,
              padding: 20,
              borderRadius: 18,
              backgroundColor: c.surface,
              gap: 14,
            }}
          >
            <Row>
              <IconTile name="Trash2" tone="red" size={42} />
              <T size={20} weight="bold">
                Delete this shop?
              </T>
            </Row>
            <T
              size={14}
              weight="semibold"
            >{`Shop #${shop.number} · ${shop.name}`}</T>
            <T color={c.sub}>
              This removes the shop from the current preview. Other shops will
              be kept.
            </T>
            <Row>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setConfirmDelete(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Delete Shop"
                icon="Trash2"
                variant="danger"
                onPress={() => {
                  setConfirmDelete(false);
                  returnToShops();
                  deleteShop(shop.id);
                  notify("Shop deleted from the preview ledger.");
                }}
                style={{ flex: 1 }}
              />
            </Row>
          </View>
        </View>
      </Modal>
      <Card>
        <Row>
          <Image
            source={shopImages[shop.image]}
            style={{ width: 88, height: 70, borderRadius: 9 }}
          />
          <View style={{ flex: 1, gap: 5 }}>
            <Row style={{ justifyContent: "space-between" }}>
              <T size={20} weight="bold">{`Shop #${shop.number}`}</T>
              <Badge
                label={rentalTag(shop)}
                tone={
                  shop.occupied
                    ? shop.rentalType === "prepaid"
                      ? "blue"
                      : "green"
                    : "muted"
                }
                small
              />
            </Row>
            <T size={13} color={c.sub}>
              Al Hafez Plaza
            </T>
            <Row gap={4}>
              <Icon name="MapPin" size={13} color={c.sub} />
              <T size={10} color={c.sub}>
                {shop.address || "—"}
              </T>
            </Row>
          </View>
        </Row>
        <Divider />
        <Row>
          <IconTile name="UserRound" size={33} />
          <Pressable
            style={{ flex: 1 }}
            onPress={() => go("shopkeeper", shop.id)}
          >
            <T size={10} color={c.sub}>
              Current Shopkeeper
            </T>
            <T size={13} weight="semibold">
              {shop.keeper}
            </T>
            <T size={9} color={c.sub}>
              {shop.phone}
            </T>
          </Pressable>
          <IconTile name="CreditCard" size={33} />
          <View style={{ flex: 1 }}>
            <T size={10} color={c.sub}>
              Monthly Rent
            </T>
            <T size={15} weight="bold">
              {money(shop.rent)}
            </T>
            <T size={9} color={c.sub}>
              {`Since ${shop.startDate}`}
            </T>
          </View>
        </Row>
      </Card>
      {position.prepaid && shop.prepaidRent && (
        <PrepaidSummary plan={shop.prepaidRent} today={today} />
      )}
      <Row gap={6}>
        <Pressable
          onPress={() => go("rent-history", shop.id)}
          style={{ flex: 1 }}
        >
          <Metric
            label="Outstanding Rent"
            value={money(position.due)}
            tone="red"
            icon="FileWarning"
            detail="View rent history"
          />
        </Pressable>
        <Pressable
          onPress={() => go("construction-credit", shop.id)}
          style={{ flex: 1 }}
        >
          <Metric
            label="Available Credit"
            value={money(shop.credit)}
            tone="teal"
            icon="Building2"
            detail="Construction Credit"
          />
        </Pressable>
        <Pressable
          onPress={() => go("goods-settlement", shop.id)}
          style={{ flex: 1 }}
        >
          <Metric
            label="Goods Payable"
            value={money(25000)}
            tone="orange"
            icon="Package"
            detail="3 pending entries"
          />
        </Pressable>
      </Row>
      <Card style={{ padding: 5 }}>
        <Row gap={0}>
          {[
            { label: "Overview", icon: "House", id: undefined },
            { label: "Tenancy", icon: "UserRound", id: "tenancy-lifecycle" },
            { label: "Rent History", icon: "FileText", id: "rent-history" },
            { label: "Credits", icon: "Store", id: "construction-credit" },
            { label: "Goods", icon: "Package", id: "goods-settlement" },
            { label: "Activity", icon: "Clock3", id: "shop-financial-report" },
          ].map((tab, i) => (
            <Pressable
              key={tab.label}
              onPress={() => tab.id && go(tab.id as "rent-history", shop.id)}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 9,
                borderRadius: 8,
                backgroundColor: i === 0 ? c.teal : "transparent",
                gap: 5,
              }}
            >
              <Icon
                name={tab.icon as IconName}
                size={19}
                color={i === 0 ? c.primary : c.sub}
              />
              <T size={8} color={i === 0 ? c.primary : c.sub}>
                {tab.label}
              </T>
            </Pressable>
          ))}
        </Row>
      </Card>
      <Row style={{ alignItems: "stretch" }} gap={7}>
        <Card style={{ flex: 1, padding: 9 }}>
          <Section
            title="Shop Information"
            action="Edit"
            onPress={() => go("edit-shop", shop.id)}
          >
            {[
              ["Shop Number", `Shop #${shop.number}`],
              ["Shop Name", shop.name],
              ["Category", "Retail Shop"],
              ["Size", "15 × 20 ft (300 sq ft)"],
              ["Floor", "Ground Floor"],
              ["Status", rentalTag(shop)],
              [
                "Rental Payment Type",
                shop.rentalType === "prepaid" ? "Prepaid" : "Monthly",
              ],
              ["Start Date", shop.startDate],
              ["Monthly Rent", money(shop.rent)],
            ].map(([k, v]) => (
              <View key={k} style={{ gap: 2 }}>
                <T size={9} color={c.sub}>
                  {k}
                </T>
                <T size={10} weight="medium">
                  {v}
                </T>
              </View>
            ))}
          </Section>
        </Card>
        <View style={{ flex: 1, gap: 8 }}>
          <Card style={{ padding: 9 }}>
            <Section
              title="Notes"
              action={editNotes ? "Done" : "Edit"}
              onPress={() => setEditNotes(!editNotes)}
            >
              {editNotes ? (
                <Field
                  label="Notes"
                  value={shop.notes}
                  onChangeText={(value) =>
                    updateShop(shop.id, { notes: value })
                  }
                  multiline
                />
              ) : (
                <T size={10} color={c.sub}>
                  {shop.notes || "—"}
                </T>
              )}
            </Section>
          </Card>
          <Card style={{ padding: 9 }}>
            <Section title="Important Dates">
              {[
                ["Tenancy Start", shop.startDate],
                [
                  "Next Rent Due",
                  position.prepaid?.firstCashDueDate ?? "01 Apr 2026",
                ],
                [
                  "Contract Type",
                  shop.rentalType === "prepaid" ? "Prepaid" : "Monthly",
                ],
              ].map(([k, v]) => (
                <View key={k}>
                  <T size={9} color={c.sub}>
                    {k}
                  </T>
                  <T size={10}>{v}</T>
                </View>
              ))}
            </Section>
          </Card>
        </View>
      </Row>
      <Card>
        <Section
          title="Recent Activity"
          action="View All"
          onPress={() => go("shop-financial-report", shop.id)}
        >
          <View>
            <TransactionRow
              title="Rent payment overdue"
              subtitle="March 2026 rent is overdue by 15 days"
              amount={18000}
              tone="red"
              icon="CircleAlert"
              onPress={() => go("rent-history", shop.id)}
            />
            <TransactionRow
              title="Goods taken from shop"
              subtitle="Mar 12, 2026 · Mobile accessories"
              amount={8500}
              tone="blue"
              icon="Package"
              onPress={() => go("goods-taken", shop.id)}
            />
            <TransactionRow
              title="Partial rent payment"
              subtitle="Paid for February 2026"
              amount={10000}
              icon="Wallet"
            />
            <TransactionRow
              title="Construction credit approved"
              subtitle="Interior work · Jan 03, 2024"
              amount={50000}
              icon="Hammer"
              tone="purple"
            />
          </View>
        </Section>
      </Card>
      <Button
        title="Delete Shop"
        icon="Trash2"
        variant="danger"
        onPress={() => setConfirmDelete(true)}
      />
      <Row gap={5}>
        <Button
          title="Edit Shop"
          icon="Pencil"
          variant="secondary"
          onPress={() => go("edit-shop", shop.id)}
          style={{ flex: 1 }}
          compact
        />
        <Button
          title="Change Rent"
          icon="TrendingUp"
          variant="secondary"
          onPress={() => go("tenancy-lifecycle", shop.id)}
          style={{ flex: 1 }}
          compact
        />
        <Button
          title="End Tenancy"
          icon="Pause"
          variant="outline"
          onPress={() => go("tenancy-lifecycle", shop.id)}
          style={{ flex: 1 }}
          compact
        />
        <Button
          title="Archive"
          icon="Archive"
          variant="outline"
          onPress={() =>
            notify(
              "Archive will preserve financial history. This action is not connected in the visual preview.",
            )
          }
          style={{ flex: 1 }}
          compact
        />
      </Row>
    </Page>
  );
}

export function ShopkeeperScreen({ shopId = 1 }: { shopId?: number }) {
  const { c, notify } = useUI();
  const go = useGo();
  const shop = useShop(shopId);
  return (
    <Page
      title="Shopkeeper"
      trailing={
        <IconButton
          name="Ellipsis"
          label="More shopkeeper actions"
          onPress={() =>
            notify("Shopkeeper account · shared balance across linked shops.")
          }
        />
      }
    >
      <Card>
        <Row>
          <View
            style={{
              width: 49,
              height: 49,
              borderRadius: 25,
              backgroundColor: c.teal,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <T size={20} weight="bold" color={c.primary}>
              {shop.keeper
                .split(" ")
                .map((s) => s[0])
                .join("")}
            </T>
          </View>
          <View style={{ flex: 1 }}>
            <Row>
              <T size={17} weight="bold">
                {shop.keeper}
              </T>
              <Badge label="Active" small />
            </Row>
            <T size={11} color={c.sub}>
              {shop.phone}
            </T>
            <Row>
              <Icon name="MapPin" size={11} />
              <T size={10} color={c.sub}>
                Al Hafez Plaza, Kabul
              </T>
            </Row>
          </View>
        </Row>
        <Divider />
        <Row style={{ justifyContent: "space-between" }}>
          <T size={9} color={c.sub}>
            Individual Shopkeeper
          </T>
          <T size={9} color={c.sub}>
            Since Jan 2024
          </T>
          <T size={9} color={c.sub}>
            2 Shops
          </T>
        </Row>
      </Card>
      <Row>
        <Button
          title="Edit"
          icon="Pencil"
          compact
          onPress={() => go("edit-shop", shop.id)}
          variant="secondary"
          style={{ flex: 1 }}
        />
        <Button
          title="Call"
          icon="Phone"
          compact
          onPress={() => notify(`Contact: ${shop.phone}`)}
          variant="secondary"
          style={{ flex: 1 }}
        />
        <Button
          title="View History"
          icon="Clock3"
          compact
          onPress={() => go("rent-history", shop.id)}
          variant="outline"
          style={{ flex: 1 }}
        />
      </Row>
      <Row>
        <Metric
          label="Person Account Balance"
          value={money(7750)}
          detail="Amount due from shopkeeper"
          icon="Wallet"
        />
        <Metric
          label="Construction Credit"
          value={money(shop.credit)}
          icon="Hammer"
          tone="blue"
        />
      </Row>
      <Row>
        <Metric label="Goods Payable" value={money(14250)} tone="red" />
        <Metric label="Total Shop Balance" value={money(12000)} tone="blue" />
      </Row>
      <Row>
        <Metric label="Active Shops" value="2" icon="House" tone="green" />
        <Metric label="Unsettled" value="1" icon="Clock3" tone="orange" />
        <Metric label="Rent Payments" value="5" icon="CreditCard" tone="blue" />
        <Metric label="Notes" value="3" icon="StickyNote" tone="purple" />
      </Row>
      <Card>
        <Section
          title="Linked Shops (2)"
          action="Add / Link Shop"
          onPress={() => go("add-shop")}
        >
          <ShopIdentity
            shop={shop}
            onPress={() => go("shop-details", shop.id)}
          />
          <SummaryLine
            label="Shop 02 · Bilal Electronics"
            value={money(7750)}
            color={c.red}
          />
          <SummaryLine label="Shop 03 · Closed tenancy" value={money(0)} />
        </Section>
      </Card>
      <Chips
        options={[
          "Rent Payments",
          "Goods Taken",
          "Construction Credits",
          "Notes",
        ]}
        selected="Rent Payments"
        onSelect={(v) =>
          go(
            v === "Goods Taken"
              ? "goods-settlement"
              : v === "Construction Credits"
                ? "construction-credit"
                : "rent-history",
            shop.id,
          )
        }
      />
      <Card>
        {[12000, 12000, 3000, 12000, 12000].map((amount, i) => (
          <TransactionRow
            key={i}
            title={i === 2 ? "Advance Given" : "Rent Payment"}
            subtitle={`Mar ${15 - i}, 2026 · Cash`}
            amount={amount}
            icon={i === 2 ? "ArrowUp" : "CircleDollarSign"}
            tone={i === 2 ? "red" : "teal"}
            onPress={() => go("reverse-transaction", shop.id)}
          />
        ))}
      </Card>
    </Page>
  );
}

export function ConstructionCreditScreen({ shopId = 1 }: { shopId?: number }) {
  const { c, notify } = useUI();
  const go = useGo();
  const shop = useShop(shopId);
  return (
    <Page title="Construction Credit" help>
      <ShopIdentity shop={shop} />
      <Card tone="teal" style={{ gap: 13 }}>
        <Row>
          <IconTile name="Building2" />
          <View style={{ flex: 1 }}>
            <T weight="semibold" size={14}>
              Construction Credit
            </T>
            <T size={10} color={c.sub}>
              Noncash credit provided by shopkeeper
            </T>
            <T size={9} color={c.sub}>
              For construction work, used for rent settlement
            </T>
          </View>
        </Row>
        <Row>
          <View style={{ flex: 1 }}>
            <T size={9} color={c.sub}>
              Total Construction Credit
            </T>
            <T size={17} weight="bold">
              {money(300000)}
            </T>
          </View>
          <View style={{ flex: 1 }}>
            <T size={9} color={c.sub}>
              Applied to Rent
            </T>
            <T size={17} weight="bold">
              {money(180000)}
            </T>
          </View>
          <View style={{ flex: 1 }}>
            <T size={9} color={c.sub}>
              Remaining Credit
            </T>
            <T size={17} weight="bold" color={c.primary}>
              {money(shop.credit)}
            </T>
          </View>
        </Row>
        <Progress value={60} height={10} />
        <Row style={{ justifyContent: "space-between" }}>
          <T size={10} color={c.sub}>
            60% used
          </T>
          <T size={10} color={c.primary}>
            40% available
          </T>
        </Row>
      </Card>
      <Row>
        <Metric
          label="Months Settled with Credit"
          value="6"
          icon="CalendarCheck"
          detail="of 12 months"
        />
        <Metric
          label="Estimated Coverage at Current Rent"
          value="4 months"
          icon="Clock3"
          tone="blue"
        />
      </Row>
      <Row>
        <Button
          title="Add Adjustment"
          icon="Plus"
          onPress={() =>
            notify(
              "Credit adjustments will create auditable entries in the production ledger.",
            )
          }
          style={{ flex: 1 }}
          compact
        />
        <Button
          title="View Statement"
          icon="FileText"
          onPress={() => go("shop-financial-report", shop.id)}
          variant="secondary"
          style={{ flex: 1 }}
          compact
        />
      </Row>
      <Card>
        <Section
          title="Credit Application History"
          action="View All"
          onPress={() => go("rent-history", shop.id)}
        >
          {[
            "March 2026",
            "February 2026",
            "January 2026",
            "December 2025",
            "November 2025",
            "October 2025",
          ].map((month, i) => (
            <Pressable
              key={month}
              onPress={() => go("shop-financial-report", shop.id)}
            >
              <Row
                style={{
                  paddingVertical: 7,
                  borderBottomWidth: 1,
                  borderColor: c.border,
                }}
              >
                <View style={{ width: 30 }}>
                  <T size={9} weight="bold" color={c.sub}>
                    {month.slice(0, 3).toUpperCase()}
                  </T>
                  <T size={8} color={c.sub}>
                    {i < 3 ? "2026" : "2025"}
                  </T>
                </View>
                <View style={{ flex: 1 }}>
                  <T
                    size={11}
                    weight="medium"
                  >{`Applied to Rent · ${month}`}</T>
                  <T size={9} color={c.sub}>
                    Rent settled with construction credit
                  </T>
                </View>
                <View>
                  <T weight="semibold" size={12}>
                    {money(30000)}
                  </T>
                  <Badge label="Credit Applied" tone="teal" small />
                </View>
                <Icon name="ChevronRight" size={13} color={c.sub} />
              </Row>
            </Pressable>
          ))}
        </Section>
      </Card>
      <Card tone="teal">
        <Row>
          <IconTile name="FileText" />
          <View style={{ flex: 1 }}>
            <T size={12} weight="semibold">
              Next Rent Settlement
            </T>
            <T size={10} color={c.sub}>
              You can use construction credit to settle upcoming rent.
            </T>
          </View>
          <T weight="bold" color={c.primary}>
            {money(shop.credit)}
          </T>
        </Row>
      </Card>
      <Button
        title="Apply Credit"
        icon="CircleCheck"
        onPress={() => go("apply-credit", shop.id)}
      />
    </Page>
  );
}

export function RentHistoryScreen({ shopId = 1 }: { shopId?: number }) {
  const { c } = useUI();
  const go = useGo();
  const shop = useShop(shopId);
  const [year, setYear] = useState("2026");
  const [expanded, setExpanded] = useState("Dec 2025");
  const months = [
    "Mar 2026",
    "Feb 2026",
    "Jan 2026",
    "Dec 2025",
    "Nov 2025",
    "Oct 2025",
    "Sep 2025",
  ];
  return (
    <Page
      title="Rent History"
      subtitle={`Shop ${shop.number} · ${shop.keeper}`}
    >
      <ShopIdentity shop={shop} />
      <Row>
        <Metric
          label="Outstanding Balance"
          value={money(60000)}
          tone="red"
          detail="3 months unpaid"
        />
        <View style={{ flex: 1, gap: 6 }}>
          <Metric
            label="Total Paid (This Year)"
            value={money(240000)}
            tone="green"
          />
          <Metric
            label="Total Billed (This Year)"
            value={money(300000)}
            tone="blue"
          />
        </View>
      </Row>
      <Row>
        <Metric label="Paid" value="9" tone="green" />
        <Metric label="Partial" value="3" tone="orange" />
        <Metric label="Unpaid" value="3" tone="red" />
        <Metric label="Total Months" value="12" tone="blue" />
      </Row>
      <Row>
        <T size={15} weight="semibold" style={{ flex: 1 }}>
          Monthly History
        </T>
        <View style={{ width: 100 }}>
          <Select
            value={year}
            options={["2026", "2025", "All Years"]}
            onChange={setYear}
          />
        </View>
      </Row>
      <Card style={{ padding: 5 }}>
        {months
          .filter(
            (m) => year === "All Years" || m.includes(year) || year === "2026",
          )
          .map((m, i) => (
            <View key={m}>
              <Pressable
                onPress={() => setExpanded(expanded === m ? "" : m)}
                style={{
                  padding: 9,
                  backgroundColor: expanded === m ? c.orangeBg : "transparent",
                  borderRadius: 7,
                }}
              >
                <Row>
                  <T size={12} weight="semibold" style={{ flex: 1 }}>
                    {m}
                  </T>
                  <Badge
                    label={i < 3 ? "Unpaid" : i === 3 ? "Partial" : "Paid"}
                    tone={i < 3 ? "red" : i === 3 ? "orange" : "green"}
                    small
                  />
                  <T size={12} weight="semibold">
                    {money(i === 3 ? 10000 : 20000)}
                  </T>
                  <Icon
                    name={expanded === m ? "ChevronDown" : "ChevronRight"}
                    size={14}
                    color={c.sub}
                  />
                </Row>
              </Pressable>
              {expanded === m && (
                <View style={{ gap: 8, padding: 9, backgroundColor: c.muted }}>
                  <Row>
                    <Metric
                      label="Rent Amount"
                      value={money(20000)}
                      tone="muted"
                    />
                    <Metric
                      label="Paid Amount"
                      value={money(i < 3 ? 0 : i === 3 ? 10000 : 20000)}
                      tone="muted"
                    />
                    <Metric
                      label="Outstanding"
                      value={money(i < 3 ? 20000 : i === 3 ? 10000 : 0)}
                      tone="orange"
                    />
                  </Row>
                  <Row>
                    <Badge label="Cash Payment" tone="green" small />
                    <Badge label="Credit Applied" tone="blue" small />
                    <Badge label="Goods Offset" tone="orange" small />
                  </Row>
                  <TransactionRow
                    title="Transaction Note"
                    subtitle="Rent collection with partial credit settlement"
                    amount={10000}
                    onPress={() => go("reverse-transaction", shop.id)}
                  />
                </View>
              )}
            </View>
          ))}
      </Card>
      <Button
        title="Collect Payment"
        icon="Banknote"
        onPress={() => go("collect-rent", shop.id)}
      />
    </Page>
  );
}

export function ShopFinancialReportScreen({ shopId = 1 }: { shopId?: number }) {
  const { c, notify } = useUI();
  const shop = useShop(shopId);
  const go = useGo();
  const [range, setRange] = useState("This Month");
  return (
    <Page
      title="Shop Financial Report"
      help
      footer={
        <Button
          title="Export CSV"
          icon="FileDown"
          onPress={() =>
            notify("CSV export is not connected to a production ledger yet.")
          }
        />
      }
    >
      <ShopIdentity shop={shop} />
      <Row>
        <T size={10} color={c.sub} style={{ flex: 1 }}>
          March 1, 2026 – March 31, 2026
        </T>
        <Chips
          options={["This Month", "Last Month", "Custom"]}
          selected={range}
          onSelect={setRange}
        />
      </Row>
      <Row>
        <Metric label="Expected Rent" value={money(12000)} icon="Wallet" />
        <Metric
          label="Paid Rent"
          value={money(12000)}
          icon="CircleCheck"
          tone="green"
        />
      </Row>
      <Row>
        <Metric
          label="Credits Applied"
          value={money(22000)}
          icon="CreditCard"
          tone="purple"
        />
        <Metric
          label="Goods Offsets"
          value={money(12000)}
          icon="Package"
          tone="orange"
        />
      </Row>
      <Card tone="red">
        <Row>
          <IconTile name="FileWarning" tone="red" />
          <View style={{ flex: 1 }}>
            <T size={11}>Outstanding Amount</T>
            <T size={23} weight="bold" color={c.red}>
              {money(0)}
            </T>
            <T size={10} color={c.sub}>
              All dues cleared
            </T>
          </View>
          <Icon name="CircleCheck" color={c.red} />
        </Row>
      </Card>
      <Card>
        <Section title="Monthly Financial Flow" action="Last 6 Months">
          <BarChart />
        </Section>
      </Card>
      <Card>
        <Section title="Transaction History" action="All Transactions">
          {[
            {
              title: "Rent Payment",
              amount: 12000,
              icon: "Wallet",
              tone: "teal",
            },
            {
              title: "Credit Applied",
              amount: 22000,
              icon: "CreditCard",
              tone: "blue",
            },
            {
              title: "Goods Taken",
              amount: 12000,
              icon: "Package",
              tone: "orange",
            },
            {
              title: "Opening Balance",
              amount: 22000,
              icon: "FileText",
              tone: "purple",
            },
          ].map((tx, i) => (
            <TransactionRow
              key={tx.title}
              title={tx.title}
              subtitle={`Mar ${15 - i * 3}, 2026 · ${i === 0 ? "Cash received" : "Noncash ledger entry"}`}
              amount={tx.amount}
              icon={tx.icon as IconName}
              tone={tx.tone as "teal"}
              onPress={() => go("reverse-transaction", shop.id)}
            />
          ))}
        </Section>
      </Card>
    </Page>
  );
}

export function TenancyScreen({ shopId = 1 }: { shopId?: number }) {
  const { c, notify } = useUI();
  const shop = useShop(shopId);
  const update = usePreviewLedger((s) => s.updateShop);
  const [rent, setRent] = useState("15000");
  const [effective, setEffective] = useState("2026-04-01");
  const [endDate, setEndDate] = useState("2026-03-31");
  const [vacant, setVacant] = useState(false);
  const [prorate, setProrate] = useState(true);
  const [archive, setArchive] = useState(true);
  const go = useGo();
  return (
    <Page
      title="Tenancy Lifecycle"
      subtitle="Manage tenancy changes for your shop"
      help
      footer={
        <Button
          title="Save Changes"
          icon="CircleCheck"
          onPress={() => {
            const n = Number(rent);
            if (!Number.isSafeInteger(n) || n <= 0)
              return notify("Enter a positive whole-AFN rent.");
            update(shop.id, { rent: n, occupied: !vacant });
            notify(
              "Shop updated in the preview ledger. Effective-date accounting is not connected yet.",
            );
          }}
        />
      }
    >
      <ShopIdentity shop={shop} />
      <FormSection
        title="1. Change Monthly Rent"
        subtitle="Update the rent amount for this tenancy"
        icon="Wallet"
      >
        <Row>
          <Field label="Current Rent" value={number(shop.rent)} readOnly />
          <Icon name="ArrowRight" color={c.sub} />
          <Field
            label="New Rent"
            value={rent}
            onChangeText={setRent}
            numeric
            suffix="AFN"
            required
          />
        </Row>
      </FormSection>
      <FormSection
        title="2. New Rent Effective Date"
        subtitle="Select when the new rent should start"
        icon="CalendarDays"
      >
        <Field
          label="Effective Date"
          value={effective}
          onChangeText={setEffective}
          icon="CalendarDays"
        />
        <Info text="Existing charges stay unchanged. A mid-month change is prorated using both rates." />
      </FormSection>
      <Row style={{ alignItems: "stretch" }}>
        <Card style={{ flex: 1, gap: 8 }}>
          <T weight="semibold" size={12}>
            3. End Tenancy
          </T>
          <Field label="End Date" value={endDate} onChangeText={setEndDate} />
          <Info
            text="Unpaid rent is retained in the final settlement."
            tone="red"
          />
        </Card>
        <Card style={{ flex: 1, gap: 8 }}>
          <T weight="semibold" size={12}>
            4. Mark Shop Vacant
          </T>
          <ToggleRow
            title="Mark as Vacant"
            value={vacant}
            onChange={setVacant}
            icon="House"
          />
          <T size={10} color={c.sub}>
            No new rent is charged after the departure date.
          </T>
        </Card>
      </Row>
      <Card>
        <Section title="5. Final Settlement">
          <Row>
            <View style={{ flex: 1 }}>
              <SummaryLine label="Outstanding Rent" value={money(12000)} />
              <SummaryLine label="Construction Credit" value={money(20000)} />
              <SummaryLine label="Other Credits" value={money(0)} />
            </View>
            <Metric
              label="Amount to Settle"
              value={money(8000)}
              tone="teal"
              icon="UserRound"
            />
          </Row>
        </Section>
      </Card>
      <Card tone="teal">
        <ToggleRow
          title="6. Mid-Month Proration"
          subtitle="Apply prorated calculations to opening and closing months"
          value={prorate}
          onChange={setProrate}
          icon="Percent"
        />
      </Card>
      <Row style={{ alignItems: "stretch" }}>
        <Card style={{ flex: 1, gap: 9 }}>
          <T size={12} weight="semibold">
            7. Archive Previous Tenancy
          </T>
          <Row>
            <Check
              checked={archive}
              label="Archive tenancy history"
              onPress={() => setArchive(!archive)}
            />
            <T size={10}>Archive tenancy history</T>
          </Row>
          <T size={9} color={c.sub}>
            Keep all financial records available.
          </T>
        </Card>
        <Card style={{ flex: 1, gap: 9 }}>
          <T size={12} weight="semibold">
            8. Assign New Shopkeeper
          </T>
          <T size={9} color={c.sub}>
            Start a new tenancy after closing this one.
          </T>
          <Button
            title="Assign New Shopkeeper"
            icon="Plus"
            variant="outline"
            compact
            onPress={() => go("add-shop")}
          />
        </Card>
      </Row>
    </Page>
  );
}

export function MonthClosingScreen() {
  const { c, notify } = useUI();
  const [month, setMonth] = useState("March 2026");
  const [reviewed, setReviewed] = useState(false);
  const [closed, setClosed] = useState(false);
  return (
    <Page
      title="Month Closing"
      subtitle="Review and close your monthly records"
      help
    >
      <Card>
        <Row>
          <IconTile name="CalendarDays" />
          <Select
            label="Select Month"
            value={month}
            options={["March 2026", "February 2026", "January 2026"]}
            onChange={setMonth}
          />
          <Badge
            label={closed ? "Closed" : "Ready to Close"}
            tone={closed ? "muted" : "green"}
            small
          />
        </Row>
      </Card>
      <Card>
        <Section
          title="Financial Reconciliation Summary"
          action="View Details"
          onPress={() =>
            notify("Reference figures shown for the visual preview.")
          }
        >
          <Row>
            <Metric
              label="Total Cash Collected"
              value={money(268000)}
              tone="green"
              icon="Wallet"
            />
            <Metric
              label="Total Expenses"
              value={money(92500)}
              tone="red"
              icon="Receipt"
            />
          </Row>
          <Row>
            <Metric
              label="Goods Taken From Shops"
              value={money(12000)}
              tone="orange"
              icon="Package"
            />
            <Metric
              label="Net Cash Flow"
              value={money(175500)}
              tone="teal"
              icon="ChartNoAxesColumnIncreasing"
            />
          </Row>
        </Section>
      </Card>
      <Card>
        <Section title="Outstanding & Unsettled Items" action="View All">
          <Row>
            <Metric label="Outstanding Rent" value={money(152000)} tone="red" />
            <Metric
              label="Unsettled Goods"
              value={money(25000)}
              tone="orange"
            />
            <Metric label="Unused Credits" value={money(22000)} tone="blue" />
          </Row>
        </Section>
      </Card>
      <Card>
        <Section title="Pre-Closing Checklist">
          {[
            "All rent collections recorded",
            "All expenses recorded",
            "Goods taken from shops recorded",
            "Review outstanding balances",
            "Verify reports",
          ].map((title) => (
            <Row key={title} style={{ paddingVertical: 4 }}>
              <Icon name="CircleCheck" size={17} color={c.green} />
              <View style={{ flex: 1 }}>
                <T size={11} weight="medium">
                  {title}
                </T>
                <T size={9} color={c.sub}>
                  Review complete in this sample month
                </T>
              </View>
              <Badge label="Complete" small />
            </Row>
          ))}
          <Row>
            <Check
              checked={reviewed}
              label="Review validation warnings"
              onPress={() => setReviewed(!reviewed)}
            />
            <View style={{ flex: 1 }}>
              <T size={11} weight="medium">
                Review validation warnings
              </T>
              <T size={9} color={c.sub}>
                Outstanding rent can still be paid after closing.
              </T>
            </View>
            <Badge
              label={reviewed ? "Reviewed" : "1 warning"}
              tone={reviewed ? "green" : "orange"}
              small
            />
          </Row>
        </Section>
      </Card>
      <Info
        title="Outstanding rent is carried forward"
        text="Closing locks this month's charges and dated transactions. Later-dated payments can still settle its unpaid rent."
        tone="orange"
      />
      <Button
        title={closed ? "Reopen Month" : "Close Month"}
        icon={closed ? "LockOpen" : "LockKeyhole"}
        disabled={!reviewed}
        onPress={() => {
          setClosed(!closed);
          notify(
            closed
              ? "Month reopened in the visual preview."
              : "Month closed in the visual preview. Production locks are not connected yet.",
          );
        }}
      />
      <Card>
        <Row>
          <Icon name="History" />
          <View>
            <T size={12} weight="semibold">
              Closed Months (Controlled)
            </T>
            <T size={10} color={c.sub}>
              You can reopen a closed month if needed.
            </T>
          </View>
        </Row>
      </Card>
    </Page>
  );
}

export function ReverseTransactionScreen({ shopId = 2 }: { shopId?: number }) {
  const { c, notify } = useUI();
  const shop = useShop(shopId);
  const [visible, setVisible] = useState(true);
  const [reason, setReason] = useState("Incorrect Amount Entered");
  const [note, setNote] = useState("Entered AFN 25,000 instead of AFN 20,000.");
  return (
    <Page
      title="Transaction Details"
      subtitle="View and manage this transaction"
    >
      <ShopIdentity shop={shop} />
      <Card tone="green">
        <Row>
          <View style={{ flex: 1 }}>
            <T size={11} color={c.sub}>
              Paid Amount
            </T>
            <T size={27} weight="bold" color={c.green}>
              {money(25000)}
            </T>
          </View>
          <Badge label="Rent Payment" icon="Banknote" />
        </Row>
      </Card>
      <Card>
        <Section title="Balance Summary">
          <Row>
            <Metric label="Balance Before" value={money(52000)} tone="muted" />
            <Metric label="This Payment" value={money(25000)} tone="green" />
            <Metric label="New Balance" value={money(27000)} tone="blue" />
          </Row>
        </Section>
      </Card>
      <Card>
        <SummaryLine label="Payment Date" value="March 5, 2026" />
        <SummaryLine label="Payment Method" value="Cash" />
        <SummaryLine label="Status" value="Posted" />
      </Card>
      <Button
        title="Reverse Transaction"
        icon="Undo2"
        variant="danger"
        onPress={() => setVisible(true)}
      />
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#0a1b354d",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 480,
              backgroundColor: c.surface,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              padding: 18,
              gap: 14,
              paddingBottom: 25,
            }}
          >
            <Row>
              <IconTile name="Undo2" tone="red" size={38} />
              <View style={{ flex: 1 }}>
                <T weight="bold" size={17}>
                  Reverse This Transaction
                </T>
                <T size={10} color={c.sub}>
                  This creates a reversal entry. The original record stays in
                  history.
                </T>
              </View>
              <IconButton
                name="X"
                label="Close reversal"
                onPress={() => setVisible(false)}
                size={29}
              />
            </Row>
            <ShopIdentity shop={shop} />
            <Select
              label="Reversal Reason *"
              value={reason}
              options={[
                "Incorrect Amount Entered",
                "Duplicate Payment",
                "Wrong Shopkeeper",
                "Other",
              ]}
              onChange={setReason}
            />
            <Field
              label="Additional Notes (Optional)"
              value={note}
              onChangeText={setNote}
              multiline
            />
            <Info
              title="A reversal entry will be created"
              text="The original payment remains visible, linked to the reversal. This preview does not modify a production ledger."
            />
            <Row>
              <Button
                title="Cancel"
                onPress={() => setVisible(false)}
                variant="outline"
                style={{ flex: 1 }}
              />
              <Button
                title="Reverse Transaction"
                icon="Undo2"
                variant="danger"
                onPress={() => {
                  setVisible(false);
                  notify(
                    "Reversal form reviewed. Audited ledger posting is not connected yet.",
                  );
                }}
                style={{ flex: 1.6 }}
              />
            </Row>
          </View>
        </View>
      </Modal>
    </Page>
  );
}

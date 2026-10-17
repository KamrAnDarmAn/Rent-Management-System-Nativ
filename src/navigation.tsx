import React from "react";
import { View, Pressable, Platform } from "react-native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { RootStackParams, ScreenId, TabId } from "./types";
import { Icon, IconName, Row, T, UIContext, dark, useUI } from "./ui";
import {
  CollectScreen,
  ShopsScreen,
  SpendScreen,
  ReportsScreen,
  SettingsScreen,
  ScreenGallery,
} from "./screens/main";
import {
  AddExpenseScreen,
  AddShopScreen,
  SetupPropertyScreen,
  ApplyCreditScreen,
  CollectRentScreen,
  GoodsSettlementScreen,
  GoodsTakenScreen,
} from "./screens/forms";
import {
  ConstructionCreditScreen,
  MonthClosingScreen,
  RentHistoryScreen,
  ReverseTransactionScreen,
  ShopDetailsScreen,
  ShopFinancialReportScreen,
  ShopkeeperScreen,
  TenancyScreen,
} from "./screens/details";
import {
  BackupScreen,
  DeviceTransferScreen,
  LanguageScreen,
  RemindersScreen,
} from "./screens/preferences";
import {
  DesignSystemScreen,
  EmptyStatesScreen,
  ErrorStatesScreen,
  WelcomeScreen,
} from "./screens/variants";

const Stack = createNativeStackNavigator<RootStackParams>();
const Tabs = createBottomTabNavigator();
const tabItems: { id: TabId; label: string; icon: IconName }[] = [
  { id: "collect", label: "Collect", icon: "House" },
  { id: "spend", label: "Spend", icon: "Wallet" },
  { id: "shops", label: "Shops", icon: "Store" },
  { id: "reports", label: "Reports", icon: "ChartNoAxesColumnIncreasing" },
  { id: "settings", label: "Settings", icon: "Settings" },
];
export const isTab = (id: string): id is TabId =>
  tabItems.some((t) => t.id === id);

function BottomBar({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: TabId) => void;
}) {
  const { c, rtl } = useUI();
  const insets = useSafeAreaInsets();
  return (
    <Row
      gap={0}
      style={{
        flexDirection: rtl ? "row-reverse" : "row",
        backgroundColor: c.surface,
        paddingTop: 6,
        paddingHorizontal: 8,
        paddingBottom: Math.max(Platform.OS === "web" ? 9 : 4, insets.bottom),
        borderTopWidth: 1,
        borderTopColor: c.border,
        minHeight: 65,
      }}
    >
      {tabItems.map((tab) => (
        <Pressable
          key={tab.id}
          accessibilityRole="tab"
          accessibilityLabel={tab.label}
          accessibilityState={{ selected: selected === tab.id }}
          onPress={() => onSelect(tab.id)}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 13,
            gap: 4,
            paddingVertical: 7,
            minHeight: 48,
            backgroundColor: selected === tab.id ? c.teal : "transparent",
          }}
        >
          <Icon
            name={tab.icon}
            color={selected === tab.id ? c.primary : c.sub}
            size={23}
            strokeWidth={selected === tab.id ? 2.5 : 1.9}
          />
          <T
            size={10}
            weight={selected === tab.id ? "semibold" : "medium"}
            color={selected === tab.id ? c.primary : c.sub}
          >
            {tab.label}
          </T>
        </Pressable>
      ))}
    </Row>
  );
}
function TabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <BottomBar
      selected={state.routes[state.index].name}
      onSelect={(id) => {
        const event = navigation.emit({
          type: "tabPress",
          target: state.routes.find((r) => r.name === id)?.key,
          canPreventDefault: true,
        });
        if (!event.defaultPrevented) navigation.navigate(id);
      }}
    />
  );
}
function TabNavigator({ initial = "collect" }: { initial?: TabId }) {
  return (
    <Tabs.Navigator
      initialRouteName={initial}
      screenOptions={{ headerShown: false, lazy: true, animation: "none" }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="collect" component={CollectScreen} />
      <Tabs.Screen name="spend" component={SpendScreen} />
      <Tabs.Screen name="shops" component={ShopsScreen} />
      <Tabs.Screen name="reports" component={ReportsScreen} />
      <Tabs.Screen name="settings" component={SettingsScreen} />
    </Tabs.Navigator>
  );
}

function ScreenContent({ id, shopId }: { id: ScreenId; shopId?: number }) {
  switch (id) {
    case "collect":
    case "dark-theme":
    case "pashto-home":
      return <CollectScreen />;
    case "spend":
      return <SpendScreen />;
    case "shops":
      return <ShopsScreen />;
    case "reports":
      return <ReportsScreen />;
    case "settings":
      return <SettingsScreen />;
    case "add-shop":
      return <AddShopScreen />;
    case "setup-property":
      return <SetupPropertyScreen />;
    case "collect-rent":
      return <CollectRentScreen shopId={shopId} />;
    case "apply-credit":
      return <ApplyCreditScreen shopId={shopId} />;
    case "add-expense":
      return <AddExpenseScreen />;
    case "goods-taken":
      return <GoodsTakenScreen shopId={shopId} />;
    case "goods-settlement":
      return <GoodsSettlementScreen shopId={shopId} />;
    case "shop-details":
      return <ShopDetailsScreen shopId={shopId} />;
    case "shopkeeper":
      return <ShopkeeperScreen shopId={shopId} />;
    case "construction-credit":
      return <ConstructionCreditScreen shopId={shopId} />;
    case "rent-history":
      return <RentHistoryScreen shopId={shopId} />;
    case "shop-financial-report":
      return <ShopFinancialReportScreen shopId={shopId} />;
    case "tenancy-lifecycle":
      return <TenancyScreen shopId={shopId} />;
    case "month-closing":
      return <MonthClosingScreen />;
    case "reverse-transaction":
      return <ReverseTransactionScreen shopId={shopId} />;
    case "language":
      return <LanguageScreen />;
    case "reminders":
      return <RemindersScreen />;
    case "backup-restore":
      return <BackupScreen />;
    case "device-transfer":
      return <DeviceTransferScreen />;
    case "splash":
      return <WelcomeScreen splash />;
    case "get-started":
      return <WelcomeScreen />;
    case "empty-states":
      return <EmptyStatesScreen />;
    case "error-states":
      return <ErrorStatesScreen />;
    case "design-system":
      return <DesignSystemScreen />;
    case "screen-gallery":
      return <ScreenGallery />;
  }
}

function ScreenRoute({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParams, "Screen">) {
  const ui = useUI();
  const { id, shopId } = route.params;
  const override = {
    ...ui,
    c: id === "dark-theme" ? dark : ui.c,
    rtl: id === "pashto-home" ? true : ui.rtl,
    language: id === "pashto-home" ? "ps" : ui.language,
  };
  const withTabs =
    isTab(id) ||
    [
      "dark-theme",
      "pashto-home",
      "rent-history",
      "reminders",
      "backup-restore",
      "month-closing",
      "empty-states",
      "error-states",
    ].includes(id);
  return (
    <UIContext.Provider value={override}>
      <View style={{ flex: 1, backgroundColor: override.c.bg }}>
        <ScreenContent key={`${id}-${shopId ?? ""}`} id={id} shopId={shopId} />
        {withTabs && (
          <BottomBar
            selected={
              isTab(id)
                ? id
                : ["dark-theme", "pashto-home", "empty-states"].includes(id)
                  ? "collect"
                  : id === "rent-history"
                    ? "reports"
                    : "settings"
            }
            onSelect={(screen) => navigation.navigate("Tabs", { screen })}
          />
        )}
      </View>
    </UIContext.Provider>
  );
}

export function AppNavigator({ initial }: { initial?: ScreenId }) {
  return (
    <Stack.Navigator
      initialRouteName={initial && !isTab(initial) ? "Screen" : "Tabs"}
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="Tabs">
        {() => (
          <TabNavigator
            initial={initial && isTab(initial) ? initial : "collect"}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Screen"
        component={ScreenRoute}
        initialParams={{ id: initial ?? "screen-gallery" }}
      />
    </Stack.Navigator>
  );
}

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CollectScreen } from "../screens/collect/CollectScreen";
import { SpendScreen } from "../screens/expenses/SpendScreen";
import { ReportsScreen } from "../screens/reports/ReportsScreen";
import { SettingsScreen } from "../screens/settings/SettingsScreen";
import { ShopsScreen } from "../screens/shops/ShopsScreen";
import { TabBar } from "./BottomBar";
import { type TabId } from "./types";

const Tabs = createBottomTabNavigator();

export function TabNavigator({ initial = "collect" }: { initial?: TabId }) {
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

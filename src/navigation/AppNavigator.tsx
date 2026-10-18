import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { isTab } from "./config";
import { ScreenRoute } from "./ScreenRoute";
import { TabNavigator } from "./TabNavigator";
import { type RootStackParams, type ScreenId } from "./types";

const Stack = createNativeStackNavigator<RootStackParams>();

export function AppNavigator({
  initial,
  onboarding = false,
}: {
  initial?: ScreenId;
  onboarding?: boolean;
}) {
  return (
    <Stack.Navigator
      initialRouteName={initial && !isTab(initial) ? "Screen" : "Tabs"}
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      {!onboarding && (
        <Stack.Screen name="Tabs">
          {() => (
            <TabNavigator
              initial={initial && isTab(initial) ? initial : "collect"}
            />
          )}
        </Stack.Screen>
      )}
      <Stack.Screen
        name="Screen"
        getId={({ params }) => `${params.id}:${params.shopId ?? "default"}`}
        component={ScreenRoute}
        initialParams={{ id: initial ?? "screen-gallery" }}
      />
    </Stack.Navigator>
  );
}

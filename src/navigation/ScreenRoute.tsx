import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View } from "react-native";
import { dark } from "../components/theme/palette";
import { UIContext, useUI } from "../components/theme/UIContext";
import { BottomBar } from "./BottomBar";
import { isTab } from "./config";
import { ScreenContent } from "./ScreenContent";
import { type RootStackParams } from "./types";
import { useLedger } from "../store/ledgerStore";

export function ScreenRoute({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParams, "Screen">) {
  const ui = useUI();
  const setupComplete = useLedger((s) => s.setupComplete);
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
        {withTabs && setupComplete && (
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

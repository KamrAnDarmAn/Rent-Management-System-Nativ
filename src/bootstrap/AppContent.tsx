import { StorageRecovery } from "./StorageRecovery";
import { ReminderScheduler } from "./ReminderScheduler";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { T } from "../components/typography/T";
import { Button } from "../components/buttons/Button";
import { openLedger } from "../storage/database";
import { useLedger } from "../store/ledgerStore";
import { usePreferences } from "../store/preferencesStore";
import { Logo } from "../components/branding/Logo";
import { Toast } from "../components/feedback/Toast";
import { navigationTheme } from "../components/theme/navigationTheme";
import { dark } from "../components/theme/palette";
import { useUI } from "../components/theme/UIContext";
import { useAppFonts } from "../hooks/useAppFonts";
import { AppNavigator } from "../navigation/AppNavigator";
import { AppShell } from "./AppShell";
import { initialScreen } from "./initialScreen";

export function AppContent() {
  const [loaded, fontError] = useAppFonts();
  const [initial] = useState(initialScreen);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const setupComplete = useLedger((s) => s.setupComplete);
  const { c, rtl } = useUI();
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await usePreferences.persist.rehydrate();
        const data = await openLedger();
        if (active) {
          useLedger.getState().hydrate(data);
          setReady(true);
          setError(false);
        }
      } catch (error) {
        console.error("GMM storage initialization failed");
        if (active) setError(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [attempt]);
  return (
    <AppShell>
      <StatusBar style={c === dark ? "light" : "dark"} />
      {(!loaded && !fontError) || !ready ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 15,
          }}
        >
          <Logo size={72} />
          <T size={24} weight="bold">
            GMM
          </T>
          {error ? (
            <StorageRecovery
              retry={() => {
                setError(false);
                setAttempt((n) => n + 1);
              }}
              onRestored={(data) => {
                useLedger.getState().hydrate(data);
                setReady(true);
                setError(false);
              }}
            />
          ) : (
            <ActivityIndicator color={c.primary} />
          )}
        </View>
      ) : (
        <NavigationContainer
          key={setupComplete ? "ledger" : "setup"}
          direction={rtl ? "rtl" : "ltr"}
          theme={navigationTheme(c)}
        >
          <AppNavigator
            initial={setupComplete ? initial : "get-started"}
            onboarding={!setupComplete}
          />
        </NavigationContainer>
      )}
      {ready && setupComplete && <ReminderScheduler />}
      <Toast />
    </AppShell>
  );
}

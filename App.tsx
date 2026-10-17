import "./src/global.css";
import "./src/i18n";
import React, { useEffect, useMemo, useState } from "react";
import { View, useColorScheme, Platform, Pressable } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  DefaultTheme,
  DarkTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { AppNavigator } from "./src/navigation";
import { UIContext, light, dark, T, Logo } from "./src/ui";
import { usePreferences } from "./src/store";
import { ScreenId } from "./src/types";
import { screenReferences } from "./src/data";

function initialScreen(): ScreenId | undefined {
  if (Platform.OS !== "web") return undefined;
  const value = new URLSearchParams(globalThis.location?.search).get("screen");
  return value &&
    (value === "screen-gallery" || screenReferences.some((s) => s.id === value))
    ? (value as ScreenId)
    : undefined;
}
export default function App() {
  const [loaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const preferences = usePreferences();
  const system = useColorScheme();
  const [toast, setToast] = useState("");
  const [initial] = useState(initialScreen);
  const isDark =
    preferences.theme === "dark" ||
    (preferences.theme === "system" && system === "dark");
  const c = isDark ? dark : light;
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5500);
    return () => clearTimeout(timer);
  }, [toast]);
  const context = useMemo(
    () => ({
      c,
      rtl: preferences.language === "ps",
      language: preferences.language,
      notify: setToast,
    }),
    [c, preferences.language],
  );
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <UIContext.Provider value={context}>
          <View
            className="flex-1"
            style={{
              flex: 1,
              alignItems: "center",
              backgroundColor: "#eaf1f4",
            }}
          >
            <View
              style={{
                width: "100%",
                maxWidth: Platform.OS === "web" ? 480 : undefined,
                flex: 1,
                backgroundColor: c.bg,
                boxShadow:
                  Platform.OS === "web" ? "0 0 60px #113c4912" : undefined,
              }}
            >
              <StatusBar style={isDark ? "light" : "dark"} />
              {!loaded && !fontError ? (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 15,
                  }}
                >
                  <Logo size={72} />
                </View>
              ) : (
                <NavigationContainer
                  direction={preferences.language === "ps" ? "rtl" : "ltr"}
                  theme={{
                    ...(isDark ? DarkTheme : DefaultTheme),
                    colors: {
                      ...(isDark ? DarkTheme : DefaultTheme).colors,
                      primary: c.primary,
                      background: c.bg,
                      card: c.surface,
                      text: c.text,
                      border: c.border,
                    },
                  }}
                >
                  <AppNavigator initial={initial} />
                </NavigationContainer>
              )}
              {toast ? (
                <Pressable
                  accessibilityRole="alert"
                  onPress={() => setToast("")}
                  style={{
                    position: "absolute",
                    bottom: 82,
                    left: 16,
                    right: 16,
                    backgroundColor: isDark ? "#dcf8f2" : "#103f3d",
                    padding: 14,
                    borderRadius: 12,
                    boxShadow: "0 5px 20px #0002",
                    zIndex: 1000,
                  }}
                >
                  <T size={12} color={isDark ? "#103f3d" : "#fff"}>
                    {toast}
                  </T>
                </Pressable>
              ) : null}
            </View>
          </View>
        </UIContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

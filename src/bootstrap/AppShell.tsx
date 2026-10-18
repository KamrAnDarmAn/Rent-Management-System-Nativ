import React from "react";
import { Platform, View } from "react-native";
import { useUI } from "../components/theme/UIContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { c } = useUI();
  return (
    <View
      className="flex-1"
      style={{ flex: 1, alignItems: "center", backgroundColor: "#eaf1f4" }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: Platform.OS === "web" ? 480 : undefined,
          flex: 1,
          backgroundColor: c.bg,
          boxShadow: Platform.OS === "web" ? "0 0 60px #113c4912" : undefined,
        }}
      >
        {children}
      </View>
    </View>
  );
}

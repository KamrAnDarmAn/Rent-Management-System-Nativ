import * as NativeSplash from "expo-splash-screen";
import { Platform } from "react-native";
import { AppContent } from "./src/bootstrap/AppContent";
import { AppProviders } from "./src/bootstrap/AppProviders";
import "./src/global.css";
import "./src/i18n";

if (Platform.OS !== "web") {
  NativeSplash.setOptions({ fade: true, duration: 150 });
  void NativeSplash.preventAutoHideAsync().catch(() => {});
}

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

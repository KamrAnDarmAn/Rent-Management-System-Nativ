import { Component, type ReactNode } from "react";
import { Platform, ScrollView, View } from "react-native";
import * as NativeSplash from "expo-splash-screen";
import { Button } from "../components/buttons/Button";
import { useUI } from "../components/theme/UIContext";
import { T } from "../components/typography/T";

export class AppErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    // Never log ledger contents or exception messages containing private data.
    console.error("GMM screen rendering failed");
    if (Platform.OS !== "web") void NativeSplash.hideAsync().catch(() => {});
  }

  render() {
    return this.state.failed ? (
      <RenderRecovery onRetry={() => this.setState({ failed: false })} />
    ) : (
      this.props.children
    );
  }
}

function RenderRecovery({ onRetry }: { onRetry: () => void }) {
  const { c } = useUI();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
      }}
    >
      <View
        style={{ alignSelf: "center", width: "100%", maxWidth: 440, gap: 16 }}
      >
        <T size={24} weight="bold">
          GMM
        </T>
        <T size={20} weight="semibold">
          Unable to display this screen
        </T>
        <T size={16}>
          Try again to reopen your saved ledger. This does not delete or reset
          your data.
        </T>
        <Button title="Try Again" onPress={onRetry} />
      </View>
    </ScrollView>
  );
}

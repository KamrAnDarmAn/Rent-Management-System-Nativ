import { useEffect, useState } from "react";
import { Image, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useText } from "../../hooks/useText";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";
import { SplashBackdrop } from "./splash/SplashBackdrop";
import { SplashSpinner } from "./splash/SplashSpinner";

export const splashAssets = {
  logo: require("../../../assets/images/logos/logo.png"),
  shop: require("../../../assets/images/spalsh-screen-background.png"),
};

/** The same composition is used during startup and in the design preview. */
export function SplashScreen({
  animate = true,
  onReady,
}: {
  animate?: boolean;
  onReady?: () => void;
}) {
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { language } = useUI();
  const t = useText();
  const [width, setWidth] = useState(Math.min(window.width, 480));
  const [logoReady, setLogoReady] = useState(false);
  const [shopReady, setShopReady] = useState(false);
  const scale = width / 390;
  useEffect(() => {
    if (logoReady && shopReady) onReady?.();
  }, [logoReady, shopReady, onReady]);
  return (
    <View
      testID="splash-screen"
      accessibilityLabel={t("Shop Rent Manager")}
      style={{
        flex: 1,
        backgroundColor: "#f7fcff",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        alignItems: "center",
      }}
    >
      <View
        style={{ flex: 1, width: "100%", maxWidth: 480, overflow: "hidden" }}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      >
        <SplashBackdrop />
        <View
          style={[
            styles.logo,
            {
              width: 130 * scale,
              height: 130 * scale,
              marginLeft: -65 * scale,
            },
          ]}
        >
          <Image
            source={splashAssets.logo}
            accessible={false}
            resizeMode="contain"
            onLoadEnd={() => setLogoReady(true)}
            style={{
              width: "100%",
              height: "100%",
              transform: [{ scale: 1.31 }],
            }}
          />
        </View>
        <View
          style={[
            styles.heading,
            {
              paddingHorizontal: 8 * scale,
              ...(language === "ps" ? { top: "32%" as const } : {}),
            },
          ]}
        >
          <T
            size={(language === "ps" ? 28 : 33.2) * scale}
            weight="bold"
            color="#0a172d"
            style={{
              textAlign: "center",
              letterSpacing: language === "ps" ? 0 : -1.3 * scale,
              lineHeight: (language === "ps" ? 42 : 40) * scale,
            }}
          >
            Shop Rent Manager
          </T>
        </View>
        <View style={styles.subtitle}>
          <T
            size={16.4 * scale}
            color="#7489a7"
            style={{
              textAlign: "center",
              lineHeight: (language === "ps" ? 28 : 25) * scale,
            }}
          >
            Simple. Organized. Always in Control.
          </T>
        </View>
        <Image
          source={splashAssets.shop}
          accessible={false}
          onLoadEnd={() => setShopReady(true)}
          resizeMode="stretch"
          style={styles.shop}
        />
        <View
          accessibilityRole="progressbar"
          accessibilityLabel={t("Loading...")}
          style={styles.loading}
        >
          <SplashSpinner size={46 * scale} animate={animate} />
          <T
            size={(language === "ps" ? 17 : 15) * scale}
            color="#7589a7"
            style={{
              marginTop: 10 * scale,
              textAlign: "center",
              lineHeight: (language === "ps" ? 28 : 23) * scale,
            }}
          >
            Loading...
          </T>
        </View>
        <View
          style={[
            styles.footer,
            { gap: 12 * scale, paddingHorizontal: 47 * scale },
          ]}
        >
          <View style={styles.rule} />
          <T
            size={(language === "ps" ? 14 : 12) * scale}
            color="#7489a7"
            style={{
              textAlign: "center",
              lineHeight: 19 * scale,
              flexShrink: 1,
            }}
          >
            Manage Shops · Grow Peacefully
          </T>
          <View style={styles.rule} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { position: "absolute", top: "14.9%", left: "50%" },
  heading: { position: "absolute", top: "32.9%", width: "100%" },
  subtitle: {
    position: "absolute",
    top: "38.3%",
    width: "100%",
    paddingHorizontal: 8,
  },
  shop: {
    position: "absolute",
    top: "44.5%",
    left: "-2.3%",
    width: "104.6%",
    height: "30.7%",
    opacity: 0.88,
  },
  loading: {
    position: "absolute",
    top: "78.7%",
    width: "100%",
    alignItems: "center",
  },
  footer: {
    position: "absolute",
    top: "94.7%",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  rule: { height: 1, backgroundColor: "#d8e7ee", flex: 1 },
});

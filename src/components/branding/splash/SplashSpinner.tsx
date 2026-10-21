import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing } from "react-native";
import Svg, { Circle } from "react-native-svg";

export function SplashSpinner({
  size,
  animate,
}: {
  size: number;
  animate: boolean;
}) {
  const rotation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let active = true;
    let animation: Animated.CompositeAnimation | undefined;
    const update = (reduceMotion: boolean) => {
      animation?.stop();
      rotation.setValue(0);
      if (!active || !animate || reduceMotion) return;
      animation = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 1150,
          easing: Easing.linear,
          useNativeDriver: true,
          isInteraction: false,
        }),
      );
      animation.start();
    };
    void AccessibilityInfo.isReduceMotionEnabled()
      .then(update)
      .catch(() => update(false));
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      update,
    );
    return () => {
      active = false;
      animation?.stop();
      subscription.remove();
    };
  }, [animate, rotation]);
  return (
    <Animated.View
      accessible={false}
      style={{
        width: size,
        height: size,
        transform: [
          {
            rotate: rotation.interpolate({
              inputRange: [0, 1],
              outputRange: ["0deg", "360deg"],
            }),
          },
        ],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 46 46">
        <Circle
          cx="23"
          cy="23"
          r="20"
          fill="none"
          stroke="#dce9ef"
          strokeWidth="4.6"
        />
        <Circle
          cx="23"
          cy="23"
          r="20"
          fill="none"
          stroke="#079c94"
          strokeWidth="4.6"
          strokeLinecap="round"
          strokeDasharray="40 126"
          rotation="-90"
          origin="23,23"
        />
      </Svg>
    </Animated.View>
  );
}

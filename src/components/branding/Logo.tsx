import { Image, View } from "react-native";

export function Logo({ size = 42 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        overflow: "hidden",
      }}
    >
      <Image
        source={require("../../../assets/images/logos/logo.png")}
        accessible={false}
        resizeMode="contain"
        style={{
          width: "100%",
          height: "100%",
          // The source includes transparent padding around the mark.
          transform: [{ scale: 1.25 }],
        }}
      />
    </View>
  );
}

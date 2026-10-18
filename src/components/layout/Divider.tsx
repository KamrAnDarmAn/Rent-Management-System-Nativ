import { View } from "react-native";
import { useUI } from "../theme/UIContext";

export function Divider() {
  const { c } = useUI();
  return (
    <View style={{ height: 1, backgroundColor: c.border, marginVertical: 7 }} />
  );
}

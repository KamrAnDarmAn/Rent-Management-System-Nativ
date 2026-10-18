import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { type RootStackParams, type ScreenId } from "../navigation/types";

export function useGo() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParams>>();
  return (id: ScreenId, shopId?: number) =>
    navigation.navigate("Screen", { id, shopId });
}

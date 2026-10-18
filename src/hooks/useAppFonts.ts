import { fontFamilies } from "../components/theme/typography";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { useFonts } from "expo-font";

export function useAppFonts() {
  return useFonts({
    [fontFamilies.regular]: Inter_400Regular,
    [fontFamilies.medium]: Inter_500Medium,
    [fontFamilies.semibold]: Inter_600SemiBold,
    [fontFamilies.bold]: Inter_700Bold,
  });
}

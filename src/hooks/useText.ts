import { useUI } from "../components/theme/UIContext";
import { translateText, type TranslationValues } from "../i18n/translate";

export function useText() {
  const { language } = useUI();
  return (text: string, values?: TranslationValues) =>
    translateText(text, language, values);
}

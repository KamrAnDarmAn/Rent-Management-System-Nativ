import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { ps } from "./locales/ps";

i18n.use(initReactI18next).init({
  resources: { en: { translation: {} }, ps: { translation: ps } },
  lng: "en",
  fallbackLng: "en",
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});
export default i18n;

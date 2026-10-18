import i18n from "../../i18n";
import React, { useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { usePreferences } from "../../store/preferencesStore";
import { dark, light } from "./palette";
import { UIContext } from "./UIContext";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { language, theme } = usePreferences();
  const system = useColorScheme();
  const [toast, setToast] = useState("");
  const isDark = theme === "dark" || (theme === "system" && system === "dark");
  const c = isDark ? dark : light;

  useEffect(() => {
    void i18n.changeLanguage(language);
  }, [language]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5500);
    return () => clearTimeout(timer);
  }, [toast]);

  const context = useMemo(
    () => ({
      c,
      rtl: language === "ps",
      language,
      notify: setToast,
      toast,
      dismissToast: () => setToast(""),
    }),
    [c, language, toast],
  );

  return <UIContext.Provider value={context}>{children}</UIContext.Provider>;
}

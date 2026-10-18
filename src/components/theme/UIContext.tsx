import { createContext, useContext } from "react";
import { light } from "./palette";

export const UIContext = createContext({
  c: light,
  rtl: false,
  language: "en",
  notify: (_message: string) => {},
  toast: "",
  dismissToast: () => {},
});

export const useUI = () => useContext(UIContext);

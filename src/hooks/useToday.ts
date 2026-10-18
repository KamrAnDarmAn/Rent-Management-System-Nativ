import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { kabulDate } from "../domain/rent";

export function useToday() {
  const [today, setToday] = useState(() => kabulDate());
  useEffect(() => {
    const refresh = () => setToday(kabulDate());
    const timer = setInterval(refresh, 60000);
    const subscription = AppState.addEventListener("change", refresh);
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, []);
  return today;
}

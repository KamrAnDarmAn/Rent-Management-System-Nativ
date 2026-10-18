import { useCallback, useEffect, useRef, useState } from "react";
import { useWindowDimensions, View } from "react-native";

export type MenuAnchor = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function useAnchoredMenu() {
  const triggerRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<MenuAnchor | null>(null);
  const { width, height } = useWindowDimensions();
  const close = useCallback(() => setAnchor(null), []);
  useEffect(close, [width, height, close]);
  const open = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      if (triggerRef.current && width > 0 && height > 0)
        setAnchor({ x, y, width, height });
    });
  }, []);
  return { triggerRef, anchor, open, close };
}

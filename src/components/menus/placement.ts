import type { MenuAnchor } from "../../hooks/useAnchoredMenu";

// All coordinates are in the window, so menus also escape scroll/card clipping.
export function placeMenu(
  anchor: MenuAnchor,
  bounds: { width: number; top: number; bottom: number },
  contentHeight: number,
  rtl: boolean,
) {
  const margin = 8;
  const gap = 4;
  const width = Math.min(
    Math.max(anchor.width, 180),
    bounds.width - margin * 2,
  );
  const desiredHeight = Math.min(contentHeight, 280);
  const below = Math.max(0, bounds.bottom - anchor.y - anchor.height - gap);
  const above = Math.max(0, anchor.y - bounds.top - gap);
  const upwards = below < desiredHeight && above > below;
  const maxHeight = Math.min(desiredHeight, upwards ? above : below);
  const left = Math.min(
    Math.max(margin, rtl ? anchor.x + anchor.width - width : anchor.x),
    bounds.width - width - margin,
  );
  const top = upwards
    ? anchor.y - maxHeight - gap
    : anchor.y + anchor.height + gap;
  return { left, top, width, maxHeight };
}

export const light = {
  bg: "#f6fbfd",
  surface: "#ffffff",
  muted: "#f1f5f9",
  text: "#0f172a",
  sub: "#647b98",
  border: "#e3edf4",
  primary: "#07847f",
  primaryDark: "#056664",
  teal: "#e9fbf8",
  green: "#15803d",
  greenBg: "#e8fbef",
  orange: "#e78b08",
  orangeBg: "#fff6e6",
  red: "#ef3455",
  redBg: "#fff0f3",
  blue: "#2563eb",
  blueBg: "#eaf3ff",
  purple: "#7955e9",
  purpleBg: "#f1edff",
};

export type Palette = typeof light;

export const dark: Palette = {
  ...light,
  bg: "#0b1726",
  surface: "#122333",
  muted: "#1b3043",
  text: "#f3f8fc",
  sub: "#9cafc5",
  border: "#243a4e",
  primary: "#24d4c0",
  primaryDark: "#078e86",
  teal: "#113a3f",
  green: "#4ade80",
  greenBg: "#12392f",
  orange: "#fbbf24",
  orangeBg: "#3b321c",
  red: "#fb7185",
  redBg: "#3c2331",
  blue: "#60a5fa",
  blueBg: "#153653",
  purple: "#b8a4ff",
  purpleBg: "#2b2750",
};

export type Tone =
  "teal" | "green" | "orange" | "red" | "blue" | "purple" | "muted";

export function toneColors(c: Palette, tone: Tone) {
  return tone === "teal"
    ? { fg: c.primary, bg: c.teal }
    : tone === "muted"
      ? { fg: c.sub, bg: c.muted }
      : { fg: c[tone], bg: c[`${tone}Bg`] };
}

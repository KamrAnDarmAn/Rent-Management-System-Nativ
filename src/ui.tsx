import React, { createContext, useContext, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Switch,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Activity as ActivityIcon,
  Archive as ArchiveIcon,
  ArrowLeftRight as ArrowLeftRightIcon,
  ArrowRight as ArrowRightIcon,
  ArrowUp as ArrowUpIcon,
  Banknote as BanknoteIcon,
  Bell as BellIcon,
  BellRing as BellRingIcon,
  Box as BoxIcon,
  Building2 as Building2Icon,
  CalendarCheck as CalendarCheckIcon,
  CalendarDays as CalendarDaysIcon,
  ChartNoAxesColumnIncreasing as ChartNoAxesColumnIncreasingIcon,
  Check as CheckIcon,
  ChevronDown as ChevronDownIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronUp as ChevronUpIcon,
  Circle as CircleIcon,
  CircleAlert as CircleAlertIcon,
  CircleCheck as CircleCheckIcon,
  CircleDollarSign as CircleDollarSignIcon,
  CircleDot as CircleDotIcon,
  CircleHelp as CircleHelpIcon,
  Clock3 as Clock3Icon,
  CloudAlert as CloudAlertIcon,
  CloudUpload as CloudUploadIcon,
  Construction as ConstructionIcon,
  CreditCard as CreditCardIcon,
  Currency as CurrencyIcon,
  Database as DatabaseIcon,
  DatabaseBackup as DatabaseBackupIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Ellipsis as EllipsisIcon,
  FileDown as FileDownIcon,
  FilePlus2 as FilePlus2Icon,
  FileText as FileTextIcon,
  FileUp as FileUpIcon,
  FileWarning as FileWarningIcon,
  Files as FilesIcon,
  Folder as FolderIcon,
  Globe as GlobeIcon,
  Hammer as HammerIcon,
  Hash as HashIcon,
  History as HistoryIcon,
  House as HouseIcon,
  Info as InfoIcon,
  Landmark as LandmarkIcon,
  ListFilter as ListFilterIcon,
  LockKeyhole as LockKeyholeIcon,
  LockOpen as LockOpenIcon,
  MapPin as MapPinIcon,
  Megaphone as MegaphoneIcon,
  Package as PackageIcon,
  Palette as PaletteIcon,
  PanelsTopLeft as PanelsTopLeftIcon,
  Pause as PauseIcon,
  Pencil as PencilIcon,
  Percent as PercentIcon,
  Phone as PhoneIcon,
  Plus as PlusIcon,
  Receipt as ReceiptIcon,
  RefreshCw as RefreshCwIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Settings2 as Settings2Icon,
  ShieldAlert as ShieldAlertIcon,
  ShieldCheck as ShieldCheckIcon,
  ShoppingCart as ShoppingCartIcon,
  Signal as SignalIcon,
  Smartphone as SmartphoneIcon,
  StickyNote as StickyNoteIcon,
  Store as StoreIcon,
  Sun as SunIcon,
  Tag as TagIcon,
  Text as TextIcon,
  Trash2 as Trash2Icon,
  TrendingUp as TrendingUpIcon,
  TriangleAlert as TriangleAlertIcon,
  Undo2 as Undo2Icon,
  Upload as UploadIcon,
  UserRound as UserRoundIcon,
  UsersRound as UsersRoundIcon,
  Wallet as WalletIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Wrench as WrenchIcon,
  X as XIcon,
  Zap as ZapIcon,
  type LucideProps,
} from "lucide-react-native";
const iconComponents = {
  Activity: ActivityIcon,
  Archive: ArchiveIcon,
  ArrowLeftRight: ArrowLeftRightIcon,
  ArrowRight: ArrowRightIcon,
  ArrowUp: ArrowUpIcon,
  Banknote: BanknoteIcon,
  Bell: BellIcon,
  BellRing: BellRingIcon,
  Box: BoxIcon,
  Building2: Building2Icon,
  CalendarCheck: CalendarCheckIcon,
  CalendarDays: CalendarDaysIcon,
  ChartNoAxesColumnIncreasing: ChartNoAxesColumnIncreasingIcon,
  Check: CheckIcon,
  ChevronDown: ChevronDownIcon,
  ChevronLeft: ChevronLeftIcon,
  ChevronRight: ChevronRightIcon,
  ChevronUp: ChevronUpIcon,
  Circle: CircleIcon,
  CircleAlert: CircleAlertIcon,
  CircleCheck: CircleCheckIcon,
  CircleDollarSign: CircleDollarSignIcon,
  CircleDot: CircleDotIcon,
  CircleHelp: CircleHelpIcon,
  Clock3: Clock3Icon,
  CloudAlert: CloudAlertIcon,
  CloudUpload: CloudUploadIcon,
  Construction: ConstructionIcon,
  CreditCard: CreditCardIcon,
  Currency: CurrencyIcon,
  Database: DatabaseIcon,
  DatabaseBackup: DatabaseBackupIcon,
  Delete: DeleteIcon,
  Download: DownloadIcon,
  Edit: EditIcon,
  Ellipsis: EllipsisIcon,
  FileDown: FileDownIcon,
  FilePlus2: FilePlus2Icon,
  FileText: FileTextIcon,
  FileUp: FileUpIcon,
  FileWarning: FileWarningIcon,
  Files: FilesIcon,
  Folder: FolderIcon,
  Globe: GlobeIcon,
  Hammer: HammerIcon,
  Hash: HashIcon,
  History: HistoryIcon,
  House: HouseIcon,
  Info: InfoIcon,
  Landmark: LandmarkIcon,
  ListFilter: ListFilterIcon,
  LockKeyhole: LockKeyholeIcon,
  LockOpen: LockOpenIcon,
  MapPin: MapPinIcon,
  Megaphone: MegaphoneIcon,
  Package: PackageIcon,
  Palette: PaletteIcon,
  PanelsTopLeft: PanelsTopLeftIcon,
  Pause: PauseIcon,
  Pencil: PencilIcon,
  Percent: PercentIcon,
  Phone: PhoneIcon,
  Plus: PlusIcon,
  Receipt: ReceiptIcon,
  RefreshCw: RefreshCwIcon,
  Search: SearchIcon,
  Settings: SettingsIcon,
  Settings2: Settings2Icon,
  ShieldAlert: ShieldAlertIcon,
  ShieldCheck: ShieldCheckIcon,
  ShoppingCart: ShoppingCartIcon,
  Signal: SignalIcon,
  Smartphone: SmartphoneIcon,
  StickyNote: StickyNoteIcon,
  Store: StoreIcon,
  Sun: SunIcon,
  Tag: TagIcon,
  Text: TextIcon,
  Trash2: Trash2Icon,
  TrendingUp: TrendingUpIcon,
  TriangleAlert: TriangleAlertIcon,
  Undo2: Undo2Icon,
  Upload: UploadIcon,
  UserRound: UserRoundIcon,
  UsersRound: UsersRoundIcon,
  Wallet: WalletIcon,
  Wifi: WifiIcon,
  WifiOff: WifiOffIcon,
  Wrench: WrenchIcon,
  X: XIcon,
  Zap: ZapIcon,
};
import Svg, { Circle, Path, Line } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import i18n from "./i18n";
import { RootStackParams, ScreenId } from "./types";

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
type Tone = "teal" | "green" | "orange" | "red" | "blue" | "purple" | "muted";
export const UIContext = createContext({
  c: light,
  rtl: false,
  language: "en",
  notify: (_message: string) => {},
});
export const useUI = () => useContext(UIContext);
export function useGo() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParams>>();
  return (id: ScreenId, shopId?: number) =>
    navigation.navigate("Screen", { id, shopId });
}
export const money = (value: number) =>
  `AFN ${Math.round(value).toLocaleString("en-US")}`;
export const number = (value: number) =>
  Math.round(value).toLocaleString("en-US");
export type IconName = keyof typeof iconComponents;
export function Icon({
  name,
  size = 20,
  color,
  strokeWidth = 1.9,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const { c } = useUI();
  const Component = iconComponents[name] as React.ComponentType<LucideProps>;
  if (name === "Store")
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          fill={color ?? c.primary}
          d="M5 3h14l3 5H2l3-5Zm-3 6h20v.5a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0V9Zm2 4h3v7h4v-7h9v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7Zm10 2v3h4v-3h-4Z"
          fillRule="evenodd"
        />
      </Svg>
    );
  return (
    <Component
      size={size}
      color={color ?? c.primary}
      strokeWidth={strokeWidth}
    />
  );
}
export function T({
  children,
  size = 13,
  weight = "regular",
  color,
  style,
  lines,
  translate = true,
}: {
  children: React.ReactNode;
  size?: number;
  weight?: "regular" | "medium" | "semibold" | "bold";
  color?: string;
  style?: StyleProp<TextStyle>;
  lines?: number;
  translate?: boolean;
}) {
  const { c, rtl, language } = useUI();
  const fonts = {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semibold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
  };
  return (
    <Text
      numberOfLines={lines}
      style={[
        {
          color: color ?? c.text,
          fontSize: size,
          lineHeight: size * 1.35,
          fontFamily: language === "ps" ? undefined : fonts[weight],
          fontWeight:
            language === "ps" ? (weight === "bold" ? "700" : "400") : undefined,
          textAlign: rtl ? "right" : "left",
          writingDirection: rtl ? "rtl" : "ltr",
        },
        style,
      ]}
    >
      {typeof children === "string" && translate
        ? i18n.t(children, { lng: language })
        : children}
    </Text>
  );
}
export function Row({
  children,
  style,
  gap = 8,
  wrap = false,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  gap?: number;
  wrap?: boolean;
}) {
  const { rtl } = useUI();
  return (
    <View
      style={[
        {
          flexDirection: rtl ? "row-reverse" : "row",
          alignItems: "center",
          gap,
          flexWrap: wrap ? "wrap" : "nowrap",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function Card({
  children,
  style,
  tone,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: Tone;
  onPress?: () => void;
}) {
  const { c } = useUI();
  const styles: StyleProp<ViewStyle> = [
    {
      backgroundColor: tone ? toneColors(c, tone).bg : c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 13,
      padding: 12,
    },
    style,
  ];
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles, { opacity: pressed ? 0.75 : 1 }]}
    >
      {children}
    </Pressable>
  ) : (
    <View style={styles}>{children}</View>
  );
}
export function toneColors(c: Palette, tone: Tone) {
  return tone === "teal"
    ? { fg: c.primary, bg: c.teal }
    : tone === "muted"
      ? { fg: c.sub, bg: c.muted }
      : { fg: c[tone], bg: c[`${tone}Bg`] };
}
export function IconTile({
  name,
  tone = "teal",
  size = 40,
}: {
  name: IconName;
  tone?: Tone;
  size?: number;
}) {
  const { c } = useUI();
  const colors = toneColors(c, tone);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon name={name} size={size * 0.52} color={colors.fg} />
    </View>
  );
}
export function Logo({ size = 42 }: { size?: number }) {
  return (
    <LinearGradient
      colors={["#079f94", "#03645f"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name="Store" size={size * 0.62} color="#fff" strokeWidth={2.7} />
    </LinearGradient>
  );
}
export function Badge({
  label,
  tone = "green",
  icon,
  small = false,
}: {
  label: string;
  tone?: Tone;
  icon?: IconName;
  small?: boolean;
}) {
  const { c } = useUI();
  const colors = toneColors(c, tone);
  return (
    <Row
      gap={4}
      style={{
        alignSelf: "flex-start",
        backgroundColor: colors.bg,
        borderRadius: 20,
        paddingHorizontal: small ? 7 : 10,
        paddingVertical: small ? 2 : 5,
      }}
    >
      {icon && <Icon name={icon} color={colors.fg} size={small ? 11 : 13} />}
      <T size={small ? 9 : 11} weight="medium" color={colors.fg}>
        {label}
      </T>
    </Row>
  );
}
export function Button({
  title,
  onPress,
  icon,
  variant = "primary",
  style,
  compact = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
  disabled?: boolean;
}) {
  const { c } = useUI();
  const fg = variant === "primary" || variant === "danger" ? "#fff" : c.primary;
  const contents = (
    <Row gap={7} style={{ justifyContent: "center" }}>
      {icon && <Icon name={icon} color={fg} size={compact ? 15 : 19} />}
      <T
        color={fg}
        size={compact ? 11 : 14}
        weight="semibold"
        style={{ textAlign: "center" }}
      >
        {title}
      </T>
    </Row>
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: compact ? 34 : 46,
          borderRadius: 9,
          overflow: "hidden",
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {variant === "primary" ? (
        <LinearGradient
          colors={["#04988f", "#036b6c"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: compact ? 10 : 14,
            paddingVertical: 9,
          }}
        >
          {contents}
        </LinearGradient>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            borderRadius: 9,
            paddingHorizontal: compact ? 10 : 14,
            paddingVertical: 9,
            backgroundColor:
              variant === "danger"
                ? c.red
                : variant === "secondary"
                  ? c.teal
                  : "transparent",
            borderWidth: variant === "outline" ? 1 : 0,
            borderColor: c.border,
          }}
        >
          {contents}
        </View>
      )}
    </Pressable>
  );
}
export function IconButton({
  name,
  onPress,
  label,
  size = 38,
}: {
  name: IconName;
  onPress: () => void;
  label: string;
  size?: number;
}) {
  const { c } = useUI();
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: c.surface,
        justifyContent: "center",
        alignItems: "center",
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Icon name={name} size={20} color={c.text} />
    </Pressable>
  );
}
export function Progress({
  value,
  color,
  height = 8,
}: {
  value: number;
  color?: string;
  height?: number;
}) {
  const { c } = useUI();
  return (
    <View
      style={{
        height,
        borderRadius: height,
        backgroundColor: c === dark ? "#173d45" : "#d0faf4",
        overflow: "hidden",
        flex: 1,
      }}
    >
      <View
        style={{
          height,
          width: `${Math.max(0, Math.min(100, value))}%`,
          backgroundColor: color ?? c.primary,
          borderRadius: height,
        }}
      />
    </View>
  );
}
export function Section({
  title,
  action,
  onPress,
  children,
  style,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useUI();
  return (
    <View style={[{ gap: 10 }, style]}>
      <Row style={{ justifyContent: "space-between" }}>
        <T weight="semibold" size={13}>
          {title}
        </T>
        {action && (
          <Pressable accessibilityRole="button" onPress={onPress}>
            <Row gap={3}>
              <T size={10} color={c.blue}>
                {action}
              </T>
              <Icon name="ChevronRight" size={12} color={c.blue} />
            </Row>
          </Pressable>
        )}
      </Row>
      {children}
    </View>
  );
}
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  required,
  helper,
  multiline,
  numeric,
  error,
  suffix,
  readOnly = false,
}: {
  label: string;
  value?: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  icon?: IconName;
  required?: boolean;
  helper?: string;
  multiline?: boolean;
  numeric?: boolean;
  error?: string;
  suffix?: string;
  readOnly?: boolean;
}) {
  const { c, rtl } = useUI();
  const [focused, setFocused] = useState(false);
  const dense = Boolean(helper) || !label;
  return (
    <Row gap={7} style={{ flex: 1, minWidth: 0, alignItems: "flex-start" }}>
      {dense && icon && <IconTile name={icon} size={28} />}
      <View style={{ flex: 1, gap: dense ? 4 : 5, minWidth: 0 }}>
        <Row gap={5}>
          {icon && !dense && <Icon name={icon} size={14} />}
          <T size={11} weight="medium">
            {label}
          </T>
          {required && <T color={c.red}>*</T>}
        </Row>
        <View
          style={{
            flexDirection: rtl ? "row-reverse" : "row",
            alignItems: multiline ? "flex-start" : "center",
            minHeight: multiline ? (dense ? 48 : 65) : dense ? 31 : 39,
            borderRadius: 7,
            borderWidth: 1,
            borderColor: error ? c.red : focused ? c.primary : c.border,
            backgroundColor: c.surface,
            paddingHorizontal: 10,
          }}
        >
          <TextInput
            accessibilityLabel={label}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={c.sub}
            editable={!readOnly}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            keyboardType={numeric ? "numeric" : "default"}
            multiline={multiline}
            style={{
              flex: 1,
              color: c.text,
              fontSize: dense ? 11 : 12,
              fontFamily: "Inter_400Regular",
              minHeight: multiline ? (dense ? 46 : 60) : dense ? 30 : 38,
              textAlign: rtl ? "right" : "left",
              paddingVertical: dense ? 6 : 8,
              width: "100%",
            }}
          />
          {suffix && (
            <T size={11} color={c.sub}>
              {suffix}
            </T>
          )}
        </View>
        {(helper || error) && (
          <T size={dense ? 8 : 9} color={error ? c.red : c.sub}>
            {error ?? helper}
          </T>
        )}
      </View>
    </Row>
  );
}
export function Info({
  title,
  text,
  tone = "blue",
  icon = "Info",
}: {
  title?: string;
  text: string;
  tone?: Tone;
  icon?: IconName;
}) {
  const { c } = useUI();
  const colors = toneColors(c, tone);
  return (
    <Row
      style={{
        padding: 10,
        borderRadius: 9,
        backgroundColor: colors.bg,
        alignItems: "flex-start",
      }}
    >
      <Icon name={icon} size={17} color={colors.fg} />
      <View style={{ flex: 1, gap: 3 }}>
        {title && (
          <T size={11} weight="semibold">
            {title}
          </T>
        )}
        <T size={10} color={c.sub}>
          {text}
        </T>
      </View>
    </Row>
  );
}
export function Check({
  checked,
  onPress,
  label,
}: {
  checked: boolean;
  onPress: () => void;
  label?: string;
}) {
  const { c } = useUI();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label ?? "Select"}
      onPress={onPress}
    >
      <View
        style={{
          width: 18,
          height: 18,
          backgroundColor: checked ? c.primary : c.surface,
          borderRadius: 5,
          borderWidth: 1,
          borderColor: checked ? c.primary : c.border,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked && <Icon name="Check" size={13} color="#fff" />}
      </View>
    </Pressable>
  );
}
export function ToggleRow({
  title,
  subtitle,
  value,
  onChange,
  icon = "Bell",
  tone = "teal",
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon?: IconName;
  tone?: Tone;
}) {
  const { c } = useUI();
  return (
    <Row>
      <IconTile name={icon} tone={tone} size={35} />
      <View style={{ flex: 1 }}>
        <T size={12} weight="semibold">
          {title}
        </T>
        {subtitle && (
          <T size={10} color={c.sub}>
            {subtitle}
          </T>
        )}
      </View>
      <Switch
        accessibilityLabel={title}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: c.border, true: "#078b82" }}
        thumbColor="#fff"
      />
    </Row>
  );
}
export function Metric({
  label,
  value,
  tone = "teal",
  icon,
  detail,
  style,
  compact = false,
}: {
  label: string;
  value: string;
  tone?: Tone;
  icon?: IconName;
  detail?: string;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}) {
  const { c } = useUI();
  return (
    <Card
      tone={tone}
      style={[
        {
          flex: 1,
          gap: compact ? 3 : 5,
          padding: compact ? 7 : 10,
          minWidth: 0,
        },
        style,
      ]}
    >
      {icon && <IconTile name={icon} tone={tone} size={compact ? 24 : 30} />}
      <T size={compact ? 9 : 10} color={c.sub}>
        {label}
      </T>
      <T
        size={value.length > 10 ? 12 : value.length >= 6 ? 14 : 20}
        weight="bold"
      >
        {value}
      </T>
      {detail && (
        <T size={compact ? 8 : 9} color={toneColors(c, tone).fg}>
          {detail}
        </T>
      )}
    </Card>
  );
}
export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const { c } = useUI();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ flex: 1, gap: 5 }}>
      {label && (
        <T size={11} weight="medium">
          {label}
        </T>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? value}
        onPress={() => setOpen(!open)}
        style={{
          minHeight: 39,
          borderRadius: 7,
          borderWidth: 1,
          borderColor: open ? c.primary : c.border,
          paddingHorizontal: 10,
          justifyContent: "center",
          backgroundColor: c.surface,
        }}
      >
        <Row style={{ justifyContent: "space-between" }}>
          <T size={12}>{value}</T>
          <Icon
            name={open ? "ChevronUp" : "ChevronDown"}
            size={15}
            color={c.sub}
          />
        </Row>
      </Pressable>
      {open && (
        <Card style={{ padding: 3 }}>
          {options.map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              style={{
                padding: 9,
                backgroundColor: option === value ? c.teal : "transparent",
                borderRadius: 5,
              }}
            >
              <T size={12}>{option}</T>
            </Pressable>
          ))}
        </Card>
      )}
    </View>
  );
}
export function Page({
  title,
  subtitle,
  children,
  footer,
  back = true,
  help = false,
  leading,
  trailing,
  noPadding = false,
  contentGap = 10,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  back?: boolean;
  help?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  noPadding?: boolean;
  contentGap?: number;
}) {
  const { c, notify } = useUI();
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: c.bg,
        paddingTop: Platform.OS === "web" ? 8 : insets.top,
      }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {title && (
        <Row
          style={{
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: 8,
            minHeight: 50,
          }}
        >
          {back ? (
            <IconButton
              name="ChevronLeft"
              label="Back"
              onPress={() =>
                nav.canGoBack()
                  ? nav.goBack()
                  : notify("Open a screen from the tabs below.")
              }
            />
          ) : (
            leading
          )}
          <View style={{ flex: 1, gap: 2 }}>
            <T
              size={back ? 17 : 25}
              weight="bold"
              style={back ? { textAlign: "center" } : undefined}
            >
              {title}
            </T>
            {subtitle && (
              <T
                size={back ? 10 : 11}
                color={c.sub}
                style={back ? { textAlign: "center" } : undefined}
              >
                {subtitle}
              </T>
            )}
          </View>
          {trailing ??
            (help ? (
              <Pressable
                accessibilityLabel="Help"
                onPress={() =>
                  notify(
                    "Visual preview · sample records. Production accounting and device services are not connected yet.",
                  )
                }
              >
                <Badge label="Help" icon="CircleHelp" tone="teal" />
              </Pressable>
            ) : back ? (
              <View style={{ width: 38 }} />
            ) : null)}
        </Row>
      )}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: noPadding ? 0 : 14,
          paddingBottom: 18,
          gap: contentGap,
        }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        testID="screen-scroll"
      >
        {children}
      </ScrollView>
      {footer && (
        <View
          style={{
            backgroundColor: c.bg,
            paddingHorizontal: 14,
            paddingTop: 8,
            paddingBottom: Math.max(10, insets.bottom),
            borderTopWidth: StyleSheet.hairlineWidth,
            borderColor: c.border,
          }}
        >
          {footer}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
export function Divider() {
  const { c } = useUI();
  return (
    <View style={{ height: 1, backgroundColor: c.border, marginVertical: 7 }} />
  );
}
export function Donut({
  compact = false,
  value = 92500,
}: {
  compact?: boolean;
  value?: number;
}) {
  const { c } = useUI();
  const size = compact ? 94 : 132;
  const colors = [
    "#2188ff",
    "#08b5a3",
    "#6de5d1",
    "#8b5cf6",
    "#ff9f24",
    "#a7b5c8",
  ];
  const parts = [35, 22, 18, 10, 8, 7];
  let offset = 0;
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        style={StyleSheet.absoluteFill}
      >
        {parts.map((p, i) => {
          const start = offset;
          offset += p;
          return (
            <Circle
              key={i}
              cx="60"
              cy="60"
              r="47"
              fill="none"
              stroke={colors[i]}
              strokeWidth="18"
              strokeDasharray={`${p * 2.953} ${295.3 - p * 2.953}`}
              strokeDashoffset={-start * 2.953}
              transform="rotate(-90 60 60)"
            />
          );
        })}
      </Svg>
      <T size={compact ? 11 : 13} weight="bold">
        {money(value)}
      </T>
      <T size={10} color={c.sub}>
        Total
      </T>
    </View>
  );
}
export function BarChart({ small = false }: { small?: boolean }) {
  const { c } = useUI();
  const months = small
    ? ["Expected", "Collected"]
    : [
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
        "Jan",
        "Feb",
        "Mar",
      ];
  return (
    <View style={{ gap: 8 }}>
      <Row
        style={{
          height: small ? 100 : 105,
          alignItems: "flex-end",
          borderBottomWidth: 1,
          borderColor: c.border,
          paddingHorizontal: 5,
        }}
        gap={small ? 30 : 5}
      >
        {months.map((m, i) => (
          <View
            key={m}
            style={{
              flex: 1,
              alignItems: "center",
              height: "100%",
              justifyContent: "flex-end",
            }}
          >
            <Row gap={3} style={{ alignItems: "flex-end", height: "100%" }}>
              <View
                style={{
                  width: small ? 35 : 7,
                  height: small ? (i ? 65 : 95) : 40 + ((i * 13) % 53),
                  backgroundColor: i === 1 && small ? "#10b99b" : "#399aff",
                  borderTopLeftRadius: 2,
                  borderTopRightRadius: 2,
                }}
              />
              {!small && (
                <View
                  style={{
                    width: 7,
                    height: 28 + ((i * 9) % 45),
                    backgroundColor: "#0fbb9d",
                    borderTopLeftRadius: 2,
                    borderTopRightRadius: 2,
                  }}
                />
              )}
            </Row>
          </View>
        ))}
      </Row>
      <Row gap={small ? 20 : 2}>
        {months.map((m) => (
          <T
            key={m}
            size={small ? 9 : 8}
            color={c.sub}
            style={{ flex: 1, textAlign: "center" }}
          >
            {m}
          </T>
        ))}
      </Row>
      <Row style={{ justifyContent: "center" }}>
        <Badge label="Expected" tone="blue" small />
        <Badge label="Collected" tone="teal" small />
      </Row>
    </View>
  );
}
export function TrendChart() {
  const { c } = useUI();
  return (
    <View>
      <Svg width="100%" height={105} viewBox="0 0 300 125">
        {[20, 50, 80, 110].map((y) => (
          <Line key={y} x1="5" x2="290" y1={y} y2={y} stroke={c.border} />
        ))}
        <Path
          d="M8 106 L60 85 L112 52 L165 63 L220 30 L282 11 L282 110 L8 110Z"
          fill="#0fc2a2"
          opacity={0.14}
        />
        <Path
          d="M8 106 L60 85 L112 52 L165 63 L220 30 L282 11"
          fill="none"
          stroke="#0bb696"
          strokeWidth="3"
        />
        {[
          [8, 106],
          [60, 85],
          [112, 52],
          [165, 63],
          [220, 30],
          [282, 11],
        ].map(([x, y]) => (
          <Circle key={x} cx={x} cy={y} r={4} fill="#0bb696" />
        ))}
      </Svg>
      <Row>
        {["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"].map((m) => (
          <T
            key={m}
            size={9}
            color={c.sub}
            style={{ flex: 1, textAlign: "center" }}
          >
            {m}
          </T>
        ))}
      </Row>
    </View>
  );
}

import { useText } from "../../hooks/useText";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton } from "../buttons/IconButton";
import { Badge } from "../feedback/Badge";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";
import { Row } from "./Row";

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
  const t = useText();
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
                accessibilityLabel={t("Help")}
                onPress={() =>
                  notify(
                    "Review the details before saving. Your ledger is stored on this device.",
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

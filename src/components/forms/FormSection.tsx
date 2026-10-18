import React from "react";
import { View } from "react-native";
import { type IconName } from "../icons/Icon";
import { IconTile } from "../icons/IconTile";
import { Card } from "../layout/Card";
import { Row } from "../layout/Row";
import { useUI } from "../theme/UIContext";
import { T } from "../typography/T";

export function FormSection({
  title,
  subtitle,
  icon,
  tone = "teal",
  children,
}: {
  title: string;
  subtitle: string;
  icon: IconName;
  tone?: "teal" | "green" | "purple" | "orange";
  children: React.ReactNode;
}) {
  const { c } = useUI();
  return (
    <Card style={{ gap: 10, padding: 10 }}>
      <Row>
        <IconTile name={icon} tone={tone} size={30} />
        <View style={{ flex: 1 }}>
          <T weight="bold" size={14}>
            {title}
          </T>
          <T size={10} color={c.sub}>
            {subtitle}
          </T>
        </View>
      </Row>
      {children}
    </Card>
  );
}

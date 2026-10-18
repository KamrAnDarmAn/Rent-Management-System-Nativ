import { View } from "react-native";
import { Info } from "../../components/feedback/Info";
import { Icon } from "../../components/icons/Icon";
import { IconTile } from "../../components/icons/IconTile";
import { Card } from "../../components/layout/Card";
import { Page } from "../../components/layout/Page";
import { Row } from "../../components/layout/Row";
import { Section } from "../../components/layout/Section";
import { useUI } from "../../components/theme/UIContext";
import { T } from "../../components/typography/T";
import { screenReferences } from "../../data/screenReferences";
import { useGo } from "../../hooks/useGo";

export function ScreenGallery() {
  const { c } = useUI();
  const go = useGo();
  return (
    <Page
      title="Screen Library"
      subtitle="Every reference, built as a native screen"
    >
      <Info
        title="Interactive visual preview"
        text="Sample data powers these screens. Settings persist; financial records are demo-only. Production database, encryption, and transfer are separate implementation stages."
      />
      {[...new Set(screenReferences.map((s) => s.group))].map((group) => (
        <Section key={group} title={group}>
          <View style={{ gap: 6 }}>
            {screenReferences
              .filter((s) => s.group === group)
              .map((screen, i) => (
                <Card key={screen.id} onPress={() => go(screen.id)}>
                  <Row>
                    <IconTile
                      name="PanelsTopLeft"
                      tone={i % 2 ? "blue" : "teal"}
                      size={32}
                    />
                    <View style={{ flex: 1 }}>
                      <T weight="semibold" size={12}>
                        {screen.title}
                      </T>
                      <T size={9} color={c.sub}>
                        Screen preview
                      </T>
                    </View>
                    <Icon name="ChevronRight" size={16} color={c.sub} />
                  </Row>
                </Card>
              ))}
          </View>
        </Section>
      ))}
    </Page>
  );
}

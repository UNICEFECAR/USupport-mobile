import { StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";

import { OrganizationOverview as OrganizationOverviewBlock } from "#blocks";
import { Block, Heading, Screen } from "#components";

export const OrganizationOverview = ({ navigation, route }) => {
  const { t } = useTranslation("screens", {
    keyPrefix: "organization-overview-screen",
  });

  const organizationId = route.params.organizationId;

  if (!organizationId) navigation.navigate("Organizations");

  return (
    <Screen hasEmergencyButton={false} styles={styles.flexGrow1}>
      <Block>
        <Heading
          heading={t("heading")}
          subheading={t("subheading")}
          handleGoBack={() => navigation.goBack()}
        />
      </Block>
      <ScrollView
        contentContainerStyle={styles.flexGrow1}
        showsVerticalScrollIndicator={false}
      >
        <OrganizationOverviewBlock organizationId={organizationId} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  flexGrow1: { flexGrow: 1 },
});

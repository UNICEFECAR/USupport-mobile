import React from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet, ScrollView } from "react-native";

import { Screen, AppText } from "#components";
import {
  MascotHeadingBlock,
  InformationalPortal as InformationalPortalBlock,
  GiveSuggestion,
} from "#blocks";
import { mascotHappyPurple } from "#assets";
import { appStyles } from "#styles";

/**
 * InformationPortal
 *
 * Information Portal screen
 *
 * @returns {JSX.Element}
 */
export const InformationalPortal = ({ navigation }) => {
  const { t } = useTranslation("informational-portal-screen");

  const heading = (
    <View>
      <AppText namedStyle="h3" style={styles.heading}>
        {t("heading")}
      </AppText>
      <AppText style={styles.subheading}>{t("subheading")}</AppText>
    </View>
  );

  return (
    <Screen style={styles.screen}>
      <ScrollView>
        <MascotHeadingBlock image={mascotHappyPurple}>
          {heading}
        </MascotHeadingBlock>
        <InformationalPortalBlock navigation={navigation} />
        <GiveSuggestion />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: { paddingBottom: 70 },
  heading: { color: appStyles.colorBlue_263238 },
  subheading: { marginTop: 16, color: appStyles.colorBlue_263238 },
});

import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { Screen, Block, Heading } from "#components";
import { MoodTrackHistory } from "#blocks";

/**
 * MoodTracker
 *
 * MoodTracker screen
 *
 * @returns {JSX.Element}
 */
export const MoodTracker = ({ navigation }) => {
  const { t } = useTranslation("mood-tracker-screen");

  return (
    <Screen
      hasEmergencyButton={false}
      hasHeaderNavigation
      t={t}
      style={styles.screen}
    >
      <ScrollView>
        <Block>
          <Heading
            heading={t("heading")}
            handleGoBack={() => navigation.goBack()}
            subheading={t("subheading")}
            hasGoBackArrow={false}
          />
        </Block>
        <MoodTrackHistory />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingTop: 55,
  },
});

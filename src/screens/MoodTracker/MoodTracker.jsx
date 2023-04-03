import React from "react";
import { ScrollView } from "react-native";
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
    <Screen>
      <ScrollView>
        <Block>
          <Heading
            heading={t("heading")}
            handleGoBack={() => navigation.goBack()}
            subheading={t("subheading")}
          />
        </Block>
        <MoodTrackHistory />
      </ScrollView>
    </Screen>
  );
};

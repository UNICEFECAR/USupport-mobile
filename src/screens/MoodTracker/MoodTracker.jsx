import React, { useContext, useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { Screen, Block, Heading } from "#components";
import { MoodTrackHistory } from "#blocks";
import { Context } from "#services";

/**
 * MoodTracker
 *
 * MoodTracker screen
 *
 * @returns {JSX.Element}
 */
export const MoodTracker = ({ navigation }) => {
  const { t } = useTranslation("mood-tracker-screen");
  const { isTmpUser, handleRegistrationModalOpen } = useContext(Context);

  useEffect(() => {
    if (isTmpUser) {
      handleRegistrationModalOpen();
    }
  }, [isTmpUser]);

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
        {!isTmpUser ? <MoodTrackHistory /> : null}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingTop: 55,
  },
});

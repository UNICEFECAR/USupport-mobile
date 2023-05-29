import React, { useContext, useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { Screen, Block, Heading } from "#components";
import { MoodTrackHistory } from "#blocks";
import { Context } from "#services";
import { AppText } from "../../components/texts";

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
        <Block style={{ marginTop: 18 }}>
          <AppText namedStyle="h3">{t("heading")}</AppText>
          <AppText>{t("subheading")}</AppText>
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

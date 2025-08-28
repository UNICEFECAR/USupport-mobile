import React, { useContext, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";

import { Screen, Block } from "#components";
import { MoodTrackHistory } from "#blocks";
import { Context } from "#services";
import { AppText } from "../../components/texts";
import { GiveSuggestion } from "#blocks";

/**
 * MoodTracker
 *
 * MoodTracker screen
 *
 * @returns {JSX.Element}
 */
export const MoodTracker = ({ navigation }) => {
  const { t } = useTranslation("screens", { keyPrefix: "mood-tracker-screen" });
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "position" : null}
        keyboardVerticalOffset={64}
      >
        <ScrollView>
          <Block style={{ marginTop: 18 }}>
            <AppText namedStyle="h3">{t("heading")}</AppText>
            <AppText>{t("subheading")}</AppText>
          </Block>
          {!isTmpUser ? <MoodTrackHistory /> : null}
          <GiveSuggestion navigation={navigation} type="mood-tracker" />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingTop: 55,
  },
});

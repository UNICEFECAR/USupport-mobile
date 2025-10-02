import React, { useState, useContext, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";

import { AppText, Screen, ButtonWithIcon } from "#components";
import { GiveSuggestion, MascotHeadingBlock, MoodTrackHistory } from "#blocks";
import { Context } from "#services";
import { MoodTrackReport } from "#backdrops";
import { useGetTheme } from "#hooks";
import { appStyles } from "#styles";

/**
 * MoodTracker
 *
 * MoodTracker screen
 *
 * @returns {JSX.Element}
 */
export const MoodTracker = ({ navigation }) => {
  const { t } = useTranslation("screens", { keyPrefix: "mood-tracker-screen" });
  const { colors, isDarkMode } = useGetTheme();
  const { country, isTmpUser, handleRegistrationModalOpen } =
    useContext(Context);
  const IS_RO = country === "RO";

  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    if (isTmpUser) {
      handleRegistrationModalOpen();
    }
  }, [isTmpUser]);

  return (
    <Screen hasEmergencyButton={false} hasHeaderNavigation t={t}>
      <MoodTrackReport
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "position" : null}
        keyboardVerticalOffset={64}
      >
        <ScrollView>
          <MascotHeadingBlock>
            <AppText namedStyle="h3" style={styles.colorTextBlue}>
              {t("heading")}
            </AppText>
            <AppText
              style={[
                styles.marginTop16,
                isDarkMode
                  ? { color: appStyles.colorWhite_ff }
                  : styles.colorTextBlue,
              ]}
            >
              {t("subheading")}
            </AppText>
            {!isTmpUser && IS_RO && (
              <ButtonWithIcon
                label={t("report")}
                onPress={() => setIsReportOpen(true)}
                iconName="document"
                color="purple"
                iconColor={"#FFFFFF"}
                size="sm"
                style={styles.marginTop16}
              />
            )}
          </MascotHeadingBlock>
          {!isTmpUser ? (
            <MoodTrackHistory
              openReport={() => setIsReportOpen(true)}
              showReport={IS_RO}
            />
          ) : null}
          <GiveSuggestion navigation={navigation} type="mood-tracker" />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  marginTop16: { marginTop: 16 },
  colorTextBlue: { color: appStyles.colorBlue_263238 },
});

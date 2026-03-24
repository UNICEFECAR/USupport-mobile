import React, { useState, useContext, useEffect, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  useWindowDimensions,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

import { AppText, Screen, ButtonWithIcon, AppButton } from "#components";
import { GiveSuggestion, MascotHeadingBlock, MoodTrackHistory } from "#blocks";
import { HowItWorksMoodTrack } from "#modals";
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
  const { height: windowHeight } = useWindowDimensions();
  const scrollViewRef = useRef(null);
  const [giveSuggestionLayout, setGiveSuggestionLayout] = useState(null);
  const { country, isTmpUser, handleRegistrationModalOpen } =
    useContext(Context);
  const IS_RO = country === "RO";

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  useEffect(() => {
    if (isTmpUser) {
      handleRegistrationModalOpen();
    }
  }, [isTmpUser]);

  const handleGiveSuggestionFocus = () => {
    if (
      Platform.OS !== "android" ||
      !giveSuggestionLayout ||
      !scrollViewRef.current
    ) {
      return;
    }

    const subscription = Keyboard.addListener("keyboardDidShow", (e) => {
      subscription.remove();
      const keyboardHeight = e.endCoordinates.height;
      const visibleHeight = windowHeight - keyboardHeight;
      const scrollY = Math.max(
        0,
        giveSuggestionLayout.y +
          giveSuggestionLayout.height -
          visibleHeight +
          56
      );
      scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
    });
  };

  return (
    <Screen hasEmergencyButton={false} hasHeaderNavigation t={t}>
      <MoodTrackReport
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
      <HowItWorksMoodTrack
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "position" : "height"}
        keyboardVerticalOffset={64}
      >
        <ScrollView ref={scrollViewRef} keyboardShouldPersistTaps="handled">
          <MascotHeadingBlock style={styles.mascotHeadingBlock}>
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
              <>
                <AppButton
                  label={t("how-it-works")}
                  onPress={() => setIsHowItWorksOpen(true)}
                  color="purple"
                  type="secondary"
                  size="sm"
                  style={styles.marginTop16}
                />
                <ButtonWithIcon
                  label={t("report")}
                  onPress={() => setIsReportOpen(true)}
                  iconName="document"
                  color="purple"
                  iconColor={"#FFFFFF"}
                  size="sm"
                  style={styles.marginTop16}
                />
              </>
            )}
          </MascotHeadingBlock>
          {!isTmpUser ? (
            <MoodTrackHistory
              openReport={() => setIsReportOpen(true)}
              showReport={IS_RO}
              navigation={navigation}
            />
          ) : null}
          <View
            onLayout={(e) => setGiveSuggestionLayout(e.nativeEvent.layout)}
            collapsable={false}
          >
            <GiveSuggestion
              navigation={navigation}
              type="mood-tracker"
              onTextareaFocus={handleGiveSuggestionFocus}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  colorTextBlue: { color: appStyles.colorBlue_263238 },
  marginTop16: { marginTop: 16 },
  mascotHeadingBlock: { paddingTop: 65 },
});

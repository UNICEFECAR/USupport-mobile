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

import { Screen, NewButton, Heading } from "#components";
import { MoodTrackHistory } from "#blocks";
import { HowItWorksMoodTrack } from "#modals";
import { Context } from "#services";
import { MoodTrackReport } from "#backdrops";

/**
 * MoodTracker
 *
 * MoodTracker screen
 *
 * @returns {JSX.Element}
 */
export const MoodTracker = ({ navigation }) => {
  const { t } = useTranslation("screens", { keyPrefix: "mood-tracker-screen" });
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

  const headingSection = (
    <View style={styles.headingContainer}>
      <Heading
        heading={t("heading")}
        subheading={t("subheading")}
        handleGoBack={() => navigation.goBack()}
      />

      {!isTmpUser && IS_RO && (
        <View style={styles.headingButtons}>
          <NewButton
            label={t("how-it-works")}
            onPress={() => setIsHowItWorksOpen(true)}
            type="outline"
            size="sm"
            style={{ width: "47%" }}
          />
          <NewButton
            label={t("report")}
            onPress={() => setIsReportOpen(true)}
            iconName="document"
            color="purple"
            iconColor={"#FFFFFF"}
            size="sm"
            style={{ width: "47%" }}
          />
        </View>
      )}
    </View>
  );

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
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={64}
      >
        <ScrollView ref={scrollViewRef} keyboardShouldPersistTaps="handled">
          {isTmpUser ? (
            <View style={styles.tmpUserHeadingWrap}>{headingSection}</View>
          ) : (
            <MoodTrackHistory header={headingSection} navigation={navigation} />
          )}
          {/* <GiveSuggestion navigation={navigation} type="mood-tracker" /> */}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  tmpUserHeadingWrap: {
    paddingHorizontal: 16,
  },
  headingContainer: {
    alignItems: "flex-start",
    paddingTop: 38,
    paddingBottom: 16,
  },
  headingButtons: {
    marginTop: 16,
    rowGap: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});

import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet } from "react-native";

import { Screen, Block, Heading } from "#components";
import { SafetyFeedback as SafetyFeedbackBlock } from "#blocks";

/**
 * SafetyFeedback
 *
 * Safe feedback screen
 *
 * @return {jsx}
 */
export const SafetyFeedback = ({ navigation, answers, consultationId }) => {
  const { t } = useTranslation("safety-feedback-screen");

  return (
    <Screen hasEmergencyButton={false}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
        style={styles.flex1}
      >
        <Block>
          <Heading
            wrapperStyle={styles.heading}
            heading={t("heading")}
            subheading={t("subheading")}
            hasGoBackArrow={false}
          />
        </Block>

        <SafetyFeedbackBlock
          navigation={navigation}
          consultationId={consultationId}
          answers={answers}
        />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    flexDirection: "column",
    paddingBottom: 50,
  },
  flex1: {
    flex: 1,
  },
  heading: {
    position: "relative",
  },
});

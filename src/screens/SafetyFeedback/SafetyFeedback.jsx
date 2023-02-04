import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";

import { Screen, Block, Heading } from "#components";
import { SafetyFeedback as SafetyFeedbackBlock } from "#blocks";

/**
 * SafetyFeedback
 *
 * Safe feedback screen
 *
 * @return {jsx}
 */
export const SafetyFeedback = ({ navigation }) => {
  const { t } = useTranslation("safety-feedback-screen");

  return (
    <Screen hasEmergencyButton={false}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <Block>
          <Heading
            heading={t("heading")}
            subheading={t("subheading")}
            hasGoBackArrow={false}
          />
        </Block>
        <SafetyFeedbackBlock />
      </ScrollView>
    </Screen>
  );
};

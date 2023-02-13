import React from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { Screen, AppText } from "#components";
import {
  MascotHeadingBlock,
  InformationalPortal as InformationalPortalBlock,
  GiveSuggestion,
} from "#blocks";
import { mascotHappyPurple } from "#assets";
import { appStyles } from "#styles";

/**
 * InformationPortal
 *
 * Information Portal screen
 *
 * @returns {JSX.Element}
 */
export const InformationalPortal = ({ navigation }) => {
  const { t } = useTranslation("informational-portal-screen");

  const heading = (
    <View>
      <AppText namedStyle="h3" style={styles.heading}>
        {t("heading")}
      </AppText>
      <AppText style={styles.subheading}>{t("subheading")}</AppText>
    </View>
  );

  return (
    <Screen hasHeaderNavigation t={t}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "position" : null}
        keyboardVerticalOffset={64}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <MascotHeadingBlock image={mascotHappyPurple}>
            {heading}
          </MascotHeadingBlock>
          <InformationalPortalBlock navigation={navigation} />
          <GiveSuggestion />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  heading: { color: appStyles.colorBlue_263238 },
  subheading: { marginTop: 16, color: appStyles.colorBlue_263238 },
});

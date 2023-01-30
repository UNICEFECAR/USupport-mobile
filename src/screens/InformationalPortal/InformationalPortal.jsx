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

import { appStyles } from "#styles";

import mascotHappyPurple from "../../assets/mascot-happy-purple.png";

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
    <Screen style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "position" : null}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 20}
      >
        <ScrollView>
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

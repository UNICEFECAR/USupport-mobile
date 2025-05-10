import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { Screen, AppText, TabsUnderlined } from "#components";
import {
  MascotHeadingBlock,
  InformationalPortal as InformationalPortalBlock,
  GiveSuggestion,
} from "#blocks";
import { mascotHappyPurple } from "#assets";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

/**
 * InformationPortal
 *
 * Information Portal screen
 *
 * @returns {JSX.Element}
 */
export const InformationalPortal = ({ navigation }) => {
  const { isDarkMode } = useGetTheme();
  const { t } = useTranslation("informational-portal-screen");

  // Content type tabs
  const [contentTabs, setContentTabs] = useState([
    { label: "articles", value: "articles", isSelected: true },
    { label: "videos", value: "videos", isSelected: false },
    { label: "podcasts", value: "podcasts", isSelected: false },
  ]);

  const handleTabSelect = (index) => {
    const tabsCopy = [...contentTabs];
    tabsCopy.forEach((tab, i) => {
      tab.isSelected = i === index;
    });
    setContentTabs(tabsCopy);
  };

  const selectedContentType =
    contentTabs.find((tab) => tab.isSelected)?.value || "articles";

  const heading = (
    <View>
      <AppText
        namedStyle="h3"
        style={[styles.heading, isDarkMode && styles.darkModeText]}
      >
        {t("heading")}
      </AppText>
      <AppText style={[styles.subheading, isDarkMode && styles.darkModeText]}>
        {t("subheading")}
      </AppText>
    </View>
  );

  return (
    <Screen hasHeaderNavigation t={t} hasEmergencyButton={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "position" : null}
        keyboardVerticalOffset={64}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <MascotHeadingBlock
            image={mascotHappyPurple}
            style={styles.headingBlock}
          >
            {heading}
          </MascotHeadingBlock>

          <View style={styles.tabsContainer}>
            <TabsUnderlined
              options={contentTabs.map((x) => ({
                ...x,
                label: t(x.label),
              }))}
              handleSelect={handleTabSelect}
            />
          </View>

          <InformationalPortalBlock
            navigation={navigation}
            contentType={selectedContentType}
          />
          <GiveSuggestion navigation={navigation} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  headingBlock: { paddingTop: 65 },
  heading: { color: appStyles.colorBlue_263238 },
  subheading: { marginTop: 16, color: appStyles.colorBlue_263238 },
  darkModeText: { color: appStyles.colorWhite_ff },
  tabsContainer: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
});

import React, { useState, useCallback, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import { Screen, AppText, TabsUnderlined } from "#components";
import {
  MascotHeadingBlock,
  InformationalPortal as InformationalPortalBlock,
  GiveSuggestion,
} from "#blocks";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";
import { Context } from "#services";

/**
 * InformationPortal
 *
 * Information Portal screen
 *
 * @returns {JSX.Element}
 */
export const InformationalPortal = ({ navigation }) => {
  const { isDarkMode } = useGetTheme();
  const { t } = useTranslation("screens", {
    keyPrefix: "informational-portal-screen",
  });
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { isPodcastsActive, isVideosActive } = useContext(Context);

  // Content type tabs
  const [contentTabs, setContentTabs] = useState([
    { label: "articles", value: "articles", isSelected: true },
  ]);

  useEffect(() => {
    let tabs = [...contentTabs];
    if (isPodcastsActive) {
      const podcastsTab = tabs.find((tab) => tab.value === "podcasts");
      if (!podcastsTab) {
        tabs.push({ label: "podcasts", value: "podcasts", isSelected: false });
      }
    }
    if (isVideosActive) {
      const videosTab = tabs.find((tab) => tab.value === "videos");
      if (!videosTab) {
        tabs.push({ label: "videos", value: "videos", isSelected: false });
      }
    }
    setContentTabs(tabs);
  }, [isPodcastsActive, isVideosActive]);

  const handleTabSelect = (index) => {
    const tabsCopy = [...contentTabs];
    tabsCopy.forEach((tab, i) => {
      tab.isSelected = i === index;
    });
    setContentTabs(tabsCopy);
  };

  const selectedContentType =
    contentTabs.find((tab) => tab.isSelected)?.value || "articles";

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      queryClient.invalidateQueries([`${selectedContentType}Ids`]),
      queryClient.invalidateQueries([`${selectedContentType}-createdAt`]),
      queryClient.invalidateQueries([`${selectedContentType}-popular`]),
    ]).finally(() => {
      setRefreshing(false);
    });
  }, [queryClient, selectedContentType]);

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
        <ScrollView
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          <MascotHeadingBlock style={styles.headingBlock}>
            {heading}
          </MascotHeadingBlock>

          {contentTabs.length > 1 && (
            <View style={styles.tabsContainer}>
              <TabsUnderlined
                options={contentTabs.map((x) => ({
                  ...x,
                  label: t(x.label),
                }))}
                handleSelect={handleTabSelect}
              />
            </View>
          )}

          <InformationalPortalBlock
            navigation={navigation}
            contentType={selectedContentType}
            onRefresh={onRefresh}
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

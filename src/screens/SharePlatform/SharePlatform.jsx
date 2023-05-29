import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";

import { Screen, Heading } from "#components";
import { SharePlatform as SharePlatformBlock } from "#blocks";

/**
 * SharePlatform
 *
 * SharePlatform page
 *
 * @returns {JSX.Element}
 */
export const SharePlatform = ({ navigation }) => {
  const { t } = useTranslation("share-platform-screen");

  return (
    <Screen>
      <Heading
        heading={t("heading")}
        subheading={t("subheading")}
        handleGoBack={() => navigation.goBack()}
      />
      <ScrollView style={{ marginTop: 112 }}>
        <SharePlatformBlock />
      </ScrollView>
    </Screen>
  );
};

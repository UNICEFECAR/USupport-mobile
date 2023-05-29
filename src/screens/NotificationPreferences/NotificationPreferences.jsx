import React from "react";

import { ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Screen, Heading } from "#components";

import { NotificationPreferences as NotificationPreferencesBlock } from "#blocks";

/**
 * NotificationPreferences
 *
 * Notification preferences screen
 *
 * @returns {JSX.Element}
 */
export const NotificationPreferences = ({ navigation }) => {
  const { t } = useTranslation("notification-preferences-screen");

  return (
    <Screen>
      <Heading
        heading={t("heading")}
        subheading={t("subheading")}
        handleGoBack={() => navigation.goBack()}
      />
      <ScrollView style={{ marginTop: 112 }}>
        <NotificationPreferencesBlock navigation={navigation} />
      </ScrollView>
    </Screen>
  );
};

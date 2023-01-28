import React from "react";
import { useTranslation } from "react-i18next";

import { Screen, Heading, Block } from "#components";

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
      <Block>
        <Heading
          heading={t("heading")}
          subheading={t("subheading")}
          handleGoBack={() => navigation.goBack()}
        />
      </Block>
      <NotificationPreferencesBlock navigation={navigation} />
    </Screen>
  );
};

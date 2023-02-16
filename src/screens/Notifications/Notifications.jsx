import React from "react";
import { useTranslation } from "react-i18next";

import { Screen } from "#components";
import { Notifications as NotificationsBlock } from "#blocks";

/**
 * Notifications
 *
 * Notifiations screen
 *
 * @returns {JSX.Element}
 */
export const Notifications = ({ navigation }) => {
  const { t } = useTranslation("notifications");

  return (
    <Screen>
      <NotificationsBlock navigation={navigation} />
    </Screen>
  );
};

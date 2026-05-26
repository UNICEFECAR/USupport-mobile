import React from "react";

import { ScrollView } from "react-native";

import { Screen } from "#components";

import { NotificationPreferences as NotificationPreferencesBlock } from "#blocks";

/**
 * NotificationPreferences
 *
 * Notification preferences screen
 *
 * @returns {JSX.Element}
 */
export const NotificationPreferences = ({ navigation }) => {
  return (
    <Screen>
      <ScrollView>
        <NotificationPreferencesBlock navigation={navigation} />
      </ScrollView>
    </Screen>
  );
};

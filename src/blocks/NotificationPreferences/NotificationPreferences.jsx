import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import {
  Block,
  AppText,
  Toggle,
  RadioButtonSelectorGroup,
  Loading,
} from "#components";

import {
  useGetNotificationPreferences,
  useUpdateNotificationPreferences,
  useError,
  useGetClientData,
} from "#hooks";

/**
 * NotificationPreferences
 *
 * Notification preferences block
 *
 * @return {jsx}
 */
export const NotificationPreferences = () => {
  const { t } = useTranslation("notification-preferences");

  const minutes = [15, 30, 45, 60];
  const consultationReminderOptions = minutes.map((x) => ({
    label: `${x} ${t("minutes_before")}`,
    value: x,
  }));

  const [error, setError] = useState();
  const [notificationPreferencesQuery] = useGetNotificationPreferences();
  const clientDataQuery = useGetClientData()[0];

  const data = notificationPreferencesQuery.data;

  const onUpdateError = (error) => {
    const { message: errorMessage } = useError(error);
    setError(errorMessage);
  };
  const notificationsPreferencesMutation = useUpdateNotificationPreferences(
    () => {},
    onUpdateError
  );

  const handleChange = (field, value) => {
    const dataCopy = { ...data };
    dataCopy[field] = value;
    notificationsPreferencesMutation.mutate(dataCopy);
  };

  return (
    <Block style={{ paddingBottom: 30 }}>
      {notificationPreferencesQuery.isLoading &&
      !clientDataQuery.isLoading &&
      !notificationPreferencesQuery.data ? (
        <View style={styles.loadingContainer}>
          <Loading size="lg" />
        </View>
      ) : (
        <View>
          {clientDataQuery.data.email && (
            <View style={styles.toggleContainer}>
              <AppText>{t("email")}</AppText>
              <Toggle
                isToggled={data?.email}
                handleToggle={(value) => handleChange("email", value)}
                style={styles.toggle}
              />
            </View>
          )}
          <View style={styles.toggleContainer}>
            <AppText>{t("appointment")}</AppText>
            <Toggle
              isToggled={
                data?.consultationReminder ? data?.consultationReminder : false
              }
              handleToggle={(value) =>
                handleChange("consultationReminder", value)
              }
              style={styles.toggle}
            />
          </View>
          <View style={styles.radioButtonSelectorGroup}>
            {data?.consultationReminder && (
              <RadioButtonSelectorGroup
                selected={data.consultationReminderMin}
                setSelected={(value) =>
                  handleChange("consultationReminderMin", value)
                }
                options={consultationReminderOptions}
              />
            )}
          </View>
          {error ? <ErrorComponent message={error} /> : null}
        </View>
      )}
    </Block>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleContainer: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  radioButtonSelectorGroup: {
    marginTop: 24,
    alignItems: "center",
  },
});

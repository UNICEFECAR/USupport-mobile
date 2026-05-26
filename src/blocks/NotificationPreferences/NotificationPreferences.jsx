import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import {
  Block,
  RadioButton,
  Dropdown,
  Loading,
  Heading,
  Error,
} from "#components";
import { Context } from "#services";
import { showToast } from "#utils";

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
export const NotificationPreferences = ({ navigation }) => {
  const { t } = useTranslation("blocks", {
    keyPrefix: "notification-preferences",
  });
  const { country } = useContext(Context);

  const minutes = [15, 30, 45, 60];
  const consultationReminderOptions = minutes.map((x) => ({
    label: `${x} ${t("minutes_before")}`,
    value: x,
  }));

  const [error, setError] = useState();
  const [notificationPreferencesQuery] = useGetNotificationPreferences();
  const clientDataQuery = useGetClientData()[0];

  const data = notificationPreferencesQuery.data;

  const isAnon = !clientDataQuery.data?.email;

  const onUpdateError = (error) => {
    const { message: errorMessage } = useError(error);
    setError(errorMessage);
  };
  const notificationsPreferencesMutation = useUpdateNotificationPreferences(
    () => showToast({ message: t("success") }),
    onUpdateError
  );

  const handleChange = (field, value) => {
    const dataCopy = { ...data };
    dataCopy[field] = value;
    notificationsPreferencesMutation.mutate(dataCopy);
  };

  const IS_RO = country === "RO";

  return (
    <Block style={{ paddingBottom: 30 }}>
      <Heading
        heading={t("heading")}
        subheading={t("subheading")}
        handleGoBack={() => navigation.goBack()}
      />
      {notificationPreferencesQuery.isLoading &&
      clientDataQuery.isLoading &&
      !notificationPreferencesQuery.data ? (
        <View style={styles.loadingContainer}>
          <Loading size="lg" />
        </View>
      ) : (
        <View>
          {!isAnon && (
            <View style={styles.radioRow}>
              <RadioButton
                label={t("email")}
                isChecked={data?.email}
                setIsChecked={(value) => handleChange("email", value)}
              />
            </View>
          )}
          {!IS_RO && (
            <View>
              <View style={styles.radioRow}>
                <RadioButton
                  label={t("appointment")}
                  isChecked={data?.consultationReminder}
                  setIsChecked={(value) =>
                    handleChange("consultationReminder", value)
                  }
                />
              </View>
              {data?.consultationReminder ? (
                <Dropdown
                  selected={data.consultationReminderMin}
                  setSelected={(value) =>
                    handleChange("consultationReminderMin", value)
                  }
                  options={consultationReminderOptions}
                  dropdownId="notificationPreferencesReminderMin"
                  style={styles.reminderDropdown}
                />
              ) : null}
              {error ? <Error message={error} /> : null}
            </View>
          )}
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
  radioRow: {
    marginTop: 24,
  },
  reminderDropdown: {
    marginTop: 16,
    zIndex: 3,
  },
});

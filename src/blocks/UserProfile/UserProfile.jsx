import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet, ScrollView } from "react-native";

import {
  Block,
  Heading,
  ButtonWithIcon,
  AppText,
  ButtonSelector,
} from "#components";

import { useGetClientData } from "#hooks";

import { appStyles } from "#styles";

import { Context } from "#services";

import { AMAZON_S3_BUCKET } from "@env";

import { useLogout } from "#hooks";

/**
 * UserProfile
 *
 * UserProfile block
 *
 * @return {jsx}
 */
export const UserProfile = ({ navigation }) => {
  const { t } = useTranslation("user-profile");

  const { setToken, isTmpUser, handleRegistrationModalOpen } =
    useContext(Context);

  const [displayName, setDisplayName] = useState("");

  const clientQueryArray = useGetClientData(isTmpUser ? false : true);
  const clientData = isTmpUser ? {} : clientQueryArray[0].data;

  useEffect(() => {
    if (clientData) {
      if (clientData.name && clientData.surname) {
        setDisplayName(`${clientData.name} ${clientData.surname}`);
      } else {
        setDisplayName(clientData.nickname);
      }
    }
  }, [clientData]);

  const protectedPages = [
    "UserDetails",
    "Passcode",
    "NotificationPreferences",
    "PlatformRating",
  ];
  const handleRedirect = (redirectTo) => {
    if (protectedPages.includes(redirectTo) && isTmpUser) {
      handleRegistrationModalOpen();
    } else {
      navigation.push(redirectTo);
    }
  };

  const handleLogout = useLogout(setToken);

  return (
    <Block style={styles.block}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Heading
          heading={t("heading")}
          subheading={t("subheading")}
          buttonComponent={
            <ButtonWithIcon
              iconName="exit"
              label={t("button_label")}
              onPress={handleLogout}
              size="md"
            />
          }
          handleGoBack={() => navigation.goBack()}
        />

        <View style={styles.group}>
          <AppText style={styles.groupHeading}>
            {t("first_group_heading")}
          </AppText>
          <ButtonSelector
            label={displayName || t("guest")}
            onPress={() => handleRedirect("UserDetails")}
            avatar={{
              uri: `${AMAZON_S3_BUCKET}/${clientData?.image || "default"}`,
            }}
            style={[styles.buttonSelector, styles.buttonSelectorFirstInGroup]}
          />
          {!isTmpUser && (
            <ButtonSelector
              label={t("mood_tracker_button_label")}
              onPress={() => handleRedirect("MoodTracker")}
              iconName="mood"
              style={styles.buttonSelector}
            />
          )}
        </View>

        <View style={styles.group}>
          <AppText style={styles.groupHeading}>
            {t("second_group_heading")}
          </AppText>
          <ButtonSelector
            iconName="fingerprint"
            label={t("passcoode_and_biometrics_button_label")}
            onPress={() => handleRedirect("Passcode")}
            style={[styles.buttonSelector, styles.buttonSelectorFirstInGroup]}
          />
          <ButtonSelector
            label={t("notifications_settings_button_label")}
            iconName="notification"
            onPress={() => handleRedirect("NotificationPreferences")}
            style={styles.buttonSelector}
          />
        </View>

        <View style={styles.group}>
          <AppText style={styles.groupHeading}>{t("rate_share")}</AppText>
          <ButtonSelector
            label={t("rate_us_button_label")}
            iconName="star"
            onPress={() => handleRedirect("PlatformRating")}
            style={[styles.buttonSelector, styles.buttonSelectorFirstInGroup]}
          />
          <ButtonSelector
            label={t("share_button_label")}
            iconName="share"
            onPress={() => handleRedirect("SharePlatform")}
            style={styles.buttonSelector}
          />
        </View>

        <View style={[styles.group, styles.lastGroup]}>
          <AppText style={styles.groupHeading}>{t("other")}</AppText>
          {!isTmpUser ? (
            <ButtonSelector
              label={t("payments_history_button_label")}
              iconName="payment-history"
              style={[styles.buttonSelector, styles.buttonSelectorFirstInGroup]}
              onPress={() => handleRedirect("PaymentHistory")}
            />
          ) : null}
          <ButtonSelector
            label={t("contact_us_button_label")}
            iconName="comment"
            onPress={() => handleRedirect("ContactUs")}
            style={styles.buttonSelector}
          />
          <ButtonSelector
            label={t("privacy_policy_button_label")}
            iconName="document"
            onPress={() => handleRedirect("PrivacyPolicy")}
            style={styles.buttonSelector}
          />
          <ButtonSelector
            label={t("terms_and_conditions")}
            iconName="document"
            onPress={() => handleRedirect("TermsOfUse")}
            style={styles.buttonSelector}
          />
          <ButtonSelector
            label={t("FAQ_button_label")}
            iconName="info"
            onPress={() => handleRedirect("FAQ")}
            style={styles.buttonSelector}
          />
        </View>
      </ScrollView>
    </Block>
  );
};

const styles = StyleSheet.create({
  group: {
    marginTop: 24,
    display: "flex",
  },

  lastGroup: {
    paddingBottom: 50,
  },

  groupHeading: {
    color: appStyles.colorBlue_3d527b,
    fontFamily: "Nunito_600SemiBold",
  },

  buttonSelector: {
    marginTop: 16,
    alignSelf: "center",
  },

  buttonSelectorFirstInGroup: {
    marginTop: 4,
  },
});

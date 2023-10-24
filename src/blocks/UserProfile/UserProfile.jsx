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

import { useGetClientData, useLogout } from "#hooks";

import { appStyles } from "#styles";

import { Context } from "#services";

import Config from "react-native-config";
const { AMAZON_S3_BUCKET } = Config;

/**
 * UserProfile
 *
 * UserProfile block
 *
 * @return {jsx}
 */
export const UserProfile = ({ navigation }) => {
  const { t } = useTranslation("user-profile");

  const { isTmpUser, handleRegistrationModalOpen } = useContext(Context);

  const clientQuery = useGetClientData(isTmpUser ? false : true)[0];
  const clientData = isTmpUser ? {} : clientQuery?.data;

  const displayName = clientData?.name
    ? `${clientData?.name} ${clientData?.surname}`
    : clientData?.nickname;

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

  const handleLogout = useLogout();

  return (
    <React.Fragment>
      <Heading
        heading={t("heading")}
        subheading={t("subheading")}
        buttonComponent={
          <ButtonWithIcon
            iconName="exit"
            label={t("button_label")}
            onPress={handleLogout}
            size="lg"
            iconSize="md"
            style={{ paddingVertical: 5 }}
          />
        }
        handleGoBack={() => navigation.goBack()}
      />
      <Block style={styles.block}>
        <ScrollView showsVerticalScrollIndicator={false}>
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
            <ButtonSelector
              label={t("language_button_label")}
              iconName="globe"
              onPress={() => handleRedirect("ChangeLanguage")}
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
            {/* <ButtonSelector
              label={t("share_button_label")}
              iconName="share"
              onPress={() => handleRedirect("SharePlatform")}
              style={styles.buttonSelector}
            /> */}
          </View>

          <View style={[styles.group, styles.lastGroup]}>
            <AppText style={styles.groupHeading}>{t("other")}</AppText>
            {!isTmpUser ? (
              <ButtonSelector
                label={t("payments_history_button_label")}
                iconName="payment-history"
                style={styles.buttonSelector}
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
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  block: {
    marginTop: 112,
  },
  buttonSelector: {
    alignSelf: "center",
    marginTop: 16,
  },

  buttonSelectorFirstInGroup: {
    marginTop: 4,
  },

  group: {
    display: "flex",
    marginTop: 24,
  },

  groupHeading: {
    color: appStyles.colorBlue_3d527b,
    fontFamily: "Nunito_600SemiBold",
  },

  lastGroup: {
    paddingBottom: 50,
  },
});

import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Linking } from "react-native";
import Config from "react-native-config";
import DeviceInfo from "react-native-device-info";

import { Block, Heading, AppText, ButtonSelector } from "#components";
import { useGetTheme } from "#hooks";
import { appStyles } from "#styles";

import { useProfileMenu } from "./useProfileMenu";

const { AMAZON_S3_BUCKET } = Config;

export const UserProfile = ({ navigation }) => {
  const { colors } = useGetTheme();

  const [version, setVersion] = useState("");

  const {
    t,
    isTmpUser,
    clientData,
    displayName,
    SHOW_PAYMENT_HISTORY,
    handleRedirect,
    languagesData,
    handlOpenLanguageDropdown,
    handleThemeChange,
    handleHighContrast,
    isDarkMode,
  } = useProfileMenu(navigation);

  useEffect(() => {
    const getAppVersion = async () => {
      const appVersion = await DeviceInfo.getVersion();
      setVersion(appVersion);
    };

    getAppVersion();
  }, []);

  return (
    <React.Fragment>
      <Heading
        heading={t("heading")}
        subheading={t("subheading")}
        handleGoBack={() => navigation.goBack()}
      />
      <Block style={{ paddingBottom: 200 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.group}>
            <AppText style={(styles.groupHeading, { color: colors.text })}>
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
            <ButtonSelector
              iconName="mood"
              label={t("mood_tracker_button_label")}
              onPress={() => handleRedirect("MoodTracker")}
              style={styles.buttonSelector}
            />
          </View>

          <View style={styles.group}>
            <AppText style={(styles.groupHeading, { color: colors.text })}>
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
              onPress={languagesData && handlOpenLanguageDropdown}
              style={styles.buttonSelector}
            />
            <ButtonSelector
              label={
                isDarkMode
                  ? t("light_mode_button_label")
                  : t("dark_mode_button_label")
              }
              iconName={isDarkMode ? "sun" : "moon"}
              onPress={handleThemeChange}
              style={styles.buttonSelector}
            />
            <ButtonSelector
              iconName="accessibility"
              label={t("high_contrast_mode")}
              onPress={handleHighContrast}
              style={styles.buttonSelector}
            />
          </View>

          <View style={styles.group}>
            <AppText style={(styles.groupHeading, { color: colors.text })}>
              {t("rate_share")}
            </AppText>
            <ButtonSelector
              label={t("rate_us_button_label")}
              iconName="star"
              onPress={() => handleRedirect("PlatformRating")}
              style={[styles.buttonSelector, styles.buttonSelectorFirstInGroup]}
            />
          </View>

          <View style={[styles.group]}>
            <AppText style={(styles.groupHeading, { color: colors.text })}>
              {t("other")}
            </AppText>
            {SHOW_PAYMENT_HISTORY && !isTmpUser ? (
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
              label={t("user_guide")}
              iconName="document"
              onPress={() =>
                Linking.openURL(
                  "https://7digit-1.gitbook.io/usupport/y0yJCW2nZ6Sb52p4arjv"
                )
              }
              style={styles.buttonSelector}
            />
            <ButtonSelector
              label={t("FAQ_button_label")}
              iconName="info"
              onPress={() => handleRedirect("FAQ")}
              style={styles.buttonSelector}
            />
            <AppText
              namedStyle="smallText"
              style={[styles.versionText, { paddingTop: 20 }]}
            >
              uSupport
            </AppText>
            <AppText
              namedStyle="smallText"
              style={[styles.versionText, { paddingBottom: 30 }]}
            >
              V{version}
            </AppText>
          </View>
        </ScrollView>
      </Block>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
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
    fontFamily: appStyles.fontSemiBold,
  },

  versionText: {
    textAling: "center",
    alignSelf: "center",
  },
});

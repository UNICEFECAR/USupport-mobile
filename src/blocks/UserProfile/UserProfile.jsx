import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet, ScrollView, Linking } from "react-native";
import Config from "react-native-config";
import { useQuery } from "@tanstack/react-query";

import { Block, Heading, AppText, ButtonSelector } from "#components";
import { useGetTheme, useGetClientData } from "#hooks";
import { appStyles } from "#styles";
import { Context, localStorage, languageSvc, userSvc } from "#services";
const { AMAZON_S3_BUCKET, GIT_BOOK_URL } = Config;

/**
 * UserProfile
 *
 * UserProfile block
 *
 * @return {jsx}
 */
export const UserProfile = ({ navigation }) => {
  const { isDarkMode, colors } = useGetTheme();
  const { t, i18n } = useTranslation("user-profile");
  const { theme, setTheme } = useContext(Context);

  const { isTmpUser, handleRegistrationModalOpen } = useContext(Context);
  const [languagesData, setLanguagesData] = useState({
    language: "",
  });
  const { dropdownOptions, setDropdownOptions } = useContext(Context);

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

  const fetchLanguages = async () => {
    const localStorageLanguage = await localStorage.getItem("language");
    if (localStorageLanguage) {
      setLanguagesData({
        language: localStorageLanguage,
      });
    }
    const res = await languageSvc.getActiveLanguages();
    const languages = res.data.map((x) => {
      const languageObject = {
        value: x.alpha2,
        label: x.name === "English" ? x.name : `${x.name} (${x.local_name})`,
        id: x["language_id"],
      };
      if (localStorageLanguage === x.alpha2) {
        setLanguagesData({ language: x.alpha2 });
        i18n.changeLanguage(localStorageLanguage);
      }
      return languageObject;
    });
    return languages;
  };
  const languagesQuery = useQuery(["languages"], fetchLanguages);

  const handleChangeLanguage = async (lang) => {
    setLanguagesData({ language: lang });
    i18n.changeLanguage(lang);
    await localStorage.setItem("language", lang);

    try {
      await userSvc.changeLanguage(lang).then((lang) => {
        setDropdownOptions({
          heading: t("language_button_label"),
          options: languagesQuery.data || [],
          selectedOption: languagesData.language,
          handleOptionSelect: handleChangeLanguage,
          isOpen: false,
        });
      });
    } catch (err) {
      console.log(err, "err");
    }
  };

  const handlOpenLanguageDropdown = () => {
    if (dropdownOptions.isOpen) {
      setDropdownOptions({
        heading: t("language_button_label"),
        options: languagesQuery.data || [],
        selectedOption: languagesData.language,
        handleOptionSelect: handleChangeLanguage,
        isOpen: false,
      });
    } else {
      setDropdownOptions({
        heading: t("language_button_label"),
        options: languagesQuery.data || [],
        selectedOption: languagesData.language,
        dropdownId: "filterLanguage",
        handleOptionSelect: handleChangeLanguage,
        isOpen: true,
      });
    }
  };

  const handleThemeChange = async () => {
    if (theme === "dark") {
      setTheme("light");
      await localStorage.setItem("theme", "light");
    } else {
      setTheme("dark");
      await localStorage.setItem("theme", "dark");
    }
  };

  return (
    <React.Fragment>
      <Heading
        heading={t("heading")}
        subheading={t("subheading")}
        handleGoBack={() => navigation.goBack()}
      />
      <Block style={styles.block}>
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
            {/* <ButtonSelector
              label={t("share_button_label")}
              iconName="share"
              onPress={() => handleRedirect("SharePlatform")}
              style={styles.buttonSelector}
            /> */}
          </View>

          <View style={[styles.group, styles.lastGroup]}>
            <AppText style={(styles.groupHeading, { color: colors.text })}>
              {t("other")}
            </AppText>
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
              label={t("user_guide")}
              iconName="document"
              onPress={() => Linking.openURL(GIT_BOOK_URL)}
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
    paddingBottom: 90,
  },
});

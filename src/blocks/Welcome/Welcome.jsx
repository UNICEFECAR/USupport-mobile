import React, { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Config from "react-native-config";

import {
  AppText,
  NewButton,
  Block,
  Dropdown,
  TransparentModal,
  Input,
  CachedImage,
} from "#components";
import {
  languageSvc,
  countrySvc,
  localStorage,
  Context,
  userSvc,
} from "#services";
import { useError, useGetTheme } from "#hooks";

const { AMAZON_S3_BUCKET } = Config;

export function Welcome({ navigation }) {
  const { isDarkMode } = useGetTheme();
  const { t, i18n } = useTranslation("blocks", { keyPrefix: "welcome" });
  const queryClient = useQueryClient();
  const {
    setCurrencySymbol,
    setCountry,
    setSelectedCountry: setSelectedCountryObject,
    setIsPodcastsActive,
    setIsVideosActive,
    setToken,
  } = useContext(Context);
  const [selectedCountry, setSelectedCountry] = useState(null); // alpha2 for dropdown
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isRoPasswordModalOpen, setIsRoPasswordModalOpen] = useState(false);
  const [roPassword, setRoPassword] = useState("");
  const [roPasswordError, setRoPasswordError] = useState("");

  useEffect(() => {
    localStorage.getItem("country").then((country) => {
      if (country) {
        setSelectedCountry(country);
      }
    });
  }, []);

  const fetchCountries = async () => {
    const localStorageCountry = await localStorage.getItem("country");
    const localStorageCountryID = await localStorage.getItem("country_id");

    const res = await countrySvc.getActiveCountries();
    const countries = res.data.map((x) => {
      const countryObject = {
        value: x.alpha2,
        label: x.name,
        countryID: x.country_id,
        minAge: x.min_client_age,
        maxAge: x.max_client_age,
        currencySymbol: x.symbol,
        localName: x.local_name,
        podcastsActive: x.podcasts_active,
        videosActive: x.videos_active,
        hasPayments: x.has_payments,
        hasCoupons: x.has_coupons,
        hasFreeConsultations: x.has_free_consultations,
        defaultBillingType: x.default_billing_type,
        defaultCouponCode: x.default_coupon_code,
      };
      if (localStorageCountry === x.alpha2) {
        if (!localStorageCountryID) {
          localStorage.setItem("country_id", x["country_id"]);
        }
        setCurrencySymbol(countryObject.currencySymbol);
        setSelectedCountryObject(countryObject);
        setCountry(x.alpha2);
        setIsPodcastsActive(countryObject.podcastsActive);
        setIsVideosActive(countryObject.videosActive);
      }

      return countryObject;
    });
    return countries;
  };

  const fetchLanguages = async () => {
    const localStorageLanguage = await localStorage.getItem("language");

    const res = await languageSvc.getActiveLanguages();
    const languages = res.data.map((x) => {
      const languageObject = {
        value: x.alpha2,
        label: x.name === "English" ? x.name : `${x.name} (${x.local_name})`,
        id: x["language_id"],
      };
      if (localStorageLanguage === x.alpha2) {
        setSelectedLanguage(x.alpha2);
        i18n.changeLanguage(localStorageLanguage);
      }
      return languageObject;
    });
    return languages;
  };

  const countriesQuery = useQuery(["countries"], fetchCountries, {
    retry: false,
  });
  const languagesQuery = useQuery(
    ["languages", selectedCountry],
    fetchLanguages,
    {
      retry: false,
    }
  );

  const handleSelectCountry = async (option) => {
    const countryObject = countriesQuery.data?.find((x) => x.value === option);
    await localStorage.setItem("country", option);
    setSelectedCountry(option);
    setSelectedCountryObject(countryObject ?? null);
    setCountry(option);
  };

  const continueToRegisterPreview = () => {
    const countryCode = selectedCountry;
    const language = selectedLanguage;

    if (!countriesQuery.data) {
      console.error("Countries data not loaded");
      return;
    }

    const selectedCountryObject = countriesQuery.data.find(
      (x) => x.value === selectedCountry
    );

    if (!selectedCountryObject) {
      console.error("Selected country not found in data");
      return;
    }

    const currencySymbol = selectedCountryObject.currencySymbol;

    setCurrencySymbol(currencySymbol);
    setCountry(country);
    setSelectedCountryObject(selectedCountryObject);
    setIsPodcastsActive(selectedCountryObject.podcastsActive);
    setIsVideosActive(selectedCountryObject.videosActive);

    localStorage.setItem("country", country);
    localStorage.setItem("country_id", selectedCountryObject.countryID);
    localStorage.setItem("language", language);
    if (currencySymbol) {
      localStorage.setItem("currency_symbol", currencySymbol);
    }
    const minAge = selectedCountryObject.minAge;
    localStorage.setItem("minAge", minAge != null ? minAge.toString() : "0");

    navigation.push(navigateTo);
  };

  const tmpLogin = async () => {
    const res = await userSvc.tmpLogin();
    return res.data;
  };

  const tmpLoginMutation = useMutation(tmpLogin, {
    onSuccess: async (data) => {
      const { token, expiresIn, refreshToken } = data.token;
      await localStorage.setItem("token", token);
      localStorage.setItem("expires-in", expiresIn);
      localStorage.setItem("refresh-token", refreshToken);

      queryClient.setQueryData(
        ["client-data"],
        userSvc.transformUserData(data)
      );

      setToken(token);
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      setErrror(errorMessage);
    },
  });

  const handleContinueAsGuest = () => {
    tmpLoginMutation.mutate();
  };

  const handleCloseRoPasswordModal = () => {
    setIsRoPasswordModalOpen(false);
    setRoPassword("");
    setRoPasswordError("");
  };

  const validatePlatformPasswordMutation = useMutation(
    async (value) => {
      return await userSvc.validatePlatformPassword(value);
    },
    {
      onError: (error) => {
        const { message: errorMessage } = useError(error);
        setRoPasswordError(errorMessage);
      },
      onSuccess: () => {
        queryClient.setQueryData(["hasPassedValidation"], true);
        handleCloseRoPasswordModal();
        continueToRegisterPreview();
      },
    }
  );

  const handleSubmitRoPassword = () => {
    const trimmedPassword = roPassword.trim();
    if (!trimmedPassword) {
      setRoPasswordError(t("ro_password_modal_error"));
      return;
    }
    validatePlatformPasswordMutation.mutate(trimmedPassword);
  };

  const handleContinue = () => {
    if (selectedCountry === "RO") {
      setRoPasswordError("");
      setIsRoPasswordModalOpen(true);
      return;
    }

    continueToRegisterPreview();
  };

  const IS_RO = selectedCountry === "RO";
  const imageUrl = IS_RO
    ? `${AMAZON_S3_BUCKET}/logo-vertical-ro`
    : isDarkMode
      ? `${AMAZON_S3_BUCKET}/logo-vertical-dark`
      : `${AMAZON_S3_BUCKET}/logo-vertical`;

  return (
    <ScrollView contentContainerStyle={styles.flexGrow}>
      <Block style={styles.flexGrow}>
        <View style={styles.headingContainer}>
          <AppText namedStyle="h2">{t("heading")}</AppText>
          <CachedImage
            resizeMode="contain"
            source={{
              uri: imageUrl,
            }}
            style={styles.logo}
          />
        </View>
        <View style={styles.dropdownsContainer}>
          {selectedCountry === "PL" && (
            <AppText style={{ paddingBottom: 16 }}>
              {t("poland_description")}
            </AppText>
          )}
          <Dropdown
            options={countriesQuery.data?.map((x) => {
              return {
                ...x,
                label: `${x.label} (${x.localName})`,
              };
            })}
            selected={selectedCountry}
            setSelected={handleSelectCountry}
            label={t("country")}
            placeholder={t("placeholder")}
            style={[styles.dropdown, { zIndex: 3 }]}
            dropdownId="country"
          />

          <Dropdown
            isLoading={languagesQuery.isFetching}
            options={languagesQuery.data}
            disabled={!selectedCountry || languagesQuery.data?.length === 0}
            selected={selectedLanguage}
            setSelected={(lang) => {
              setSelectedLanguage(lang);
              i18n.changeLanguage(lang);
            }}
            label={t("language")}
            placeholder={t("placeholder")}
            style={[styles.dropdown, { zIndex: 2 }]}
            dropdownId="language"
          />
        </View>
        <View style={styles.buttonContainer}>
          <View style={styles.buttonWrapper}>
            <NewButton
              label={t("register_with_email")}
              disabled={!selectedCountry || !selectedLanguage}
              onPress={() => handleContinue({ navigateTo: "RegisterEmail" })}
              style={styles.button}
            />
            <NewButton
              label={t("register_anonymously")}
              type="outline"
              disabled={!selectedCountry || !selectedLanguage}
              onPress={() =>
                handleContinue({ navigateTo: "RegisterAnonymous" })
              }
              style={styles.button}
            />
          </View>
          <NewButton
            label={t("continue_as_guest")}
            type="ghost-purple"
            disabled={!selectedCountry || !selectedLanguage}
            onPress={handleContinueAsGuest}
            style={{
              marginTop: 10,
              marginInline: "auto",
            }}
            isFullWidth
          />
        </View>
        <TransparentModal
          isOpen={isRoPasswordModalOpen}
          handleClose={handleCloseRoPasswordModal}
          heading={t("ro_password_modal_heading")}
          text={t("ro_password_modal_text")}
          ctaLabel={t("ro_password_modal_cta")}
          ctaHandleClick={handleSubmitRoPassword}
          isCtaLoading={validatePlatformPasswordMutation.isLoading}
          errorMessage={roPasswordError}
        >
          <Input
            label={t("ro_password_modal_input_label")}
            placeholder={t("ro_password_modal_input_placeholder")}
            value={roPassword}
            isPassword={true}
            onChange={(value) => {
              setRoPassword(value);
              if (roPasswordError) {
                setRoPasswordError("");
              }
            }}
            style={styles.passwordInput}
          />
        </TransparentModal>
      </Block>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headingContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  logo: { width: 300, height: 150, marginTop: 16 },
  dropdown: { marginBottom: 24 },
  dropdownsContainer: {
    flex: 1,
    justifyContent: "flex-end",
    zIndex: 2,
    alignItems: "center",
  },
  buttonContainer: {
    justifyContent: "flex-end",
    marginBottom: 30,
    flexDirection: "column",
    alignItems: "center",
  },
  passwordInput: {
    marginTop: 12,
    marginBottom: 20,
  },
  flexGrow: { flexGrow: 1 },
});

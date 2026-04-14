import React, { useContext, useEffect, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Backdrop,
  AppText,
  Dropdown,
  Input,
  NewButton,
  TransparentModal,
} from "#components";
import {
  Context,
  countrySvc,
  languageSvc,
  localStorage,
  userSvc,
} from "#services";
import { useAddCountryEvent, useError } from "#hooks";

import { getAuthBackdropProps } from "../authBackdropProps";

export function AuthWelcomeModal({
  onRegisterEmail,
  onRegisterAnonymous,
  onLogin,
}) {
  const { t, i18n } = useTranslation("blocks", { keyPrefix: "welcome" });
  const queryClient = useQueryClient();
  const addCountryEventMutation = useAddCountryEvent();
  const {
    setToken,
    setCurrencySymbol,
    setCountry,
    setSelectedCountry,
    setIsPodcastsActive,
    setIsVideosActive,
  } = useContext(Context);

  const [selectedCountry, setSelectedCountryCode] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const [isRoPasswordModalOpen, setIsRoPasswordModalOpen] = useState(false);
  const [roPassword, setRoPassword] = useState("");
  const [roPasswordError, setRoPasswordError] = useState("");

  useEffect(() => {
    localStorage.getItem("country").then((country) => {
      if (country) setSelectedCountryCode(country);
    });
    localStorage.getItem("language").then((lang) => {
      if (lang) {
        setSelectedLanguage(lang);
        i18n.changeLanguage(lang);
      }
    });
  }, [i18n]);

  const fetchCountries = async () => {
    const res = await countrySvc.getActiveCountries();
    return res.data.map((x) => ({
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
    }));
  };

  const fetchLanguages = async () => {
    const res = await languageSvc.getActiveLanguages();
    return res.data.map((x) => ({
      value: x.alpha2,
      label: x.name === "English" ? x.name : `${x.name} (${x.local_name})`,
      id: x["language_id"],
    }));
  };

  const countriesQuery = useQuery(["countries"], fetchCountries, {
    retry: false,
  });
  const languagesQuery = useQuery(
    ["languages", selectedCountry],
    fetchLanguages,
    {
      retry: false,
      enabled: !!selectedCountry,
    }
  );

  const handleSelectCountry = async (alpha2) => {
    const countryObject =
      countriesQuery.data?.find((x) => x.value === alpha2) ?? null;
    await localStorage.setItem("country", alpha2);
    setSelectedCountryCode(alpha2);

    setSelectedCountry(countryObject);
    setCountry(alpha2);
    if (countryObject?.currencySymbol)
      setCurrencySymbol(countryObject.currencySymbol);
    setIsPodcastsActive(!!countryObject?.podcastsActive);
    setIsVideosActive(!!countryObject?.videosActive);
  };

  const canProceed = useMemo(() => {
    return !!selectedCountry && !!selectedLanguage;
  }, [selectedCountry, selectedLanguage]);

  const persistSelection = async () => {
    if (!countriesQuery.data) return false;

    const selectedCountryObject = countriesQuery.data.find(
      (x) => x.value === selectedCountry
    );
    if (!selectedCountryObject) return false;

    setSelectedCountry(selectedCountryObject);
    setCountry(selectedCountry);
    setCurrencySymbol(selectedCountryObject.currencySymbol);
    setIsPodcastsActive(!!selectedCountryObject.podcastsActive);
    setIsVideosActive(!!selectedCountryObject.videosActive);

    await localStorage.setItem("country", selectedCountry);
    await localStorage.setItem("country_id", selectedCountryObject.countryID);
    await localStorage.setItem("language", selectedLanguage);
    if (selectedCountryObject.currencySymbol) {
      await localStorage.setItem(
        "currency_symbol",
        selectedCountryObject.currencySymbol
      );
    }
    const minAge = selectedCountryObject.minAge;
    await localStorage.setItem("minAge", minAge != null ? String(minAge) : "0");
    return true;
  };

  const handleCloseRoPasswordModal = () => {
    setIsRoPasswordModalOpen(false);
    setRoPassword("");
    setRoPasswordError("");
  };

  const validatePlatformPasswordMutation = useMutation(
    async (value) => await userSvc.validatePlatformPassword(value),
    {
      onError: (error) => {
        const { message: errorMessage } = useError(error);
        setRoPasswordError(errorMessage);
      },
      onSuccess: () => {
        queryClient.setQueryData(["hasPassedValidation"], true);
        handleCloseRoPasswordModal();
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

  const tmpLoginMutation = useMutation(async () => await userSvc.tmpLogin(), {
    onSuccess: async (res) => {
      const data = res.data;
      const { token, expiresIn, refreshToken } = data.token;
      await localStorage.setItem("token", token);
      await localStorage.setItem("expires-in", expiresIn);
      await localStorage.setItem("refresh-token", refreshToken);
      setToken(token);
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      console.error(errorMessage);
    },
  });

  const handleAction = async (action) => {
    if (!canProceed) return;

    const ok = await persistSelection();
    if (!ok) return;

    const eventMap = {
      email: "mobile_email_register_click",
      anonymously: "mobile_anonymous_register_click",
      guest: "mobile_guest_register_click",
    };
    if (eventMap[action]) {
      addCountryEventMutation.mutate({ eventType: eventMap[action] });
    }

    if (action === "email") return onRegisterEmail?.();
    if (action === "anonymously") return onRegisterAnonymous?.();
    if (action === "login") return onLogin?.();
    if (action === "guest") return tmpLoginMutation.mutate();
  };

  return (
    <Backdrop {...getAuthBackdropProps()}>
      <View style={styles.dropdownsContainer}>
        {selectedCountry === "PL" ? (
          <AppText style={styles.plDescription}>
            {t("poland_description")}
          </AppText>
        ) : null}

        <Dropdown
          options={countriesQuery.data?.map((x) => ({
            ...x,
            label: `${x.label} (${x.localName})`,
          }))}
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
          disabled={
            !selectedCountry || (languagesQuery.data?.length ?? 0) === 0
          }
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

      <View style={styles.buttonsContainer}>
        <View style={styles.buttonsRow}>
          <NewButton
            label={t("register_email")}
            size="lg"
            isFullWidth
            disabled={!canProceed}
            onPress={() => handleAction("email")}
            style={styles.rowButton}
          />
          <NewButton
            label={t("register_anonymously")}
            type="outline"
            size="lg"
            isFullWidth
            disabled={!canProceed}
            onPress={() => handleAction("anonymously")}
            style={styles.rowButton}
          />
        </View>

        <View style={styles.loginRow}>
          <AppText
            style={[styles.loginText, !canProceed && styles.loginTextDisabled]}
          >
            {t("already_have_account")}{" "}
            <AppText style={styles.loginLink} isBold>
              {t("log_in")}
            </AppText>
          </AppText>
          <TouchableOpacity
            onPress={!canProceed ? undefined : () => handleAction("login")}
            disabled={!canProceed}
            style={StyleSheet.absoluteFill}
            accessibilityRole="button"
          />
        </View>

        <NewButton
          label={t("continue_as_guest")}
          type="text"
          size="sm"
          disabled={!canProceed}
          loading={tmpLoginMutation.isLoading}
          onPress={() => handleAction("guest")}
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
            if (roPasswordError) setRoPasswordError("");
          }}
          style={styles.passwordInput}
        />
      </TransparentModal>
    </Backdrop>
  );
}

const styles = StyleSheet.create({
  dropdown: { marginBottom: 24 },
  dropdownsContainer: {
    flex: 1,
    justifyContent: "flex-end",
    zIndex: 2,
    alignItems: "stretch",
  },
  plDescription: { paddingBottom: 16 },
  buttonsContainer: {
    width: "100%",
    alignItems: "stretch",
    marginTop: "auto",
    gap: 16,
    marginBottom: -32,
  },
  buttonsRow: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  rowButton: { width: "47%" },
  loginRow: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    position: "relative",
    paddingBottom: 16,
  },
  loginText: {
    fontSize: 18,
    textAlign: "center",
    color: "#373737",
  },
  loginTextDisabled: { opacity: 0.45 },
  loginLink: {
    color: "#9749fa",
  },
  passwordInput: { marginTop: 12, marginBottom: 20 },
});

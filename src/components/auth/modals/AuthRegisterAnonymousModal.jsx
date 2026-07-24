import React, { useContext, useEffect, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import * as Clipboard from "expo-clipboard";

import "fast-text-encoding";
import Joi from "joi";

import {
  AppText,
  CheckBox,
  Backdrop,
  Error,
  Icon,
  Input,
  InputPassword,
  Loading,
  NewButton,
  TermsAgreement,
  TransparentModal,
} from "#components";

import { userSvc, localStorage, Context } from "#services";
import { validate, validateProperty, showToast } from "#utils";
import { useGetTheme, useError, useAuthSessionOptions } from "#hooks";
import { appStyles } from "#styles";

import { AuthenticationModalsLogo } from "../AuthenticationModalsLogo";
import { AuthSessionOptionCards } from "../AuthSessionOptionCards";
import { getAuthBackdropProps } from "../authBackdropProps";

export function AuthRegisterAnonymousModal({ onGoBack, onGoToLogin }) {
  const { colors, isDarkMode } = useGetTheme();
  const { t } = useTranslation("blocks", { keyPrefix: "register-anonymous" });

  const { setToken, setInitialRouteName, setIsAnonymousRegister } =
    useContext(Context);

  const {
    shouldSaveCredentials,
    setShouldSaveCredentials,
    keepMeSignedInToggleValue,
    handleKeepMeSignedInToggle,
    isKeepMeSignedInSheetOpen,
    handleKeepMeSignedInSheetCancel,
    handleKeepMeSignedInSheetContinue,
    openKeepMeSignedInSheet,
    saveCredentialsIfEnabled,
    applyKeepMeSignedIn,
  } = useAuthSessionOptions();

  const schema = useMemo(() => {
    return Joi.object({
      password: Joi.string()
        .pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}"))
        .label(t("password_error")),
      confirmPassword: Joi.string()
        .pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}"))
        .label(t("password_match_error")),
      nickname: Joi.string().label(t("nickname_error")),
      isPrivacyAndTermsSelected: Joi.boolean().invalid(false),
      isAgeTermsSelected: Joi.boolean().invalid(false),
    });
  }, [t]);

  const [data, setData] = useState({
    password: "",
    confirmPassword: "",
    nickname: "",
    isPrivacyAndTermsSelected: false,
    isAgeTermsSelected: false,
  });
  const [errors, setErrors] = useState({});

  const [minAge, setMinAge] = useState(10);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [hasCopiedMain, setHasCopiedMain] = useState(false);

  useEffect(() => {
    const getMinAge = async () => {
      const age = (await localStorage.getItem("minAge")) || 10;
      setMinAge(age);
    };
    getMinAge();
  }, []);

  const fetchUserAccessToken = async () => {
    setInitialRouteName("TabNavigation");
    try {
      const res = await userSvc.generateClientAccesToken();
      return res.data.userAccessToken;
    } catch (err) {
      const { message: errorMessage } = useError(err);
      setErrors({ submit: errorMessage });
      return undefined;
    }
  };

  const { data: userAccessToken, isLoading: userAccessTokenIsLoading } =
    useQuery(["access-token"], fetchUserAccessToken, { cacheTime: 0 });

  const register = async () => {
    const countryID = await localStorage.getItem("country_id");
    if (!countryID) {
      onGoBack?.();
      return;
    }
    return await userSvc.signUp({
      userType: "client",
      countryID,
      password: data.password,
      clientData: {
        userAccessToken,
        nickname: data.nickname,
      },
    });
  };

  const registerMutation = useMutation(register, {
    onSuccess: async (response) => {
      const generatedAccessToken = String(userAccessToken).trim();

      setIsAnonymousRegister(true);
      setInitialRouteName("RegisterAboutYou");
      const { token: tokenData } = response.data;
      const { token, expiresIn, refreshToken } = tokenData;

      await Promise.all([
        localStorage.setItem("token", token),
        localStorage.setItem("token-expires-in", expiresIn),
        localStorage.setItem("refresh-token", refreshToken),
        localStorage.setItem("isRegistered", "true"),
      ]);

      setToken(token);

      await saveCredentialsIfEnabled({
        username: generatedAccessToken,
        password: data.password,
      });
      await applyKeepMeSignedIn();
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      setErrors({ submit: errorMessage });
    },
  });

  const handleChange = (field, value) => {
    if (
      field === "confirmPassword" &&
      value.length >= 8 &&
      data.password !== value
    ) {
      setErrors({ confirmPassword: t("password_match_error") });
    }
    if (
      (field === "password" &&
        data.confirmPassword.length >= 8 &&
        value === data.confirmPassword) ||
      (field === "confirmPassword" &&
        value.length >= 8 &&
        data.password === value)
    ) {
      setErrors({ confirmPassword: "" });
    }
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field) => {
    if (
      (field === "password" && data.confirmPassword.length >= 8) ||
      field === "confirmPassword"
    ) {
      if (data.password !== data.confirmPassword) {
        setErrors({ confirmPassword: t("password_match_error") });
        return;
      }
    }
    validateProperty(field, data[field], schema, setErrors);
  };

  const copyToClipboard = async () => {
    if (!userAccessToken) return;
    setHasCopiedMain(true);
    await Clipboard.setStringAsync(userAccessToken);
    showToast({ message: t("copy_success") });
  };

  const canContinue = useMemo(() => {
    return (
      data.password &&
      data.confirmPassword &&
      data.isPrivacyAndTermsSelected &&
      data.isAgeTermsSelected &&
      data.nickname
    );
  }, [data]);

  const handleRegister = async () => {
    if ((await validate(data, schema, setErrors)) === null) {
      registerMutation.mutate();
    } else {
      setIsConfirmationModalOpen(false);
    }
  };

  const handleRegisterButtonClick = () => {
    if (data.password !== data.confirmPassword) {
      setErrors({ confirmPassword: t("password_match_error") });
      return;
    }
    if (hasCopiedMain) {
      handleRegister();
    } else {
      setIsConfirmationModalOpen(true);
    }
  };

  return (
    <>
      <Backdrop
        {...getAuthBackdropProps()}
        topHeaderComponent={<AuthenticationModalsLogo onBackPress={onGoBack} />}
      >
        <View
          style={[
            styles.accessTokenCard,
            {
              backgroundColor: isDarkMode ? colors.card : "#EDF0F9",
              borderColor: isDarkMode
                ? "rgba(137, 157, 209, 0.3)"
                : "transparent",
            },
          ]}
        >
          <View style={styles.accessTokenHeader}>
            <Icon
              style={styles.accessTokenHeaderIcon}
              name="warning"
              color={appStyles.colorRed_eb5757}
            />
            <AppText namedStyle="smallText">{t("paragraph_1")}</AppText>
          </View>

          <View style={styles.accessTokenRow}>
            {userAccessToken ? (
              <>
                <AppText namedStyle="h3" style={styles.accessTokenValue}>
                  {userAccessToken}
                </AppText>
                <TouchableOpacity
                  onPress={copyToClipboard}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel={t("copy_success")}
                  style={{ marginLeft: 16 }}
                >
                  <Icon name="copy" color={colors.primary} />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.accessTokenLoading}>
                <Loading />
              </View>
            )}
          </View>

          <AppText namedStyle="smallText" style={styles.accessTokenHelpText}>
            {t("copy_text")}
          </AppText>
        </View>

        <Input
          label={t("nickname_label")}
          placeholder={t("nickname_placeholder")}
          value={data.nickname}
          onChange={(value) => handleChange("nickname", value)}
          onBlur={() => handleBlur("nickname")}
          errorMessage={errors.nickname}
          style={styles.input}
        />
        <InputPassword
          label={t("password_label")}
          placeholder={t("password_placeholder")}
          value={data.password}
          onChange={(value) => handleChange("password", value)}
          errorMessage={errors.password}
          onBlur={() => handleBlur("password")}
          style={styles.input}
          autoCapitalize="none"
        />
        <InputPassword
          label={t("confirm_password_label")}
          placeholder={t("password_placeholder")}
          value={data.confirmPassword}
          onChange={(value) => handleChange("confirmPassword", value)}
          errorMessage={errors.confirmPassword}
          onBlur={() => handleBlur("confirmPassword")}
          style={styles.input}
          autoCapitalize="none"
        />

        <View style={styles.termsAgreement}>
          <TermsAgreement
            isChecked={data.isPrivacyAndTermsSelected}
            setIsChecked={() =>
              handleChange(
                "isPrivacyAndTermsSelected",
                !data.isPrivacyAndTermsSelected
              )
            }
            textOne={t("terms_agreement_text_1")}
            textTwo={t("terms_agreement_text_2")}
            textThree={t("terms_agreement_text_3")}
            textFour={t("terms_agreement_text_4")}
            style={{ marginBottom: 8 }}
          />
          <TermsAgreement
            isChecked={data.isAgeTermsSelected}
            setIsChecked={() =>
              handleChange("isAgeTermsSelected", !data.isAgeTermsSelected)
            }
            textOne={t("age_terms_agreement_text", { age: minAge })}
          />
        </View>

        <View style={styles.authSessionOptionCardsWrapper}>
          <AuthSessionOptionCards
            shouldSaveCredentials={shouldSaveCredentials}
            onSaveCredentialsToggle={setShouldSaveCredentials}
            keepMeSignedInToggleValue={keepMeSignedInToggleValue}
            onKeepMeSignedInToggle={handleKeepMeSignedInToggle}
            onKeepMeSignedInInfoPress={openKeepMeSignedInSheet}
            isKeepMeSignedInSheetOpen={isKeepMeSignedInSheetOpen}
            onKeepMeSignedInSheetCancel={handleKeepMeSignedInSheetCancel}
            onKeepMeSignedInSheetContinue={handleKeepMeSignedInSheetContinue}
          />
        </View>

        <View style={styles.actions}>
          {errors.submit ? (
            <Error style={styles.inlineError} message={errors.submit} />
          ) : null}
          <NewButton
            size="lg"
            label={t("register_button_label")}
            onPress={handleRegisterButtonClick}
            disabled={
              !canContinue || userAccessTokenIsLoading || !userAccessToken
            }
            loading={registerMutation.isLoading}
            isFullWidth
            type="gradient"
            style={styles.registerButton}
          />
        </View>
        <NewButton
          label={t("login_button_label")}
          onPress={onGoToLogin}
          isFullWidth
          size="lg"
          type="ghost"
          style={styles.loginCta}
        />
      </Backdrop>

      <SaveAccessCodeConfirmation
        isOpen={isConfirmationModalOpen}
        handleClose={() => setIsConfirmationModalOpen(false)}
        userAccessToken={userAccessToken}
        handleRegister={handleRegister}
        isRegisterLoading={registerMutation.isLoading}
        t={t}
      />
    </>
  );
}

function SaveAccessCodeConfirmation({
  isOpen,
  handleClose,
  userAccessToken,
  handleRegister,
  isRegisterLoading,
  t,
}) {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setHasAgreed(false);
      setHasCopied(false);
    }
  }, [isOpen]);

  const handleCopy = async () => {
    if (!userAccessToken) return;
    setHasCopied(true);
    await Clipboard.setStringAsync(userAccessToken);
    showToast({ message: t("copy_success") });
  };

  const handleCheckboxClick = () => {
    setHasAgreed((v) => !v);
  };

  return (
    <TransparentModal
      heading={t("modal_heading")}
      isOpen={isOpen}
      handleClose={handleClose}
    >
      {userAccessToken ? (
        <View style={styles.copyCodeContainer}>
          <AppText namedStyle="h3">{userAccessToken}</AppText>
          <TouchableOpacity onPress={handleCopy}>
            <Icon style={styles.copyIcon} name="copy" />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.warningContainer}>
        <Icon style={styles.warningIcon} name="warning" />
        <AppText namedStyle="text">{t("modal_copy_text")}</AppText>
      </View>

      <View style={styles.checkboxContainer}>
        <CheckBox isChecked={hasAgreed} setIsChecked={handleCheckboxClick} />
        <AppText
          style={{ paddingLeft: 10 }}
          onPress={handleCheckboxClick}
          namedStyle="text"
        >
          {t("warning")}
        </AppText>
      </View>

      <NewButton
        label={t("modal_button_label")}
        size="lg"
        style={{ marginTop: 24 }}
        onPress={handleRegister}
        disabled={!hasAgreed || !hasCopied}
        loading={isRegisterLoading}
      />
    </TransparentModal>
  );
}

const styles = StyleSheet.create({
  authSessionOptionCardsWrapper: {
    marginTop: 16,
  },
  accessTokenCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
  },
  accessTokenHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  accessTokenHeaderIcon: {
    marginRight: 8,
  },
  accessTokenRow: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  accessTokenValue: {
    textAlign: "center",
  },
  accessTokenLoading: {
    paddingVertical: 20,
  },
  accessTokenHelpText: {
    marginTop: 8,
  },
  copyCodeContainer: {
    flexDirection: "row",
    alignSelf: "center",
    paddingTop: 14,
  },
  copyIcon: {
    marginLeft: 10,
  },
  warningContainer: {
    flexDirection: "row",
    paddingTop: 24,
    alignItems: "center",
    paddingRight: 24,
  },
  warningIcon: {
    marginRight: 12,
  },
  input: {
    marginTop: 24,
    alignSelf: "center",
  },
  termsAgreement: { width: "95%", alignSelf: "center", paddingTop: 16 },
  actions: {
    width: "95%",
    alignSelf: "center",
    marginTop: 12,
  },
  inlineError: {
    marginBottom: 6,
    marginLeft: "auto",
    marginRight: "auto",
  },
  registerButton: {
    marginTop: 8,
  },
  loginCta: {
    marginTop: 16,
  },
  checkboxContainer: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 18,
  },
});

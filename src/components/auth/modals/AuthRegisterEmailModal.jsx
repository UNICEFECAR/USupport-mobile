import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Keychain from "react-native-keychain";

import "fast-text-encoding";
import Joi from "joi";

import { CodeVerification } from "#backdrops";
import {
  Backdrop,
  Error,
  Input,
  InputPassword,
  NewButton,
  TermsAgreement,
} from "#components";
import { validate, validateProperty } from "#utils";
import { Context, localStorage, userSvc } from "#services";
import { useError } from "#hooks";

import { AuthenticationModalsLogo } from "../AuthenticationModalsLogo";
import { getAuthBackdropProps } from "../authBackdropProps";

export function AuthRegisterEmailModal({ onGoBack, onGoToLogin }) {
  const { setInitialRouteName, setToken } = useContext(Context);
  const { t } = useTranslation("blocks", { keyPrefix: "register-email" });
  const queryClient = useQueryClient();

  const saveEmailCredentialsBestEffort = async ({ email, password }) => {
    try {
      await Keychain.setInternetCredentials(
        "https://usupport.online",
        email,
        password,
        {
          accessControl:
            Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
          authenticationPrompt: {
            title: "Authenticate to save your credentials",
            subtitle: "Save your credentials in keychain for quick login",
            cancel: "Cancel",
          },
        }
      );
    } catch (e) {
      // User cancellation / OS policy should not break registration.
    }
  };

  const schema = useMemo(() => {
    return Joi.object({
      password: Joi.string()
        .pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}"))
        .label(t("password_error")),
      confirmPassword: Joi.string()
        .pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}"))
        .label(t("password_match_error")),
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .label(t("email_error")),
      nickname: Joi.string().label(t("nickname_error")),
      isPrivacyAndTermsSelected: Joi.boolean(),
      isAgeTermsSelected: Joi.boolean(),
    });
  }, [t]);

  const [data, setData] = useState({
    email: "",
    nickname: "",
    password: "",
    isPrivacyAndTermsSelected: false,
    isAgeTermsSelected: false,
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isCodeVerificationOpen, setIsCodeVerificationOpen] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [canRequestNewOTP, setCanRequestNewOTP] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [shouldShowCodeVerification, setShouldShowCodeVerification] =
    useState(false);
  const [minAge, setMinAge] = useState(10);

  useEffect(() => {
    const getMinAge = async () => {
      const age = (await localStorage.getItem("minAge")) || 10;
      setMinAge(age);
    };
    getMinAge();
  }, []);

  const intervalId = useRef();

  const disableOtpRequestFor60Seconds = useCallback(() => {
    setShowTimer(true);
    if (intervalId.current) {
      clearInterval(intervalId.current);
    }
    const interval = setInterval(() => {
      setSeconds((sec) => {
        if (sec - 1 === 0) {
          clearInterval(interval);
          setShowTimer(false);
          setSeconds(60);
          setCanRequestNewOTP(true);
        }
        return sec - 1;
      });
    }, 1000);
    intervalId.current = interval;
  }, []);

  useEffect(() => {
    setShouldShowCodeVerification(false);
  }, [data]);

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

  const requestEmailOtp = useCallback(async () => {
    const countryID = await localStorage.getItem("country_id");
    if (!countryID) {
      onGoBack?.();
      return;
    }

    if (seconds === 60 || !shouldShowCodeVerification) {
      setShouldShowCodeVerification(true);
      return await userSvc.requestEmailOTP(data.email.toLowerCase());
    }

    setIsCodeVerificationOpen(true);
    return false;
  }, [data.email, onGoBack, seconds, shouldShowCodeVerification]);

  const requestEmailOTPMutation = useMutation(requestEmailOtp, {
    onSuccess: (res) => {
      if (res) {
        setSeconds(60);
        setCanRequestNewOTP(false);
        disableOtpRequestFor60Seconds();
        setIsCodeVerificationOpen(true);
        setErrors({ submit: null });
      }
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      setErrors({ submit: errorMessage });
    },
  });

  const register = async (code) => {
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
        email: data.email.toLowerCase().trim(),
        nickname: data.nickname,
        code,
      },
    });
  };

  const registerMutation = useMutation(register, {
    onSuccess: async (response) => {
      setInitialRouteName("RegisterAboutYou");
      const { user: userData, token: tokenData } = response.data;
      const { token, expiresIn, refreshToken } = tokenData;

      await localStorage.setItem("token-expires-in", expiresIn);
      await localStorage.setItem("refresh-token", refreshToken);
      await localStorage.setItem("token", token);
      await localStorage.setItem("isRegistered", "true");

      queryClient.setQueryData(
        ["client-data"],
        userSvc.transformUserData(userData)
      );
      setToken(token);

      // Save credentials in secure storage best-effort.
      // Cancelling biometric/auth prompt must NOT break registration.
      await saveEmailCredentialsBestEffort({
        email: data.email,
        password: data.password,
      });
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      setErrors({ submit: errorMessage });
    },
  });

  const handleRegister = async (code) => {
    if ((await validate(data, schema, setErrors)) === null) {
      registerMutation.mutate(code);
    }
  };

  const handleOtpRequest = async () => {
    if (data.password !== data.confirmPassword) {
      setErrors({ confirmPassword: t("password_match_error") });
      return;
    }
    if ((await validate(data, schema, setErrors)) === null) {
      requestEmailOTPMutation.mutate();
    }
  };

  const canContinue = useMemo(() => {
    return (
      data.password &&
      data.confirmPassword &&
      data.isPrivacyAndTermsSelected &&
      data.isAgeTermsSelected &&
      data.email &&
      data.nickname
    );
  }, [data]);

  return (
    <>
      {!isCodeVerificationOpen ? (
        <Backdrop
          {...getAuthBackdropProps()}
          topHeaderComponent={
            <AuthenticationModalsLogo onBackPress={onGoBack} />
          }
        >
          <View style={styles.content}>
            <Input
              label={t("email_label")}
              style={styles.input}
              placeholder="user@mail.com"
              value={data.email}
              onChange={(value) => handleChange("email", value)}
              onBlur={() => handleBlur("email")}
              errorMessage={errors.email}
              autoCapitalize="none"
            />
            <Input
              label={t("nickname_label")}
              style={styles.input}
              placeholder={t("nickname_placeholder")}
              value={data.nickname}
              onChange={(value) => handleChange("nickname", value)}
              onBlur={() => handleBlur("nickname")}
              errorMessage={errors.nickname}
            />
            <InputPassword
              style={styles.input}
              label={t("password_label")}
              value={data.password}
              placeholder={t("password_placeholder")}
              onChange={(value) => handleChange("password", value)}
              onBlur={() => handleBlur("password")}
              errorMessage={errors.password}
              autoCapitalize="none"
            />
            <InputPassword
              style={styles.input}
              label={t("confirm_password_label")}
              value={data.confirmPassword}
              placeholder={t("password_placeholder")}
              onChange={(value) => handleChange("confirmPassword", value)}
              onBlur={() => handleBlur("confirmPassword")}
              errorMessage={errors.confirmPassword}
              autoCapitalize="none"
            />
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
              style={{ marginBottom: 12 }}
            />
            <TermsAgreement
              isChecked={data.isAgeTermsSelected}
              setIsChecked={() =>
                handleChange("isAgeTermsSelected", !data.isAgeTermsSelected)
              }
              textOne={t("age_terms_agreement_text", { age: minAge })}
            />
            <View style={styles.actions}>
              {errors.submit ? (
                <Error style={styles.inlineError} message={errors.submit} />
              ) : null}
              <NewButton
                size="lg"
                label={t("register_button")}
                onPress={handleOtpRequest}
                disabled={!canContinue}
                loading={requestEmailOTPMutation.isLoading}
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
          </View>
        </Backdrop>
      ) : (
        <CodeVerification
          inAuthFlow
          isOpen={isCodeVerificationOpen}
          handleGoBack={() => setIsCodeVerificationOpen(false)}
          requestOTP={requestEmailOTPMutation.mutate}
          canRequestOTP={canRequestNewOTP}
          resendTimer={seconds}
          showTimer={showTimer}
          handleRegister={handleRegister}
          submitError={errors.submit}
          isMutating={registerMutation.isLoading}
          email={data.email}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: Platform.OS === "ios" ? 4 : 0,
  },
  input: {
    marginBottom: 22,
    alignSelf: "center",
  },
  inlineError: {
    marginBottom: 6,
    marginLeft: "auto",
    marginRight: "auto",
  },
  actions: {
    marginTop: 12,
  },
  registerButton: {
    marginTop: 8,
  },
  loginCta: {
    marginTop: 16,
  },
});

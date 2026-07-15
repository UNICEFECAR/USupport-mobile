import React, { useContext, useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Keychain from "react-native-keychain";
import * as LocalAuthentication from "expo-local-authentication";

import {
  Backdrop,
  AppText,
  Input,
  InputPassword,
  Icon,
} from "#components";
import { Context, localStorage, userSvc } from "#services";
import {
  getCountryFromTimezone,
  resolveKeepMeSignedInOnLogin,
  hasSavedCredentialsForCurrentCountry,
  getSavedCredentialsForCurrentCountry,
  saveCredentialsForCurrentCountry,
  syncDeviceUnlockFromStorage,
} from "#utils";
import { useError } from "#hooks";

import { AuthenticationModalsLogo } from "../AuthenticationModalsLogo";
import { getAuthBackdropProps } from "../authBackdropProps";
import { KeepMeSignedInSheet } from "../KeepMeSignedInSheet";
import { LoginOptionCard } from "../LoginOptionCard";

export function AuthLoginModal({
  onGoBack,
  onGoToRegister,
  onGoToForgotPassword,
}) {
  const { t } = useTranslation("blocks", { keyPrefix: "login" });
  const queryClient = useQueryClient();
  const {
    setToken,
    setInitialRouteName,
    isLoginDisabled,
    setIsLoginDisabled,
    setRequireBiometricsSetup,
    setUserPin,
    setHasAuthenticatedWithPin,
  } = useContext(Context);

  const [data, setData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [autoSubmit, setAutoSubmit] = useState(false);

  const [biometryType, setBiometryType] = useState(null);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [shouldSaveCredentials, setShouldSaveCredentials] = useState(false);
  const [keepMeSignedIn, setKeepMeSignedIn] = useState(false);
  const [isKeepMeSignedInSheetOpen, setIsKeepMeSignedInSheetOpen] =
    useState(false);
  const [isKeepMeSignedInPending, setIsKeepMeSignedInPending] = useState(false);
  const savedCredentials = useRef({});

  const handleKeepMeSignedInToggle = (nextValue) => {
    if (nextValue) {
      setIsKeepMeSignedInPending(true);
      setIsKeepMeSignedInSheetOpen(true);
      return;
    }
    setKeepMeSignedIn(false);
  };

  const handleKeepMeSignedInSheetCancel = () => {
    setIsKeepMeSignedInSheetOpen(false);
    setIsKeepMeSignedInPending(false);
  };

  const handleKeepMeSignedInSheetContinue = () => {
    setIsKeepMeSignedInSheetOpen(false);
    setIsKeepMeSignedInPending(false);
    setKeepMeSignedIn(true);
  };

  useEffect(() => {
    const checkKeystore = async () => {
      try {
        const isHardwareAvailable =
          await LocalAuthentication.hasHardwareAsync();
        const supportedBiometryType = await Keychain.getSupportedBiometryType();
        setBiometryType(supportedBiometryType || isHardwareAvailable);
        const hasSaved = await hasSavedCredentialsForCurrentCountry();
        if (hasSaved) setHasCredentials(true);
      } catch (err) {
        console.log(err);
      }
    };

    checkKeystore();
  }, []);

  const login = async () => {
    const usersCountry = getCountryFromTimezone();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const field = data.email.includes("@") ? "email" : "userAccessToken";
    const payload = {
      [field]: data.email,
      password: data.password,
      userType: "client",
      location: timezone + ", " + usersCountry,
    };
    return await userSvc.login(payload);
  };

  const loginMutation = useMutation(login, {
    onSuccess: async (response) => {
      if (
        shouldSaveCredentials &&
        (!hasCredentials ||
          savedCredentials.current?.username !== data.email ||
          savedCredentials.current?.password !== data.password)
      ) {
        let iosSuccess = false;

        if (Platform.OS === "ios") {
          await LocalAuthentication.authenticateAsync({
            promptMessage: t("prompt_2_title"),
          }).then((res) => {
            iosSuccess = res.success;
          });
        }

        if (Platform.OS === "android" || iosSuccess) {
          await saveCredentialsForCurrentCountry({
            username: data.email,
            password: data.password,
            authenticationPrompt: {
              title: t("prompt_2_title"),
              cancel: t("cancel"),
            },
          });
        }
      }

      const { user: userData, token: tokenData } = response.data;
      const { token, expiresIn, refreshToken } = tokenData;

      localStorage.setItem("token", token);
      localStorage.setItem("token-expires-in", expiresIn);
      localStorage.setItem("refresh-token", refreshToken);

      queryClient.setQueryData(
        ["client-data"],
        userSvc.transformUserData(userData)
      );

      const { initialRouteName, requireBiometricsSetup } =
        await resolveKeepMeSignedInOnLogin(keepMeSignedIn);
      setInitialRouteName(initialRouteName);
      setRequireBiometricsSetup(requireBiometricsSetup);
      await syncDeviceUnlockFromStorage({
        setUserPin,
        setHasAuthenticatedWithPin,
      });

      setErrors({});
      setToken(token);
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      const errorCode = error?.response?.status;

      if (errorCode === 429 && !isLoginDisabled) {
        const remainingCooldownInSeconds =
          error?.response?.data?.error?.customData
            ?.remainingCooldownInSeconds || 0;
        setIsLoginDisabled(true);
        setTimeout(() => {
          setIsLoginDisabled(false);
        }, remainingCooldownInSeconds * 1000);
      }

      setErrors({ submit: errorMessage });
    },
  });

  useEffect(() => {
    if (autoSubmit && data.email && data.password) {
      setAutoSubmit(false);
      loginMutation.mutate();
    }
  }, [autoSubmit, data]);

  const isSubmitDisabled = !data.email || !data.password || isLoginDisabled;

  const handleLogin = () => {
    if (isSubmitDisabled) return;
    loginMutation.mutate();
  };

  const getCredentials = async () => {
    const credentials = await getSavedCredentialsForCurrentCountry({
      title: t("prompt_title"),
      cancel: t("cancel"),
    });

    if (credentials) {
      const { username, password } = credentials;
      savedCredentials.current = { username, password };
      setData({ email: username, password });
      setAutoSubmit(true);
    }
  };

  return (
    <>
      <Backdrop
        {...getAuthBackdropProps()}
        topHeaderComponent={<AuthenticationModalsLogo onBackPress={onGoBack} />}
        ctaLabel={t("login_label")}
        ctaHandleClick={handleLogin}
        isCtaDisabled={isSubmitDisabled}
        isCtaLoading={loginMutation.isLoading}
        secondaryCtaLabel={t("register_button_label")}
        secondaryCtaHandleClick={onGoToRegister}
        secondaryCtaType="ghost"
        errorMessage={errors.submit}
        hasKeyboardListener={true}
      >
        {hasCredentials && !!biometryType ? (
          <View style={styles.biometryContainer}>
            <TouchableOpacity onPress={getCredentials}>
              <Icon
                color="#20809e"
                style={{ alignSelf: "center" }}
                name="face-id"
                size="lg"
              />
            </TouchableOpacity>
          </View>
        ) : null}

        <Input
          label={t("email_label")}
          onChange={(value) => setData((prev) => ({ ...prev, email: value }))}
          placeholder={t("email_placeholder")}
          value={data.email}
          autoCapitalize="none"
          style={styles.input}
        />

        <InputPassword
          label={t("password_label")}
          onChange={(value) =>
            setData((prev) => ({ ...prev, password: value }))
          }
          placeholder={t("password_placeholder")}
          value={data.password}
          style={styles.inputPassword}
          autoCapitalize="none"
        />

        <LoginOptionCard
          iconName="fingerprint"
          title={t("save_credentials")}
          description={t("save_credentials_description")}
          isToggled={shouldSaveCredentials}
          onToggle={setShouldSaveCredentials}
        />

        <LoginOptionCard
          iconName="circle-actions-success"
          title={t("keep_me_signed_in")}
          description={t("keep_me_signed_in_description")}
          isToggled={keepMeSignedIn || isKeepMeSignedInPending}
          onToggle={handleKeepMeSignedInToggle}
          showInfoIcon
          onInfoPress={() => setIsKeepMeSignedInSheetOpen(true)}
        />

        <AppText
          onPress={onGoToForgotPassword}
          namedStyle="text"
          isSemibold
          style={styles.forgotPassword}
        >
          {t("forgot_password_label")}
        </AppText>
      </Backdrop>

      <KeepMeSignedInSheet
        isOpen={isKeepMeSignedInSheetOpen}
        onCancel={handleKeepMeSignedInSheetCancel}
        onContinue={handleKeepMeSignedInSheetContinue}
      />
    </>
  );
}

const styles = StyleSheet.create({
  biometryContainer: {
    width: "100%",
    height: 30,
    marginTop: 20,
    marginBottom: 20,
  },
  input: { alignSelf: "center" },
  inputPassword: {
    alignSelf: "center",
    marginTop: 22,
    marginBottom: 12,
  },
  forgotPassword: {
    color: "#9749FA",
    alignSelf: "flex-start",
    marginLeft: 0,
    paddingLeft: 0,
    paddingTop: 0,
    marginTop: 0,
    fontSize: 12,
    lineHeight: 22,
  },
});

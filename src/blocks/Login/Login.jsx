import React, { useState, useContext, useEffect, useRef } from "react";
import {
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  View,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckBox, AppText } from "#components";

import * as Keychain from "react-native-keychain";
import * as LocalAuthentication from "expo-local-authentication";

import {
  Block,
  Heading,
  Input,
  InputPassword,
  Error,
  AppButton,
  Icon,
} from "#components";

import { getCountryFromTimezone } from "#utils";
import { userSvc, localStorage, Context } from "#services";
import { useError } from "#hooks";

/**
 * Login
 *
 * Login block
 *
 * @return {jsx}
 */
export const Login = ({ navigation }) => {
  const { t } = useTranslation("login");
  const queryClient = useQueryClient();

  const { setToken, setInitialRouteName, isLoginDisabled, setIsLoginDisabled } =
    useContext(Context);

  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const [biometryType, setBiometryType] = useState(null);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [shouldSaveCredentials, setShouldSaveCredentials] = useState(false);

  const savedCredentials = useRef({});

  useEffect(() => {
    const checkKeystore = async () => {
      try {
        const isHardwareAvailable =
          await LocalAuthentication.hasHardwareAsync();
        const biometryType = await Keychain.getSupportedBiometryType();
        setBiometryType(biometryType || isHardwareAvailable);
        const hasCredentials = await Keychain.hasInternetCredentials({
          server: "https://usupport.online",
        });
        if (hasCredentials) {
          setHasCredentials(true);
        }
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

        // For some reason Keychain.setInternetCredentials doesn't trigger the biometric prompt
        // on iOS, so we need to do it manually
        if (Platform.OS === "ios") {
          await LocalAuthentication.authenticateAsync({
            promptMessage: t("prompt_2_title"),
          }).then((res) => {
            iosSuccess = res.success;
          });
        }
        if (Platform.OS === "android" || iosSuccess) {
          await Keychain.setInternetCredentials(
            "https://usupport.online",
            data.email,
            data.password,
            {
              accessControl:
                Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
              authenticationPrompt: {
                title: t("prompt_2_title"),
                cancel: t("cancel"),
              },
            }
          ).then((res) => console.log("Result: ", res));
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
      setInitialRouteName("TabNavigation");
      setErrors({});
      setToken(token);
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      const errorCode = error.response.status;
      if (errorCode === 429 && !isLoginDisabled) {
        // If the user is rate limited, disable the login button for the remaining cooldown time
        const remainingCooldownInSeconds =
          error.response.data?.error?.customData?.remainingCooldownInSeconds ||
          0;
        setIsLoginDisabled(true);
        setTimeout(() => {
          setIsLoginDisabled(false);
        }, remainingCooldownInSeconds * 1000);
      }
      setErrors({ submit: errorMessage });
    },
  });

  const getCredentials = async () => {
    // const enrolled = await LocalAuthentication.isEnrolledAsync();
    const credentials = await Keychain.getInternetCredentials(
      "https://usupport.online",
      {
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        authenticationPrompt: {
          title: t("prompt_title"),
          cancel: t("cancel"),
        },
      }
    );
    if (credentials) {
      const { username, password } = credentials;
      savedCredentials.current = { username, password };
      setData({ email: username, password });
      handleLogin();
    }
  };

  const handleChange = (field, value) => {
    const newData = { ...data };

    newData[field] = value;

    setData(newData);
  };

  const handleLogin = () => {
    loginMutation.mutate();
  };

  const handleForgotPassowrd = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleRegisterRedirect = () => {
    navigation.navigate("RegisterPreview");
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("RegisterPreview");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : null}
    >
      <Heading heading={t("heading")} handleGoBack={handleGoBack} />
      <Block style={[styles.flexGrow, { marginTop: 84 }]}>
        <ScrollView
          contentContainerStyle={styles.flexGrow}
          keyboardShouldPersistTaps="handled"
        >
          {hasCredentials && !!biometryType ? (
            <View style={{ width: "100%", height: 20, marginBottom: 30 }}>
              <TouchableOpacity onPress={getCredentials}>
                <Icon
                  color="#20809e"
                  style={{ alignSelf: "center" }}
                  name="face-id"
                />
              </TouchableOpacity>
            </View>
          ) : null}
          <Input
            label={t("email_label")}
            onChange={(value) => handleChange("email", value)}
            placeholder={t("email_placeholder")}
            value={data.email}
            autoCapitalize="none"
            style={styles.input}
          />
          <InputPassword
            label={t("password_label")}
            onChange={(value) => handleChange("password", value)}
            placeholder={t("password_placeholder")}
            value={data.password}
            style={styles.inputPassword}
            autoCapitalize="none"
          />
          <View style={styles.checkboxContainer}>
            <CheckBox
              isChecked={shouldSaveCredentials}
              setIsChecked={() =>
                setShouldSaveCredentials(!shouldSaveCredentials)
              }
            />
            <AppText
              onPress={() => setShouldSaveCredentials(!shouldSaveCredentials)}
              namedStyle="text"
            >
              {t("save_credentials")}
            </AppText>
          </View>
          <AppButton
            type="ghost"
            color="purple"
            label={t("forgot_password_label")}
            onPress={() => handleForgotPassowrd()}
          />
          {errors.submit ? <Error message={errors.submit} /> : null}
          <AppButton
            label={t("login_label")}
            size="lg"
            onPress={handleLogin}
            disabled={!data.email || !data.password || isLoginDisabled}
            loading={loginMutation.isLoading}
            isSubmit
            style={styles.loginButton}
          />
          <AppButton
            type="ghost"
            label={t("register_button_label")}
            onPress={() => handleRegisterRedirect()}
          />
        </ScrollView>
      </Block>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: { flex: 1 },
  input: {
    alignSelf: "center",
  },
  inputPassword: {
    alignSelf: "center",
    marginTop: 22,
    marginBottom: 12,
  },
  loginButton: {
    marginTop: 38,
  },
  flexGrow: {
    flexGrow: 1,
  },
  checkboxContainer: {
    display: "flex",
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 18,
    marginBottom: 10,
    marginTop: 4,
  },
});

import React, {
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CodeVerification } from "#backdrops";

import "fast-text-encoding";
import Joi from "joi";

import {
  Block,
  Heading,
  Input,
  InputPassword,
  TermsAgreement,
  AppButton,
  Error,
} from "#components";

import { validateProperty, validate } from "#utils";
import { userSvc, localStorage, Context } from "#services";
import { useError } from "#hooks";

export const RegisterEmail = ({ navigation }) => {
  const { setInitialRouteName, setToken } = useContext(Context);
  const { t } = useTranslation("register-email");
  const navigate = () => {};
  const queryClient = useQueryClient();

  const schema = Joi.object({
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
  });

  const [data, setData] = useState({
    email: "",
    nickname: "",
    password: "",
    isPrivacyAndTermsSelected: false,
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isCodeVerificationOpen, setIsCodeVerificationOpen] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [canRequestNewOTP, setCanRequestNewOTP] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [shouldShowCodeVerification, setShouldShowCodeVerification] =
    useState(false);
  const intervalId = useRef();

  const requestEmailOtp = useCallback(async () => {
    const countryID = localStorage.getItem("country_id");
    if (!countryID) {
      navigate("/");
      return;
    }
    if (seconds === 60 || !shouldShowCodeVerification) {
      setShouldShowCodeVerification(true);
      return await userSvc.requestEmailOTP(data.email.toLowerCase());
    } else {
      setIsCodeVerificationOpen(true);
      return false;
    }
  });

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

  const disableOtpRequestFor60Seconds = () => {
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
  };

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
      field === "confirmPassword" &&
      value.length >= 8 &&
      data.password === value
    ) {
      setErrors({ confirmPassword: "" });
    }
    let newData = { ...data };
    newData[field] = value;
    setData(newData);
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

  const register = async (code) => {
    const countryID = await localStorage.getItem("country_id");
    if (!countryID) {
      navigation.navigate("Welcome");
      return;
    }
    // Send data to server
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
    // If the mutation succeeds, get the data returned
    // from the server, and put it in the cache
    onSuccess: async (response) => {
      setInitialRouteName("RegisterAboutYou");
      const { user: userData, token: tokenData } = response.data;
      const { token, expiresIn, refreshToken } = tokenData;

      await localStorage.setItem("token-expires-in", expiresIn);
      await localStorage.setItem("refresh-token", refreshToken);
      await localStorage.setItem("token", token);

      queryClient.setQueryData(
        ["client-data"],
        userSvc.transformUserData(userData)
      );
      setToken(token);
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

  const handleLoginRedirect = () => {
    navigation.navigate("Login");
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

  return (
    <>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : null}
      >
        <Block style={styles.flexGrow}>
          <Heading
            heading={t("heading")}
            handleGoBack={() => navigation.goBack()}
          />
          <ScrollView
            contentContainerStyle={[styles.flexGrow, { marginTop: 64 }]}
            keyboardShouldPersistTaps="handled"
          >
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
              navigation={navigation}
              textOne={t("terms_agreement_text_1")}
              textTwo={t("terms_agreement_text_2")}
              textThree={t("terms_agreement_text_3")}
              textFour={t("terms_agreement_text_4")}
            />
            <Error message={errors.submit || ""} />
            <AppButton
              size="lg"
              label={t("register_button")}
              onPress={handleOtpRequest}
              type="primary"
              color="green"
              disabled={!data.isPrivacyAndTermsSelected}
              loading={requestEmailOTPMutation.isLoading}
              style={styles.registerButton}
            />
            <AppButton
              label={t("login_button_label")}
              type="ghost"
              onPress={handleLoginRedirect}
            />
          </ScrollView>
        </Block>
      </KeyboardAvoidingView>
      <CodeVerification
        isOpen={isCodeVerificationOpen}
        onClose={() => setIsCodeVerificationOpen(false)}
        requestOTP={requestEmailOTPMutation.mutate}
        canRequestOTP={canRequestNewOTP}
        resendTimer={seconds}
        showTimer={showTimer}
        handleRegister={handleRegister}
        submitError={errors.submit}
        isMutating={registerMutation.isLoading}
      />
    </>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: { flex: 1, paddingTop: 30 },
  input: {
    marginBottom: 22,
    alignSelf: "center",
  },
  registerButton: {
    marginTop: 32,
    marginBottom: 24,
  },
  flexGrow: {
    flexGrow: 1,
  },
});

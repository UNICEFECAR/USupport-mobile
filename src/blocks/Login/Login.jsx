import React, { useState, useContext } from "react";
import { StyleSheet, KeyboardAvoidingView, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Block, Heading, Input, InputPassword, AppButton } from "#components";

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

  const { setToken } = useContext(Context);
  // const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    onSuccess: (response) => {
      const { user: userData, token: tokenData } = response.data;
      const { token, expiresIn, refreshToken } = tokenData;

      localStorage.setItem("token", token);
      localStorage.setItem("token-expires-in", expiresIn);
      localStorage.setItem("refresh-token", refreshToken);

      queryClient.setQueryData(
        ["client-data"],
        userSvc.transformUserData(userData)
      );

      setErrors({});
      setToken(token);
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      setErrors({ submit: errorMessage });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleChange = (field, value) => {
    const newData = { ...data };

    newData[field] = value;

    setData(newData);
  };

  const handleLogin = (e) => {
    setIsSubmitting(true);
    loginMutation.mutate();
  };

  const handleForgotPassowrd = () => {
    navigate("/forgot-password");
  };

  const handleRegisterRedirect = () => {
    navigate("/register-preview");
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : null}
    >
      <Block style={styles.flexGrow}>
        <ScrollView contentContainerStyle={styles.flexGrow}>
          <Heading heading={t("heading")} />
          <Input
            label={t("email_label")}
            onChange={(value) => handleChange("email", value)}
            placeholder={t("email_placeholder")}
            value={data.email}
          />
          <InputPassword
            label={t("password_label")}
            onChange={(value) => handleChange("password", value)}
            placeholder={t("password_placeholder")}
            value={data.password}
            style={styles.inputPassword}
          />
          <AppButton
            type="ghost"
            color="purple"
            label={t("forgot_password_label")}
            onClick={() => handleForgotPassowrd()}
          />
          {errors.submit ? <Error message={errors.submit} /> : null}
          <AppButton
            label={t("login_label")}
            size="lg"
            onPress={handleLogin}
            disabled={!data.email || !data.password || isSubmitting}
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
  keyboardAvoidingView: { flex: 1, paddingTop: 30 },
  inputPassword: {
    marginTop: 22,
    marginBottom: 12,
  },
  loginButton: {
    marginTop: 38,
  },
  flexGrow: {
    flexGrow: 1,
  },
});

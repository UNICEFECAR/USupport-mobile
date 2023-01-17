import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
import { userSvc, localStorage } from "#services";
import { useError } from "#hooks";

export const RegisterEmail = ({ navigation }) => {
  const { t } = useTranslation("register-email");
  const navigate = () => {};
  const queryClient = useQueryClient();

  const schema = Joi.object({
    password: Joi.string()
      .pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}"))
      .label(t("password_error")),
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
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    let newData = { ...data };
    newData[field] = value;
    setData(newData);
  };

  const handleBlur = (field) => {
    validateProperty(field, data[field], schema, setErrors);
  };

  const register = async () => {
    const countryID = await localStorage.getItem("country_id");
    if (!countryID) {
      navigate("/");
      return;
    }
    // Send data to server
    return await userSvc.signUp({
      userType: "client",
      countryID,
      password: data.password,
      clientData: {
        email: data.email.toLowerCase(),
        nickname: data.nickname,
      },
    });
  };

  const registerMutation = useMutation(register, {
    // If the mutation succeeds, get the data returned
    // from the server, and put it in the cache
    onSuccess: (response) => {
      console.log(response, "response");
      const { user: userData, token: tokenData } = response.data;
      const { token, expiresIn, refreshToken } = tokenData;

      localStorage.setItem("token", token);
      localStorage.setItem("token-expires-in", expiresIn);
      localStorage.setItem("refresh-token", refreshToken);

      queryClient.setQueryData(
        ["client-data"],
        userSvc.transformUserData(userData)
      );

      navigation.navigate("RegisterAboutYou");
    },
    onError: (error) => {
      setIsSubmitting(false);
      const { message: errorMessage } = useError(error);
      setErrors({ submit: errorMessage });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleRegister = async () => {
    setIsSubmitting(true);
    if ((await validate(data, schema, setErrors)) === null) {
      registerMutation.mutate();
    } else {
      setIsSubmitting(false);
    }
  };

  const handleLoginRedirect = () => {
    navigation.navigate("Login");
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
            style={styles.input}
            placeholder="user@mail.com"
            value={data.email}
            onChange={(value) => handleChange("email", value)}
            onBlur={() => handleBlur("email")}
            errorMessage={errors.email}
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
          />
          <Error message={errors.submit || ""} />
          <AppButton
            size="lg"
            label={t("register_button")}
            onPress={handleRegister}
            type="primary"
            color="green"
            disabled={!data.isPrivacyAndTermsSelected || isSubmitting}
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
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: { flex: 1, paddingTop: 30 },
  input: {
    marginBottom: 22,
  },
  registerButton: {
    marginTop: 32,
    marginBottom: 24,
  },
  flexGrow: {
    flexGrow: 1,
  },
});

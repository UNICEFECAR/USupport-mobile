import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import * as Clipboard from "expo-clipboard";

import "fast-text-encoding";
import Joi from "joi";

import { showToast } from "#utils";

import {
  AppButton,
  AppText,
  Block,
  Heading,
  Icon,
  Input,
  InputPassword,
  Loading,
  Screen,
  TermsAgreement,
  TransparentModal,
} from "#components";

import { userSvc, localStorage, Context } from "#services";
import { validate, validateProperty } from "#utils";
import { useError } from "#hooks";
import { appStyles } from "#styles";

export const RegisterAnonymous = ({ navigation }) => {
  const { t } = useTranslation("register-anonymous");
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const { setToken, setInitialRouteName } = useContext(Context);
  const schema = Joi.object({
    password: Joi.string()
      .pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}"))
      .label(t("password_error")),
    nickname: Joi.string().label(t("nickname_error")),
    isPrivacyAndTermsSelected: Joi.boolean().invalid(false),
  });

  const [data, setData] = useState({
    password: "",
    nickname: "",
    isPrivacyAndTermsSelected: false,
  });
  const [errors, setErrors] = useState({});

  // On page load send a request to the server
  // to generate a user acces token
  const fetchUserAccessToken = async () => {
    setInitialRouteName("TabNavigation");
    try {
      const res = await userSvc.generateClientAccesToken();
      return res.data.userAccessToken;
    } catch (err) {
      const { message: errorMessage } = useError(err);
      setErrors({ submit: errorMessage });
    }
  };

  const { data: userAccessToken, isLoading: userAccessTokenIsLoading } =
    useQuery(["access-token"], fetchUserAccessToken, {
      cacheTime: 0,
      // onSucces: (data) => console.log(data, "data"),
    });

  const register = async () => {
    const countryID = await localStorage.getItem("country_id");
    if (!countryID) {
      navigate("/");
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
      const { token: tokenData } = response.data;
      const { token, expiresIn, refreshToken } = tokenData;

      const tokenPromise = localStorage.setItem("token", token);
      const tokenExpiresInPromise = localStorage.setItem(
        "token-expires-in",
        expiresIn
      );
      const refreshTokenPromise = localStorage.setItem(
        "refresh-token",
        refreshToken
      );

      await Promise.all([
        tokenPromise,
        tokenExpiresInPromise,
        refreshTokenPromise,
      ]);
      setToken(token);
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      setErrors({ submit: errorMessage });
    },
  });
  const handleRegister = async () => {
    if (!isSubmitting) {
      if ((await validate(data, schema, setErrors)) === null) {
        registerMutation.mutate(data);
      }
    }
  };

  const handleChange = (field, value) => {
    let newData = { ...data };
    newData[field] = value;
    setData(newData);
    validateProperty("password", data.password, schema, setErrors);
  };

  const handleBlur = (field, value) => {
    validateProperty(field, value, schema, setErrors);
  };

  const handleLoginRedirect = () => {
    navigation.navigate("Login");
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(userAccessToken);
    showToast({ message: t("copy_success") });
  };

  const canContinue =
    data.password && data.isPrivacyAndTermsSelected && data.nickname;

  return (
    <Screen hasEmergencyButton={false}>
      <TransparentModal
        heading={t("modal_heading")}
        isOpen={isConfirmationModalOpen}
        handleClose={() => setIsConfirmationModalOpen(false)}
      >
        {userAccessToken && (
          <View style={styles.copyCodeContainer}>
            <AppText namedStyle="h3">{userAccessToken}</AppText>
            <TouchableOpacity onPress={copyToClipboard}>
              <Icon style={styles.copyIcon} name="copy" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.warningContainer}>
          <Icon style={styles.warningIcon} name="warning" />
          <AppText namedStyle="text">{t("modal_copy_text")}</AppText>
        </View>
        <AppButton
          label={t("modal_button_label")}
          size="lg"
          style={{ marginTop: 24 }}
          onPress={handleRegister}
          loading={registerMutation.isLoading}
        />
      </TransparentModal>

      <Block style={{ flex: 1, flexGrow: 1 }}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : null}
          enabled
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <Heading
              heading={t("heading")}
              subheading={t("subheading")}
              handleGoBack={() => navigation.goBack()}
            />
            <View style={styles.codeContainer}>
              <AppText isSemibold>{t("access_code")}</AppText>
              {userAccessToken ? (
                <View style={styles.copyCodeContainer}>
                  <AppText namedStyle="h3">{userAccessToken}</AppText>
                  <TouchableOpacity onPress={copyToClipboard}>
                    <Icon style={styles.copyIcon} name="copy" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View
                  style={{
                    alignSelf: "center",
                    marginVertical: 20,
                  }}
                >
                  <Loading />
                </View>
              )}
            </View>

            <View style={styles.warningContainer}>
              <Icon style={styles.warningIcon} name="warning" />
              <AppText namedStyle="smallText">{t("copy_text")}</AppText>
            </View>

            <Input
              label={t("nickname_label")}
              placeholder={t("nickname_placeholder")}
              value={data.nickname}
              onChange={(value) => handleChange("nickname", value)}
              onBlur={() => handleBlur("nickname", data.nickname)}
              errorMessage={errors.nickname}
              style={styles.input}
            />
            <InputPassword
              label={t("password_label")}
              placeholder={t("Enter your password")}
              value={data.password}
              onChange={(value) => handleChange("password", value)}
              errorMessage={errors.pssword}
              onBlur={() => {
                handleBlur("password", data.password);
              }}
              style={styles.input}
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
              />
            </View>
            <AppButton
              disabled={!canContinue}
              label={t("register_button_label")}
              style={styles.button}
              size="lg"
              onPress={() => setIsConfirmationModalOpen(true)}
            />
            <AppButton
              label={t("login_button_label")}
              size="lg"
              type="ghost"
              onPress={handleLoginRedirect}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </Block>
    </Screen>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: { flex: 1, paddingTop: 20 },
  codeContainer: {
    paddingTop: 40,
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
  },
  termsAgreement: { width: "85%", alignSelf: "center", paddingTop: 24 },
  button: { marginTop: 24 },
});

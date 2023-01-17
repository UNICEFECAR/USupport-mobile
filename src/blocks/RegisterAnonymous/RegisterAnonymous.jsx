import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
// import * as Clipboard from "expo-clipboard";
import "fast-text-encoding";
import Joi from "joi";

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
} from "#components";
import { userSvc, localStorage } from "#services";
import { validate, validateProperty } from "#utils";
import { useError } from "#hooks";
import { useTranslation } from "react-i18next";

export const RegisterAnonymous = ({ navigation }) => {
  const { t } = useTranslation("register-anonymous");
  const navigate = () => {};

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // On page load send a request to the server
  // to generate a user acces token
  const fetchUserAccessToken = async () => {
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
    onSuccess: (response) => {
      const { token: tokenData } = response.data;
      const { token, expiresIn, refreshToken } = tokenData;

      localStorage.setItem("token", token);
      localStorage.setItem("token-expires-in", expiresIn);
      localStorage.setItem("refresh-token", refreshToken);

      navigate("/register/support", {
        state: {
          hideGoBackArrow: false,
        },
      });
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      setErrors({ submit: errorMessage });
      setIsSubmitting(false);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleRegister = async () => {
    if (!isSubmitting) {
      setIsSubmitting(true);
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
    console.log(field, value);
    validateProperty(field, value, schema, setErrors);
  };

  const handleLoginRedirect = () => {
    navigation.navigate("Login");
  };

  const copyToClipboard = async () => {
    // await Clipboard.setStringAsync(userAccessToken);
  };

  const canContinue =
    data.password && data.isPrivacyAndTermsSelected && data.nickname;
  return (
    <Screen hasEmergencyButton={false}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : null}
        enabled
      >
        <Block style={{ flex: 1, flexGrow: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <Heading heading={t("heading")} subheading={t("subheading")} />
            <View style={styles.codeContainer}>
              <AppText isSemibold>{t("access_code")}</AppText>
              {userAccessToken ? (
                <View style={styles.copyCodeContainer}>
                  <AppText namedStyle="h3">{userAccessToken}</AppText>
                  <Icon style={styles.copyIcon} name="copy" />
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
              onPress={handleRegister}
            />
            <AppButton
              label={t("login_button_label")}
              size="lg"
              type="ghost"
              onPress={handleLoginRedirect}
            />
          </ScrollView>
        </Block>
      </KeyboardAvoidingView>
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

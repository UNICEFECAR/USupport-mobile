import React, { useContext, useEffect, useState } from "react";
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
  CheckBox,
} from "#components";

import { userSvc, localStorage, Context } from "#services";
import { validate, validateProperty, showToast } from "#utils";
import { useError } from "#hooks";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export const RegisterAnonymous = ({ navigation }) => {
  const { t } = useTranslation("register-anonymous");
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const { setToken, setInitialRouteName } = useContext(Context);
  const schema = Joi.object({
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

  const [data, setData] = useState({
    password: "",
    confirmPassword: "",
    nickname: "",
    isPrivacyAndTermsSelected: false,
    isAgeTermsSelected: false,
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
    if ((await validate(data, schema, setErrors)) === null) {
      registerMutation.mutate(data);
    } else {
      setIsConfirmationModalOpen(false);
    }
  };

  const handleChange = (field, value) => {
    console.log(field, value, data.password, data.confirmPassword);
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
    let newData = { ...data };
    newData[field] = value;
    setData(newData);
    // validateProperty("password", data.password, schema, setErrors);
  };

  const handleBlur = (field, value) => {
    if (
      (field === "password" && data.confirmPassword.length >= 8) ||
      field === "confirmPassword"
    ) {
      if (data.password !== data.confirmPassword) {
        setErrors({ confirmPassword: t("password_match_error") });
        return;
      }
    }
    validateProperty(field, value, schema, setErrors);
  };

  const handleLoginRedirect = () => {
    navigation.navigate("Login");
  };

  const copyToClipboard = async () => {
    setHasCopied(true);
    await Clipboard.setStringAsync(userAccessToken);
    showToast({ message: t("copy_success") });
  };

  const canContinue =
    data.password &&
    data.isPrivacyAndTermsSelected & data.isAgeTermsSelected &&
    data.nickname;

  const handleRegisterButtonClick = () => {
    if (data.password !== data.confirmPassword) {
      setErrors({ confirmPassword: t("password_match_error") });
      return;
    }
    if (hasCopied) {
      handleRegister();
    } else {
      setIsConfirmationModalOpen(true);
    }
  };

  return (
    <Screen hasEmergencyButton={false}>
      <SaveAccessCodeConfirmation
        isOpen={isConfirmationModalOpen}
        handleClose={() => setIsConfirmationModalOpen(false)}
        userAccessToken={userAccessToken}
        handleRegister={handleRegister}
        isRegisterLoading={registerMutation.isLoading}
        t={t}
      />
      <Heading
        heading={t("heading")}
        subheading={t("subheading")}
        handleGoBack={() => navigation.goBack()}
      />
      <Block style={{ flex: 1, flexGrow: 1, marginTop: 112 }}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : null}
          enabled
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View>
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
              placeholder={t("password_placeholder")}
              value={data.password}
              onChange={(value) => handleChange("password", value)}
              errorMessage={errors.password}
              onBlur={() => {
                handleBlur("password", data.password);
              }}
              style={styles.input}
            />
            <InputPassword
              label={t("confirm_password_label")}
              placeholder={t("password_placeholder")}
              value={data.confirmPassword}
              onChange={(value) => handleChange("confirmPassword", value)}
              errorMessage={errors.confirmPassword}
              onBlur={() => {
                handleBlur("confirmPassword", data.confirmPassword);
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
                navigation={navigation}
                textOne={t("terms_agreement_text_1")}
                textTwo={t("terms_agreement_text_2")}
                textThree={t("terms_agreement_text_3")}
                textFour={t("terms_agreement_text_4")}
              />
              <TermsAgreement
                isChecked={data.isAgeTermsSelected}
                setIsChecked={() =>
                  handleChange(
                    "isPrivacyAndTermsSelected",
                    !data.isPrivacyAndTermsSelected
                  )
                }
                textOne={t("age_terms_agreement_text")}
              />
            </View>
            <AppButton
              disabled={!canContinue}
              label={t("register_button_label")}
              style={styles.button}
              size="lg"
              onPress={handleRegisterButtonClick}
              loading={registerMutation.isLoading}
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

const SaveAccessCodeConfirmation = ({
  isOpen,
  handleClose,
  userAccessToken,
  handleRegister,
  isRegisterLoading,
  copyLabel = "Click to copy",
  t,
}) => {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const handleCopy = () => {
    setShouldAnimate(false);
    setHasCopied(true);
    showToast({ message: t("copy_success") });
  };

  const handleCheckboxClick = () => {
    setHasAgreed(!hasAgreed);
    if (!hasAgreed && !hasCopied) {
      setShouldAnimate(true);
    } else if (hasAgreed) {
      setShouldAnimate(false);
    }
  };

  const translateX = useSharedValue(5);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  useEffect(() => {
    if (shouldAnimate) {
      translateX.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 500 }),
          withTiming(5, { duration: 500 })
        ),
        100
      );
    }
  }, [shouldAnimate]);

  return (
    <TransparentModal
      heading={t("modal_heading")}
      isOpen={isOpen}
      handleClose={handleClose}
    >
      {userAccessToken && (
        <View style={styles.copyCodeContainer}>
          <AppText namedStyle="h3">{userAccessToken}</AppText>
          <TouchableOpacity onPress={handleCopy}>
            <Icon style={styles.copyIcon} name="copy" />
          </TouchableOpacity>
          <Animated.View
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
              },
              animatedStyle,
            ]}
          >
            <Icon name="arrow-chevron-back" color="#3d527b" size="sm" />
            <AppText namedStyle="smallText">{copyLabel}</AppText>
          </Animated.View>
        </View>
      )}
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
      <AppButton
        label={t("modal_button_label")}
        size="lg"
        style={{ marginTop: 24 }}
        onPress={handleRegister}
        disabled={!hasAgreed || !hasCopied}
        loading={isRegisterLoading}
      />
    </TransparentModal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: { flex: 1, paddingTop: 20 },
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
  termsAgreement: { width: "95%", alignSelf: "center", paddingTop: 24 },
  button: { marginTop: 24 },
  checkboxContainer: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 18,
  },
});

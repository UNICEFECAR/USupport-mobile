import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Joi from "joi";
import { StyleSheet, View } from "react-native";

import { Block, Error, Input, AppButton, TransparentModal } from "#components";

import { userSvc } from "#services";

import { validate } from "#utils";

import { useError } from "#hooks";

/**
 * ForgotPassword
 *
 * ForgotPassword block
 *
 * @return {jsx}
 */
export const ForgotPassword = ({ navigation }) => {
  const { t } = useTranslation("forgot-password");

  const [data, setData] = useState({ email: "" });
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .label(t("error_email_message")),
  });

  const handleResetPassword = async () => {
    if ((await validate(data, schema, setErrors)) == null) {
      try {
        await userSvc.generateForgotPasswordLink(
          data.email.toLowerCase(),
          "client"
        );
        setIsModalOpen(true);
      } catch (error) {
        const { message: errorMessage } = useError(error);
        setErrors({ submit: errorMessage });
      }
    }
  };

  const canContinue = data.email === "";
  const closeModal = () => {
    setIsModalOpen(false);
    navigation.navigate("Login");
  };

  return (
    <Block>
      <View style={styles.contentContainer}>
        <Input
          label={t("input_email_label")}
          value={data.email}
          placeholder={"user@mail.com"}
          onChange={(value) => setData({ email: value })}
          errorMessage={errors.email}
          style={styles.input}
        />
        {errors.submit ? <Error message={errors.submit} /> : null}
        <AppButton
          label={t("reset_password_button_label")}
          size="lg"
          onPress={handleResetPassword}
          disabled={canContinue}
          style={styles.button}
        />
      </View>
      <TransparentModal
        isOpen={isModalOpen}
        handleClose={closeModal}
        heading={t("modal_heading")}
        text={t("modal_text")}
      />
    </Block>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: "center",
  },
  input: { marginBottom: 16 },
  button: { marginTop: 16 },
});

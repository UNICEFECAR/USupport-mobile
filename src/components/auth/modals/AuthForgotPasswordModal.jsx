import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import Joi from "joi";

import { Backdrop, Input, TransparentModal } from "#components";
import { userSvc } from "#services";
import { validate } from "#utils";
import { useError } from "#hooks";

import { AuthenticationModalsLogo } from "../AuthenticationModalsLogo";
import { getAuthBackdropProps } from "../authBackdropProps";

export function AuthForgotPasswordModal({ onDone }) {
  const { t } = useTranslation("blocks", { keyPrefix: "forgot-password" });

  const [data, setData] = useState({ email: "" });
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .label(t("error_email_message")),
  });

  const handleResetPassword = async () => {
    setLoading(true);
    if ((await validate(data, schema, setErrors)) == null) {
      try {
        await userSvc.generateForgotPasswordLink(data.email.toLowerCase(), "client");
        setIsModalOpen(true);
      } catch (error) {
        const { message: errorMessage } = useError(error);
        setErrors({ submit: errorMessage });
      }
    }
    setLoading(false);
  };

  const isCtaDisabled = data.email === "";

  const closeModal = () => {
    setIsModalOpen(false);
    onDone?.();
  };

  return (
    <>
      <Backdrop
        {...getAuthBackdropProps()}
        topHeaderComponent={<AuthenticationModalsLogo onBackPress={onDone} />}
        ctaLabel={t("reset_password_button_label")}
        ctaHandleClick={handleResetPassword}
        isCtaDisabled={isCtaDisabled}
        isCtaLoading={loading}
        errorMessage={errors.submit}
      >
        <View style={styles.contentContainer}>
          <Input
            label={t("input_email_label")}
            value={data.email}
            autoCapitalize="none"
            placeholder="user@mail.com"
            onChange={(value) => setData({ email: value })}
            errorMessage={errors.email}
            style={styles.input}
          />
        </View>
      </Backdrop>

      <TransparentModal
        isOpen={isModalOpen}
        handleClose={closeModal}
        heading={t("modal_heading")}
        text={t("modal_text")}
      />
    </>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: "center",
  },
  input: { marginBottom: 16 },
});

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import Joi from "joi";

import { Backdrop, InputPassword } from "#components";

import { validate, validateProperty, showToast } from "#utils";

import { useError } from "#hooks";

import { userSvc } from "#services";

/**
 * ChangePassword
 *
 * The ChangePassword backdrop
 *
 * @return {jsx}
 */
export const ChangePassword = ({ isOpen, onClose }) => {
  const { t } = useTranslation("change-password");

  const schema = Joi.object({
    oldPassword: Joi.string()
      .pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}"))
      .label(t("password_error")),
    newPassword: Joi.string()
      .pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}"))
      .label(t("password_error")),
    confirmPassword: Joi.string()
      .pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}"))
      .label(t("password_match_error")),
  });

  const [data, setData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const changePassword = async () => {
    const res = await userSvc.changePassword({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    });
    if (res.status === 200) {
      return true;
    }
  };
  const changePasswordMutation = useMutation(changePassword, {
    onSuccess: () => {
      setData({
        oldPassword: "",
        newPassword: "",
      });
      onClose();
      showToast({ message: t("password_changed_message") });
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      setErrors({ submit: errorMessage });
    },
  });

  const handleBlur = (field, value) => {
    if (field === "confirmPassword" && value !== data.newPassword) {
      setErrors({
        ...errors,
        confirmPassword: t("password_match_error"),
      });
      return;
    }
    validateProperty(field, value, schema, setErrors);
  };

  const handleChange = (field, value) => {
    setData({
      ...data,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    if (data.confirmPassword !== data.newPassword) {
      setErrors({
        ...errors,
        confirmPassword: t("password_match_error"),
      });
      return;
    }
    if ((await validate(data, schema, setErrors)) === null) {
      changePasswordMutation.mutate();
    }
  };

  return (
    <Backdrop
      classes="change-password"
      title="ChangePassword"
      isOpen={isOpen}
      onClose={onClose}
      ctaLabel={t("button_label")}
      ctaHandleClick={handleSubmit}
      isCtaLoading={changePasswordMutation.isLoading}
      heading={t("heading")}
      errorMessage={errors.submit}
    >
      <InputPassword
        errorMessage={errors.oldPassword}
        label={t("current_password")}
        value={data.oldPassword}
        onBlur={() => handleBlur("oldPassword", data.oldPassword)}
        onChange={(value) => handleChange("oldPassword", value)}
      />
      <InputPassword
        errorMessage={errors.newPassword}
        label={t("new_password")}
        value={data.newPassword}
        onBlur={() => handleBlur("newPassword", data.newPassword)}
        onChange={(value) => handleChange("newPassword", value)}
        style={styles.marginTop32}
      />
      <InputPassword
        errorMessage={errors.confirmPassword}
        label={t("confirm_password")}
        value={data.confirmPassword}
        onBlur={() => handleBlur("confirmPassword", data.confirmPassword)}
        onChange={(value) => handleChange("confirmPassword", value)}
        style={styles.marginTop32}
      />
    </Backdrop>
  );
};

const styles = StyleSheet.create({
  marginTop32: { marginTop: 32 },
});

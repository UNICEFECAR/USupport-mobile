import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import Joi from "joi";

import { Backdrop, InputPassword } from "#components";

import { useError } from "#hooks";

import { clientSvc, localStorage, Context } from "#services";

import { StyleSheet } from "react-native";

/**
 * DeleteAccount
 *
 * The DeleteAccount backdrop
 *
 * @return {jsx}
 */
export const DeleteAccount = ({ isOpen, onClose }) => {
  const { t } = useTranslation("delete-account");

  const { setToken } = useContext(Context);

  const schema = Joi.object({
    password: Joi.string(),
  });

  const [data, setData] = useState({ password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deleteAccount = async () => {
    const res = await clientSvc.deleteClientProfile(data.password);
    if (res.status === 200) {
      return true;
    }
  };
  const deleteAccountMutation = useMutation(deleteAccount, {
    onSuccess: () => {
      setIsSubmitting(false);
      handleLogout();
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      setErrors({ submit: errorMessage });
      setIsSubmitting(false);
    },
  });

  const handleChange = (value) => {
    setData({
      password: value,
    });
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    deleteAccountMutation.mutate();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  return (
    <Backdrop
      classes="delete-account"
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
      text={t("text")}
      ctaLabel={t("delete_account_button")}
      ctaHandleClick={handleSubmit}
      isCtaDisabled={isSubmitting}
      secondaryCtaLabel={t("cancel_button")}
      secondaryCtaHandleClick={onClose}
      secondaryCtaType="secondary"
      errorMessage={errors.submit}
    >
      <InputPassword
        label={t("input_label")}
        value={data.password}
        onChange={(value) => handleChange(value)}
        style={styles.input}
      />
    </Backdrop>
  );
};

const styles = StyleSheet.create({
  input: { alignSelf: "center" },
});

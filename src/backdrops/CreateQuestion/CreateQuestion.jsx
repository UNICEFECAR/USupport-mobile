import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import Joi from "joi";

import { Backdrop, Textarea, AppButton } from "#components";

import { useAddQuestion } from "#hooks";

import { validate, showToast } from "#utils";

/**
 * CreateQuestion
 *
 * The CreateQuestion modal
 *
 * @return {jsx}
 */
export const CreateQuestion = ({ isOpen, onClose }) => {
  const { t } = useTranslation("create-question");

  const [data, setData] = useState({ question: "" });
  const [errors, setErrors] = useState("");

  const onSuccess = () => {
    showToast({ message: t("success_toast") });
    onClose();
  };
  const onError = (errorMessage) => {
    const errorsCopy = { ...errors };
    errorsCopy.query = errorMessage;
    setErrors(errorsCopy);
  };

  const addQuestionMutation = useAddQuestion(onSuccess, onError);

  const schema = Joi.object({
    question: Joi.string().min(10).label(t("text_area_error_label")),
  });

  const handleSendQuestion = async () => {
    const question = data.question;
    if ((await validate(data, schema, setErrors)) === null) {
      addQuestionMutation.mutate({ question });
    }
  };

  const handleChange = (value) => {
    const dataCopy = { ...data };
    dataCopy.question = value;
    setData(dataCopy);
  };

  return (
    <Backdrop
      heading={t("heading")}
      text={t("subheading")}
      isOpen={isOpen}
      onClose={onClose}
      errorMessage={errors.query}
      hasKeyboardListener={true}
    >
      <Textarea
        label={t("text_area_label")}
        onChange={(value) => handleChange(value)}
        value={data.message}
        errorMessage={errors.question}
      />
      <AppButton
        label={t("send_your_question")}
        size="lg"
        onPress={handleSendQuestion}
        style={styles.button}
      />
      <AppButton
        label={t("cancel")}
        type="secondary"
        size="lg"
        style={styles.button}
        onPress={onClose}
      />
    </Backdrop>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: "center",
    marginHorizontal: 12,
    marginTop: 20,
  },
});

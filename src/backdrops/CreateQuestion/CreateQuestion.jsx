import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Joi from "joi";

import { Backdrop, Textarea } from "#components";

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
  const { t } = useTranslation("backdrops", { keyPrefix: "create-question" });
  const queryClient = useQueryClient();

  const [data, setData] = useState({ question: "" });
  const [errors, setErrors] = useState("");

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["getClientQuestions"] });
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
    setData((prev) => ({ ...prev, question: value }));
  };

  return (
    <Backdrop
      heading={t("heading")}
      text={t("subheading")}
      isOpen={isOpen}
      onClose={onClose}
      errorMessage={errors.query}
      ctaLabel={t("send_your_question")}
      ctaHandleClick={handleSendQuestion}
      isCtaLoading={addQuestionMutation.isLoading}
      secondaryCtaLabel={t("cancel")}
      secondaryCtaHandleClick={onClose}
      secondaryCtaType="secondary"
      secondaryCtaStyle={{ marginBottom: 85 }}
      hasKeyboardListener={true}
    >
      <Textarea
        label={t("text_area_label")}
        onChange={handleChange}
        value={data.question}
        errorMessage={errors.question}
      />
    </Backdrop>
  );
};

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import Joi from "joi";

import { Block, AppText, Textarea, AppButton } from "#components";

import { validate, showToast } from "#utils";

import { useSendInformationPortalSuggestion } from "#hooks";

const initialData = {
  suggestion: "",
};
/**
 * GiveSuggestion
 *
 * Give Suggestion Block
 *
 * @return {jsx}
 */
export const GiveSuggestion = () => {
  const { t } = useTranslation("give-suggestion");

  const [data, setData] = useState({ ...initialData });
  const [errors, setErrors] = useState({});
  const [canSubmit, setCanSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const schema = Joi.object({
    suggestion: Joi.string().min(5).label("Please enter your sugestion"),
  });

  useEffect(() => {
    if (data.suggestion !== "") {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }, [data]);

  const closeSuccessModal = () => setIsSuccessModalOpen(false);

  const onError = (error) => toast(error);
  const onSuccess = () => {
    setIsSubmitting(false);
    setIsSuccessModalOpen(true);
    showToast({ message: "success" });
    setData(initialData);
  };
  const sendSuggestionMutation = useSendInformationPortalSuggestion(
    onError,
    onSuccess
  );

  const handleChange = (field, value) => {
    setData({
      ...data,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    if (!isSubmitting) {
      if ((await validate(data, schema, setErrors)) === null) {
        setIsSubmitting(true);
        sendSuggestionMutation.mutate(data.suggestion);
      }
    }
  };

  return (
    <Block style={styles.block}>
      <AppText namedStyle="h3">{t("heading")}</AppText>
      <AppText style={styles.subheading}>{t("subheading")}</AppText>
      <Textarea
        placeholder={t("suggestion_placeholder")}
        onChange={(value) => handleChange("suggestion", value)}
        errorMessage={errors.suggestion}
        style={styles.textArea}
      />
      <AppButton label={t("submit")} type="ghost" onPress={handleSubmit} />
    </Block>
  );
};

const styles = StyleSheet.create({
  block: { paddingBottom: 70 },
  subheading: { marginTop: 16 },
  textArea: { marginVertical: 16 },
});

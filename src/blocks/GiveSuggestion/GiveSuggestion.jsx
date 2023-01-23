import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import Joi from "joi";

import { Block, AppText, Textarea, AppButton } from "#components";

import { validate } from "#utils";

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

  const handleModalSuccessCtaClick = () => {
    window.location.reload(false);
    window.scrollTo(0, 0);
  };

  const closeSuccessModal = () => setIsSuccessModalOpen(false);

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
        setTimeout(() => {
          //TODO: send request to country administrator
          setIsSubmitting(false);
          setIsSuccessModalOpen(true);
        }, 500);
      }
    }
  };

  return (
    <Block>
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
  subheading: { marginTop: 16 },
  textArea: { marginVertical: 16 },
});

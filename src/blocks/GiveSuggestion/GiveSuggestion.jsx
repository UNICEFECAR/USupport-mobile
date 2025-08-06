import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Keyboard } from "react-native";
import Joi from "joi";

import {
  Block,
  AppText,
  Textarea,
  AppButton,
  TransparentModal,
} from "#components";
import { validate, showToast } from "#utils";
import { useSendPlatformSuggestion } from "#hooks";
import { Context } from "#services";

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
export const GiveSuggestion = ({
  type = "information-portal",
  navigation,
  style,
}) => {
  const { t } = useTranslation("blocks", { keyPrefix: "give-suggestion" });
  const { isTmpUser, handleRegistrationModalOpen } = useContext(Context);

  const [data, setData] = useState({ ...initialData });
  const [errors, setErrors] = useState({});
  const [canSubmit, setCanSubmit] = useState(false);
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

  const onError = (error) => {
    showToast({ message: error, type: "error" });
  };
  const onSuccess = () => {
    Keyboard.dismiss();
    if (type === "information-portal") {
      setIsSuccessModalOpen(true);
    } else {
      showToast({
        message: t("send_success_text"),
        type: "success",
      });
    }
    setData(initialData);
  };
  const sendSuggestionMutation = useSendPlatformSuggestion(onError, onSuccess);

  const handleChange = (field, value) => {
    setData({
      ...data,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    if (isTmpUser) {
      handleRegistrationModalOpen();
    } else if ((await validate(data, schema, setErrors)) === null) {
      sendSuggestionMutation.mutate({
        suggestion: data.suggestion,
        type,
      });
    }
  };

  const handleRedirectToNewest = () => {
    closeSuccessModal();
    navigation.push("Articles", { sort: "createdAt" });
  };

  return (
    <Block style={[styles.block, style]}>
      <AppText namedStyle="h3">{t("heading")}</AppText>
      <AppText style={styles.subheading}>{t("subheading")}</AppText>
      <Textarea
        placeholder={t("suggestion_placeholder")}
        onChange={(value) => handleChange("suggestion", value)}
        errorMessage={errors.suggestion}
        style={styles.textArea}
        value={data.suggestion}
      />
      <AppButton
        label={t("submit")}
        style={{
          marginTop: 7,
          width: "100%",
          // marginLeft: 10,
        }}
        type="primary"
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={sendSuggestionMutation.isLoading}
      />
      <TransparentModal
        isOpen={isSuccessModalOpen}
        handleClose={closeSuccessModal}
        heading={t("modal_title")}
        text={t("modal_text")}
        ctaLabel={t("modal_cta_label")}
        ctaHandleClick={handleRedirectToNewest}
      />
    </Block>
  );
};

const styles = StyleSheet.create({
  block: { paddingBottom: 120, paddingHorizontal: 22 },
  subheading: { marginTop: 16 },
  textArea: { marginVertical: 16, width: "100%" },
});

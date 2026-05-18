import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import Joi from "joi";

import { TransparentModal, Textarea } from "#components";
import { useCreateOrganizationReport } from "#hooks";
import { showToast, validate } from "#utils";

export function ReportOrganization({ isOpen, handleClose, organizationId }) {
  const { t } = useTranslation("backdrops", {
    keyPrefix: "organization-report",
  });

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  const schema = Joi.object({
    message: Joi.string().trim().min(1).label(t("message_error")),
  });

  useEffect(() => {
    if (!isOpen) {
      setMessage("");
      setErrors({});
      setSubmitError(null);
    }
  }, [isOpen]);

  const mutation = useCreateOrganizationReport(
    () => {
      showToast({ message: t("success_message") });
      handleClose();
    },
    (errMessage) => setSubmitError(errMessage)
  );

  const handleConfirm = async () => {
    if (!organizationId) return;
    setSubmitError(null);

    if ((await validate({ message }, schema, setErrors)) !== null) {
      return;
    }

    try {
      await mutation.mutateAsync({
        organizationId,
        reason: message.trim(),
      });
    } catch {
      //
    }
  };

  return (
    <TransparentModal
      isOpen={isOpen}
      handleClose={handleClose}
      heading={t("heading")}
      text={t("subheading")}
      ctaLabel={t("confirm_button")}
      ctaHandleClick={handleConfirm}
      isCtaDisabled={mutation.isLoading || !message.trim()}
      isCtaLoading={mutation.isLoading}
      secondaryCtaLabel={t("cancel_button")}
      secondaryCtaHandleClick={handleClose}
      secondaryCtaType="ghost"
      errorMessage={submitError}
    >
      <View style={styles.textareaWrap}>
        <Textarea
          label={t("message_label")}
          placeholder={t("message_placeholder")}
          value={message}
          onChange={setMessage}
          style={styles.textarea}
          errorMessage={errors.message}
        />
      </View>
    </TransparentModal>
  );
}

ReportOrganization.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  organizationId: PropTypes.string,
};

const styles = StyleSheet.create({
  textareaWrap: {
    marginTop: 8,
    width: "100%",
  },
  textarea: {
    width: "100%",
  },
});

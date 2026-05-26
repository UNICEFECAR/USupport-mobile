import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { TransparentModal, Textarea } from "#components";
import { useCreateOrganizationReport } from "#hooks";
import { showToast } from "#utils";

export function ReportOrganization({ isOpen, handleClose, organizationId }) {
  const { t } = useTranslation("backdrops", {
    keyPrefix: "organization-report",
  });

  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setMessage("");
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
    try {
      await mutation.mutateAsync({ organizationId, reason: message });
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
      isCtaDisabled={mutation.isLoading}
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

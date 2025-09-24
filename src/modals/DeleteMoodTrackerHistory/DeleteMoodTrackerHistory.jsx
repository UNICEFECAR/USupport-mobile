import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";

import { TransparentModal } from "#components";
import { useError } from "#hooks";
import { showToast } from "#utils";
import { clientSvc } from "#services";

/**
 * DeleteMoodTrackerHistory
 *
 * The DeleteMoodTrackerHistory modal
 *
 * @return {jsx}
 */
export const DeleteMoodTrackerHistory = ({ isOpen, onClose }) => {
  const { t } = useTranslation("modals", {
    keyPrefix: "delete-mood-tracker-history",
  });

  const [errors, setErrors] = useState({});

  const deleteMoodTrackHistory = async () => {
    const res = await clientSvc.deleteMoodTrackerHistory();
    return res;
  };

  const deleteMoodTrackHistoryMutation = useMutation(deleteMoodTrackHistory, {
    onSuccess: () => {
      showToast({ message: t("success") });
      onClose();
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      setErrors({ submit: errorMessage });
    },
  });

  const handleConfirm = () => {
    deleteMoodTrackHistoryMutation.mutate();
  };

  return (
    <TransparentModal
      heading={t("heading")}
      text={t("subheading")}
      isOpen={isOpen}
      handleClose={onClose}
      ctaLabel={t("confirm")}
      ctaColor="red"
      ctaHandleClick={handleConfirm}
      secondaryCtaLabel={t("cancel")}
      secondaryCtaType="primary"
      secondaryCtaHandleClick={onClose}
      errorMessage={errors.submit}
      isCtaLoading={deleteMoodTrackHistoryMutation.isLoading}
    />
  );
};

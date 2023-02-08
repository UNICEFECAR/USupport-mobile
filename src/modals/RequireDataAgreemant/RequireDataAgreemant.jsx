import React from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { TransparentModal } from "#components";

import { clientSvc } from "#services";

/**
 * RequireDataAgreement
 *
 * The RequireDataAgreement modal
 *
 * @return {jsx}
 */
export const RequireDataAgreement = ({
  isOpen,
  onClose,
  onSuccess = () => {},
}) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("require-data-agreement");

  const updateDataProcessing = async () => {
    await clientSvc.changeDataProcessingAgreement(true);
    return true;
  };
  const updateDataProcessingMutation = useMutation(updateDataProcessing, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-data"] });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      toast(errorMessage, { type: "error" });
    },
  });

  const handleGivePermission = () => {
    updateDataProcessingMutation.mutate();
  };

  return (
    <TransparentModal
      classes="require-data-agreement"
      heading={t("heading")}
      text={t("text")}
      isOpen={isOpen}
      closeModal={onClose}
      ctaLabel={t("give_permission")}
      ctaHandleClick={handleGivePermission}
      secondaryCtaLabel={t("cancel")}
      secondaryCtaHandleClick={onClose}
      secondaryCtaType="secondary"
    />
  );
};

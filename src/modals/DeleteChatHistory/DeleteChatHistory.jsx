import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";

import { TransparentModal } from "#components";
import { useError } from "#hooks";
import { showToast } from "#utils";
import { clientSvc } from "#services";

/**
 * DeleteChatHistory
 *
 * The DeleteChatHistory modal
 *
 * @return {jsx}
 */
export const DeleteChatHistory = ({ isOpen, onClose }) => {
  const { t } = useTranslation("delete-chat-history");

  const [errors, setErrors] = useState({});

  const deleteChat = async () => {
    const res = await clientSvc.deleteChatHistory();
    return res;
  };

  const deleteAccountMutation = useMutation(deleteChat, {
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
    deleteAccountMutation.mutate();
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
    />
  );
};

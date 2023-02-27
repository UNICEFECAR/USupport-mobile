import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AppText, TransparentModal } from "#components";
import { useError } from "#hooks";
import { clientSvc } from "#services";

/**
 * DeleteProfilePicture
 *
 * The DeleteProfilePicture modal
 *
 * @return {jsx}
 */
export const DeleteProfilePicture = ({ isOpen, onClose }) => {
  const { t } = useTranslation("delete-profile-picture");
  const [error, setError] = useState();
  const queryClient = useQueryClient();

  const deletePicture = async () => {
    const res = await clientSvc.deleteImage();
    if (res.status === 200) {
      return true;
    }
  };

  const deletePictureMutation = useMutation(deletePicture, {
    onSuccess: () => {
      queryClient.invalidateQueries(["client-data"]);
      onClose();
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      setError(errorMessage);
    },
  });

  const handlePictureDelete = () => deletePictureMutation.mutate();

  return (
    <TransparentModal
      classes="delete-profile-picture"
      title="DeleteProfilePicture"
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
      ctaLabel={t("remove_button")}
      ctaHandleClick={handlePictureDelete}
      isCtaLoading={deletePictureMutation.isLoading}
      secondaryCtaLabel={t("cancel_button")}
      secondaryCtaHandleClick={onClose}
      secondaryCtaType="secondary"
      errorMessage={error}
    >
      <AppText style={{ marginVertical: 25 }}>{t("text")}</AppText>
    </TransparentModal>
  );
};

import React from "react";
import { useTranslation } from "react-i18next";

import { TransparentModal } from "#components";

/**
 * RequireRegistration
 *
 * The RequireRegistration modal
 *
 * @return {jsx}
 */
export const RequireRegistration = ({ handleContinue, isOpen, onClose }) => {
  const { t } = useTranslation("require-registration");

  return (
    <TransparentModal
      heading={t("heading")}
      text={t("text")}
      ctaLabel={t("button")}
      ctaHandleClick={handleContinue}
      isOpen={isOpen}
      handleClose={onClose}
    />
  );
};

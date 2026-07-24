import React from "react";
import { useTranslation } from "react-i18next";

import { KeepMeSignedInSheet } from "./KeepMeSignedInSheet";
import { LoginOptionCard } from "./LoginOptionCard";

/**
 * Save credentials + keep me signed in cards used on login and register modals.
 */
export function AuthSessionOptionCards({
  shouldSaveCredentials,
  onSaveCredentialsToggle,
  keepMeSignedInToggleValue,
  onKeepMeSignedInToggle,
  onKeepMeSignedInInfoPress,
  isKeepMeSignedInSheetOpen,
  onKeepMeSignedInSheetCancel,
  onKeepMeSignedInSheetContinue,
}) {
  const { t } = useTranslation("blocks", { keyPrefix: "login" });

  return (
    <>
      <LoginOptionCard
        iconName="fingerprint"
        title={t("save_credentials")}
        description={t("save_credentials_description")}
        isToggled={shouldSaveCredentials}
        onToggle={onSaveCredentialsToggle}
      />

      <LoginOptionCard
        iconName="circle-actions-success"
        title={t("keep_me_signed_in")}
        description={t("keep_me_signed_in_description")}
        isToggled={keepMeSignedInToggleValue}
        onToggle={onKeepMeSignedInToggle}
        showInfoIcon
        onInfoPress={onKeepMeSignedInInfoPress}
      />

      <KeepMeSignedInSheet
        isOpen={isKeepMeSignedInSheetOpen}
        onCancel={onKeepMeSignedInSheetCancel}
        onContinue={onKeepMeSignedInSheetContinue}
      />
    </>
  );
}

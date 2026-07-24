import { useContext, useState } from "react";
import { Platform } from "react-native";
import { useTranslation } from "react-i18next";
import * as LocalAuthentication from "expo-local-authentication";

import { Context } from "#services";
import {
  resolveKeepMeSignedInOnLogin,
  saveCredentialsForCurrentCountry,
  syncDeviceUnlockFromStorage,
} from "#utils";

/**
 * Shared save-credentials + keep-me-signed-in state for auth modals.
 */
export function useAuthSessionOptions() {
  const { t } = useTranslation("blocks", { keyPrefix: "login" });
  const { setRequireBiometricsSetup, setUserPin, setHasAuthenticatedWithPin } =
    useContext(Context);

  const [shouldSaveCredentials, setShouldSaveCredentials] = useState(false);
  const [keepMeSignedIn, setKeepMeSignedIn] = useState(false);
  const [isKeepMeSignedInSheetOpen, setIsKeepMeSignedInSheetOpen] =
    useState(false);
  const [isKeepMeSignedInPending, setIsKeepMeSignedInPending] = useState(false);

  const handleKeepMeSignedInToggle = (nextValue) => {
    if (nextValue) {
      setIsKeepMeSignedInPending(true);
      setIsKeepMeSignedInSheetOpen(true);
      return;
    }
    setKeepMeSignedIn(false);
  };

  const handleKeepMeSignedInSheetCancel = () => {
    setIsKeepMeSignedInSheetOpen(false);
    setIsKeepMeSignedInPending(false);
  };

  const handleKeepMeSignedInSheetContinue = () => {
    setIsKeepMeSignedInSheetOpen(false);
    setIsKeepMeSignedInPending(false);
    setKeepMeSignedIn(true);
  };

  const saveCredentialsIfEnabled = async ({ username, password }) => {
    if (!shouldSaveCredentials) return;

    try {
      let iosSuccess = false;

      if (Platform.OS === "ios") {
        const res = await LocalAuthentication.authenticateAsync({
          promptMessage: t("prompt_2_title"),
        });
        iosSuccess = Boolean(res?.success);
      }

      if (Platform.OS === "android" || iosSuccess) {
        await saveCredentialsForCurrentCountry({
          username,
          password,
          authenticationPrompt: {
            title: t("prompt_2_title"),
            cancel: t("cancel"),
          },
        });
      }
    } catch {
      // User cancellation / OS policy should not break auth success.
    }
  };

  const applyKeepMeSignedIn = async () => {
    const { requireBiometricsSetup } =
      await resolveKeepMeSignedInOnLogin(keepMeSignedIn);
    setRequireBiometricsSetup?.(requireBiometricsSetup);
    await syncDeviceUnlockFromStorage({
      setUserPin,
      setHasAuthenticatedWithPin,
    });
  };

  return {
    shouldSaveCredentials,
    setShouldSaveCredentials,
    keepMeSignedInToggleValue: keepMeSignedIn || isKeepMeSignedInPending,
    handleKeepMeSignedInToggle,
    isKeepMeSignedInSheetOpen,
    handleKeepMeSignedInSheetCancel,
    handleKeepMeSignedInSheetContinue,
    openKeepMeSignedInSheet: () => setIsKeepMeSignedInSheetOpen(true),
    saveCredentialsIfEnabled,
    applyKeepMeSignedIn,
  };
}

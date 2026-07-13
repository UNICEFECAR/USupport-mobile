import { useContext, useState } from "react";
import { Platform } from "react-native";
import { useTranslation } from "react-i18next";
import * as Keychain from "react-native-keychain";
import * as LocalAuthentication from "expo-local-authentication";

import { Context } from "#services";
import { resolveKeepMeSignedInOnLogin } from "#utils";

const KEYCHAIN_SERVER = "https://usupport.online";

/**
 * Shared save-credentials + keep-me-signed-in state for auth modals.
 */
export function useAuthSessionOptions() {
  const { t } = useTranslation("blocks", { keyPrefix: "login" });
  const { setRequireBiometricsSetup } = useContext(Context);

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
      const usernameForKeychain = String(username).includes("@")
        ? String(username).toLowerCase().trim()
        : String(username).trim();

      if (Platform.OS === "ios") {
        const res = await LocalAuthentication.authenticateAsync({
          promptMessage: t("prompt_2_title"),
        });
        iosSuccess = Boolean(res?.success);
      }

      if (Platform.OS === "android" || iosSuccess) {
        await Keychain.setInternetCredentials(
          KEYCHAIN_SERVER,
          usernameForKeychain,
          password,
          {
            accessControl:
              Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
            authenticationPrompt: {
              title: t("prompt_2_title"),
              cancel: t("cancel"),
            },
          }
        );
      }
    } catch {
      // User cancellation / OS policy should not break auth success.
    }
  };

  const applyKeepMeSignedIn = async () => {
    const { requireBiometricsSetup } =
      await resolveKeepMeSignedInOnLogin(keepMeSignedIn);
    setRequireBiometricsSetup?.(requireBiometricsSetup);
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

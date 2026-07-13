import { localStorage } from "#services";
import * as Keychain from "react-native-keychain";

import { isTokenExpired } from "./token";

const KEEP_ME_SIGNED_IN_KEY = "keep-me-signed-in";
const PENDING_KEEP_ME_SIGNED_IN_KEY = "pending-keep-me-signed-in";
const KEYCHAIN_SERVER = "https://usupport.online";

export async function setKeepMeSignedIn(enabled) {
  if (enabled) {
    await localStorage.setItem(KEEP_ME_SIGNED_IN_KEY, "true");
  } else {
    await localStorage.removeItem(KEEP_ME_SIGNED_IN_KEY);
  }
}

export async function isKeepMeSignedIn() {
  return (await localStorage.getItem(KEEP_ME_SIGNED_IN_KEY)) === "true";
}

export async function setPendingKeepMeSignedIn(enabled) {
  if (enabled) {
    await localStorage.setItem(PENDING_KEEP_ME_SIGNED_IN_KEY, "true");
  } else {
    await localStorage.removeItem(PENDING_KEEP_ME_SIGNED_IN_KEY);
  }
}

export async function isPendingKeepMeSignedIn() {
  return (await localStorage.getItem(PENDING_KEEP_ME_SIGNED_IN_KEY)) === "true";
}

export async function clearSessionPersistenceFlags() {
  await localStorage.removeItem(KEEP_ME_SIGNED_IN_KEY);
  await localStorage.removeItem(PENDING_KEEP_ME_SIGNED_IN_KEY);
}

export async function clearSavedCredentials() {
  try {
    await Keychain.resetInternetCredentials({ server: KEYCHAIN_SERVER });
  } catch {}
}

export async function clearStoredAuthTokens() {
  await localStorage.removeItem("token");
  await localStorage.removeItem("refresh-token");
  await localStorage.removeItem("token-expires-in");
  await localStorage.removeItem("expires-in");
}

export async function clearDeviceUnlockSettings() {
  await localStorage.removeItem("pin-code");
  await localStorage.removeItem("biometrics-enabled");
  await localStorage.removeItem("has-declined-biometrics");
}

/** Clears tokens, device unlock, session flags, and keychain credentials. */
export async function clearEphemeralAuthSession() {
  await clearStoredAuthTokens();
  await clearDeviceUnlockSettings();
  await clearSessionPersistenceFlags();
  await clearSavedCredentials();
}

/** Full local auth cleanup used on logout. */
export async function clearAuthSessionOnLogout() {
  await clearEphemeralAuthSession();
  await localStorage.removeItem("isRegistered");
}

/**
 * On cold start, restore the session only when keep-me-signed-in was explicitly enabled.
 */
export async function resolveStoredSessionOnColdStart(storedToken) {
  await clearAbandonedPendingOnColdStart(
    await localStorage.getItem("pin-code")
  );

  if (!storedToken) {
    return { token: null, pinCode: null };
  }

  if (isTokenExpired(storedToken)) {
    await clearEphemeralAuthSession();
    return { token: null, pinCode: null };
  }

  const keepSignedIn = await isKeepMeSignedIn();
  if (!keepSignedIn) {
    await clearEphemeralAuthSession();
    return { token: null, pinCode: null };
  }

  const pinCode = await localStorage.getItem("pin-code");
  return { token: storedToken, pinCode };
}

export async function hasDeviceUnlockSetup() {
  const pin = await localStorage.getItem("pin-code");
  const biometrics = await localStorage.getItem("biometrics-enabled");
  return !!pin || biometrics === "true";
}

/**
 * Persists keep-me-signed-in flags and returns navigation state for the caller.
 */
export async function resolveKeepMeSignedInOnLogin(keepMeSignedIn) {
  if (!keepMeSignedIn) {
    await clearSessionPersistenceFlags();
    return {
      initialRouteName: "TabNavigation",
      requireBiometricsSetup: false,
    };
  }

  if (await hasDeviceUnlockSetup()) {
    await setKeepMeSignedIn(true);
    await setPendingKeepMeSignedIn(false);
    return {
      initialRouteName: "TabNavigation",
      requireBiometricsSetup: false,
    };
  }

  await setPendingKeepMeSignedIn(true);
  await setKeepMeSignedIn(false);
  return {
    initialRouteName: "SetUpBiometrics",
    requireBiometricsSetup: true,
  };
}

/**
 * Finalizes keep-me-signed-in after PIN setup. Returns true when pending was applied.
 */
export async function finalizeKeepMeSignedInAfterPinSetup() {
  const pending = await isPendingKeepMeSignedIn();
  if (!pending) return false;

  await setKeepMeSignedIn(true);
  await setPendingKeepMeSignedIn(false);
  return true;
}

export async function clearAbandonedPendingOnColdStart(pinCode) {
  const pending = await isPendingKeepMeSignedIn();
  if (pending && !pinCode) {
    await setPendingKeepMeSignedIn(false);
  }
}

import { localStorage } from "#services";

import { isTokenExpired } from "./token";

const KEEP_ME_SIGNED_IN_KEY = "keep-me-signed-in";
const PENDING_KEEP_ME_SIGNED_IN_KEY = "pending-keep-me-signed-in";

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

/** Clears tokens and keep-me-signed-in flags. Preserves PIN/biometrics and keychain credentials. */
export async function clearAuthSessionTokensAndFlags() {
  await clearStoredAuthTokens();
  await clearSessionPersistenceFlags();
}

/** Clears tokens, device unlock, and session flags. Preserves keychain credentials. */
export async function clearAuthSessionData() {
  await clearAuthSessionTokensAndFlags();
  await clearDeviceUnlockSettings();
}

/** Ends the active session on logout. Preserves PIN/biometrics and saved credentials. */
export async function clearAuthSessionOnLogout() {
  await clearAuthSessionTokensAndFlags();
  await localStorage.removeItem("isRegistered");
}

/**
 * Loads a stored PIN into context after login when device unlock already exists.
 */
export async function syncDeviceUnlockFromStorage({
  setUserPin,
  setHasAuthenticatedWithPin,
}) {
  const pinCode = await localStorage.getItem("pin-code");
  if (!pinCode) return;

  setUserPin?.(pinCode);

  if (await isKeepMeSignedIn()) {
    setHasAuthenticatedWithPin?.(false);
  }
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
    await clearAuthSessionTokensAndFlags();
    return { token: null, pinCode: null };
  }

  const keepSignedIn = await isKeepMeSignedIn();
  if (!keepSignedIn) {
    await clearAuthSessionTokensAndFlags();
    const pinCode = await localStorage.getItem("pin-code");
    return { token: null, pinCode };
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

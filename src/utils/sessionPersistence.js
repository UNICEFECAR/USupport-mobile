import { localStorage } from "#services";

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

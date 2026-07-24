import { localStorage } from "#services";

import { clearAuthSessionData } from "./sessionPersistence";

/** Clears session tokens and flags when switching country. Preserves keychain credentials. */
export async function clearStaleAuthSession() {
  await clearAuthSessionData();
}

export {
  clearSavedCredentials,
  clearSavedCredentialsForCountry,
} from "./savedCredentials";

/**
 * Run when the user picks a different country on Welcome / auth welcome.
 * Returns true when the country actually changed (cleanup was performed).
 */
export async function handleCountrySelectionChange({
  previousCountry,
  nextCountry,
  countryObject,
}) {
  const countryChanged =
    previousCountry != null &&
    nextCountry != null &&
    previousCountry !== nextCountry;

  if (countryChanged) {
    await clearStaleAuthSession();
  }

  if (countryObject) {
    await localStorage.setItem("country", countryObject.value);
    await localStorage.setItem("country_id", countryObject.countryID);
    if (countryObject.currencySymbol) {
      await localStorage.setItem(
        "currency_symbol",
        countryObject.currencySymbol
      );
    }
    const minAge = countryObject.minAge;
    await localStorage.setItem("minAge", minAge != null ? String(minAge) : "0");
  } else if (nextCountry) {
    await localStorage.setItem("country", nextCountry);
  }

  return countryChanged;
}

import * as Keychain from "react-native-keychain";

import { localStorage } from "#services";

export const LEGACY_KEYCHAIN_SERVER = "https://usupport.online";
const KEYCHAIN_SERVER_BASE = "https://usupport.online/credentials";

const STORE_ACCESS_CONTROL =
  Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE;
const READ_ACCESS_CONTROL = Keychain.ACCESS_CONTROL.BIOMETRY_ANY;

export function getKeychainServerForCountry(countryId) {
  if (!countryId) return LEGACY_KEYCHAIN_SERVER;
  return `${KEYCHAIN_SERVER_BASE}/${encodeURIComponent(String(countryId))}`;
}

export async function getCurrentCountryId() {
  const countryId = await localStorage.getItem("country_id");
  if (countryId) return countryId;
  return localStorage.getItem("country");
}


function normalizeUsername(username) {
  return String(username).includes("@")
    ? String(username).toLowerCase().trim()
    : String(username).trim();
}

export async function clearSavedCredentialsForCountry(countryId) {
  try {
    await Keychain.resetInternetCredentials({
      server: getKeychainServerForCountry(countryId),
    });
  } catch {}
}

/** Clears saved credentials for the active country plus the legacy slot. */
export async function clearSavedCredentials() {
  const countryId = await getCurrentCountryId();
  await clearSavedCredentialsForCountry(countryId);
  try {
    await Keychain.resetInternetCredentials({
      server: LEGACY_KEYCHAIN_SERVER,
    });
  } catch {}
}

export async function hasSavedCredentialsForCountry(countryId) {
  const server = getKeychainServerForCountry(countryId);
  try {
    if (await Keychain.hasInternetCredentials({ server })) return true;
    if (server !== LEGACY_KEYCHAIN_SERVER) {
      return await Keychain.hasInternetCredentials({
        server: LEGACY_KEYCHAIN_SERVER,
      });
    }
  } catch {}
  return false;
}

export async function hasSavedCredentialsForCurrentCountry() {
  return hasSavedCredentialsForCountry(await getCurrentCountryId());
}

async function readCredentialsFromServer(server, authenticationPrompt) {
  try {
    const credentials = await Keychain.getInternetCredentials(server, {
      accessControl: READ_ACCESS_CONTROL,
      authenticationPrompt,
    });
    if (credentials && credentials !== false) {
      return {
        username: credentials.username,
        password: credentials.password,
      };
    }
  } catch {}
  return null;
}

async function writeCredentialsToServer(
  server,
  username,
  password,
  authenticationPrompt
) {
  await Keychain.setInternetCredentials(
    server,
    normalizeUsername(username),
    password,
    {
      accessControl: STORE_ACCESS_CONTROL,
      authenticationPrompt,
    }
  );
}

export async function saveCredentialsForCountry({
  countryId,
  username,
  password,
  authenticationPrompt,
}) {
  const server = getKeychainServerForCountry(countryId);
  await writeCredentialsToServer(
    server,
    username,
    password,
    authenticationPrompt
  );

  if (server !== LEGACY_KEYCHAIN_SERVER) {
    try {
      await Keychain.resetInternetCredentials({
        server: LEGACY_KEYCHAIN_SERVER,
      });
    } catch {}
  }
}

export async function saveCredentialsForCurrentCountry({
  username,
  password,
  authenticationPrompt,
}) {
  return saveCredentialsForCountry({
    countryId: await getCurrentCountryId(),
    username,
    password,
    authenticationPrompt,
  });
}

export async function getSavedCredentialsForCountry({
  countryId,
  authenticationPrompt,
}) {
  const server = getKeychainServerForCountry(countryId);
  let credentials = await readCredentialsFromServer(server, authenticationPrompt);

  if (!credentials && server !== LEGACY_KEYCHAIN_SERVER) {
    credentials = await readCredentialsFromServer(
      LEGACY_KEYCHAIN_SERVER,
      authenticationPrompt
    );
    if (credentials) {
      await writeCredentialsToServer(
        server,
        credentials.username,
        credentials.password,
        authenticationPrompt
      );
      try {
        await Keychain.resetInternetCredentials({
          server: LEGACY_KEYCHAIN_SERVER,
        });
      } catch {}
    }
  }

  return credentials;
}

export async function getSavedCredentialsForCurrentCountry(
  authenticationPrompt
) {
  return getSavedCredentialsForCountry({
    countryId: await getCurrentCountryId(),
    authenticationPrompt,
  });
}

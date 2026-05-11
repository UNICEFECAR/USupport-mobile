import Config from "react-native-config";

/**
 * S3 horizontal logo URL by country and theme (aligned with client-ui Footer / Navbar).
 *
 * @param {object} [options]
 * @param {boolean} [options.isDarkMode=false]
 * @param {boolean} [options.isHighContrast=false]
 * @param {string} [options.countryCode="KZ"]
 * @returns {string}
 */
export function getBrandingLogoUrl({
  isDarkMode = false,
  isHighContrast = false,
  countryCode = "KZ",
} = {}) {
  const raw = Config.AMAZON_S3_BUCKET;
  const bucket =
    typeof raw === "string" ? raw.replace(/\/+$/, "") : raw ? String(raw) : "";
  if (!bucket) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(
        "[getBrandingLogoUrl] AMAZON_S3_BUCKET is empty — set it in .env and rebuild the native app.",
      );
    }
    return "";
  }

  const useLightAssets = !isDarkMode && !isHighContrast;
  const darkSuffix = useLightAssets ? "" : "-dark";

  const country = countryCode;

  if (country && country !== "global") {
    return `${bucket}/logo-horizontal-${country}${darkSuffix}`;
  }

  return `${bucket}/logo-horizontal${darkSuffix}`;
}

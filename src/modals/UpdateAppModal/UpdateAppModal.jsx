import React, { useContext, useEffect, useState } from "react";
import { BackHandler, Linking, Platform, StyleSheet, View } from "react-native";
import DeviceInfo from "react-native-device-info";
import { useTranslation } from "react-i18next";

import { AppText, Backdrop, Icon } from "#components";
import { useCheckAppVersion, useGetTheme } from "#hooks";
import { Context, localStorage } from "#services";
import { appStyles } from "#styles";

const DISMISSED_VERSION_KEY = "dismissed-app-update-version";
// Above the rest of the app's backdrops so a forced update can't be bypassed
const UPDATE_SHEET_LAYER_INDEX = 1100;

const openStore = async (storeUrl) => {
  console.log("openStore", storeUrl);
  // Prefer the native store app, fall back to the web listing
  const nativeUrl =
    Platform.OS === "android"
      ? `market://details?id=${DeviceInfo.getBundleId()}`
      : storeUrl.replace(/^https:\/\//, "itms-apps://");

  try {
    await Linking.openURL(nativeUrl);
  } catch {
    await Linking.openURL(storeUrl);
  }
};

/**
 * UpdateAppModal
 *
 * Bottom sheet prompting the user to update the app from the App Store / Play Store.
 * "optional" updates can be postponed until the next release, "forced" updates block the app.
 *
 * @return {jsx}
 */
export const UpdateAppModal = () => {
  const { t } = useTranslation("modals", { keyPrefix: "update-app" });
  const { isInConsultation } = useContext(Context);
  const { colors, isDarkMode, isHighContrast } = useGetTheme();
  const { data } = useCheckAppVersion();

  // undefined while reading from storage, null when nothing was dismissed
  const [dismissedVersion, setDismissedVersion] = useState();

  useEffect(() => {
    localStorage
      .getItem(DISMISSED_VERSION_KEY)
      .then((value) => setDismissedVersion(value || null));
  }, []);

  const isForced = data?.updateType === "forced";
  const isOptional =
    data?.updateType === "optional" &&
    dismissedVersion !== undefined &&
    dismissedVersion !== data.latestVersion;

  const isOpen = !isInConsultation && (isForced || isOptional);

  // Forced update: swallow the Android back button so the sheet can't be bypassed
  useEffect(() => {
    if (!isOpen || !isForced) return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );
    return () => subscription.remove();
  }, [isOpen, isForced]);

  const handleUpdate = () => openStore(data.storeUrl);

  const handleLater = () => {
    localStorage.setItem(DISMISSED_VERSION_KEY, data.latestVersion);
    setDismissedVersion(data.latestVersion);
  };

  if (!data || data.updateType === "none") return null;

  const accentColor = isHighContrast
    ? appStyles.colorHighContrast_ffff00
    : isForced
      ? appStyles.colorPrimary_20809e
      : appStyles.colorSecondary_9749fa;

  const notesBackground =
    isDarkMode || isHighContrast ? "rgba(255, 255, 255, 0.06)" : "#f0f1f9";

  return (
    <Backdrop
      isOpen={isOpen}
      onClose={() => {}}
      overlayVariant="auth"
      layerIndex={UPDATE_SHEET_LAYER_INDEX}
      disableOverlayClose={isForced}
      hasHeader={false}
      style={styles.sheet}
      scrollViewStyle={styles.scrollView}
      ctaLabel={t("update_button")}
      ctaHandleClick={handleUpdate}
      secondaryCtaLabel={isForced ? undefined : t("later_button")}
      secondaryCtaHandleClick={handleLater}
      secondaryCtaType="ghost"
    >
      <View style={styles.grabber} />

      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: isForced
              ? "rgba(32, 128, 158, 0.12)"
              : "rgba(151, 73, 250, 0.12)",
          },
        ]}
      >
        <Icon
          name={isForced ? "circle-actions-alert-info" : "download"}
          size="lg"
          color={accentColor}
        />
      </View>

      <AppText namedStyle="h3" style={styles.title}>
        {t(isForced ? "heading_forced" : "heading")}
      </AppText>

      <AppText namedStyle="text" style={styles.body}>
        {t(isForced ? "text_forced" : "text", {
          version: data.latestVersion,
        })}
      </AppText>

      {data.releaseNotes ? (
        <View style={[styles.notes, { backgroundColor: notesBackground }]}>
          <AppText
            namedStyle="smallText"
            style={[styles.notesHeading, { color: accentColor }]}
          >
            {t("whats_new")}
          </AppText>
          <AppText namedStyle="text" style={{ color: colors.text }}>
            {data.releaseNotes}
          </AppText>
        </View>
      ) : null}
    </Backdrop>
  );
};

const styles = StyleSheet.create({
  sheet: {
    height: "auto",
    maxHeight: appStyles.screenHeight * 0.85,
    paddingTop: 8,
  },
  scrollView: {
    alignItems: "center",
    paddingHorizontal: 4,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: appStyles.colorGray_ea,
    marginBottom: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
  },
  body: {
    textAlign: "center",
    opacity: 0.85,
    lineHeight: 22,
    marginBottom: 16,
  },
  notes: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  notesHeading: {
    fontFamily: appStyles.fontSemiBold,
    marginBottom: 4,
  },
});

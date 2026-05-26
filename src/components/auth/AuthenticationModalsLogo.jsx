import React, { useContext, useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

import {
  logoHorizontal,
  logoHorizontalDark,
  logoHorizontalRo,
  logoHorizontalRoDark,
} from "#assets";
import { AppText, Icon } from "#components";
import { useGetTheme } from "#hooks";
import { Context, localStorage } from "#services";
import { appStyles } from "#styles";

// Match client-ui `authentication-modal-logo.scss` (`__logo-container`).
const LOGO_STRIP_BG_LIGHT = "#f0f1f9";
const LOGO_STRIP_BG_DARK = "#3d414f";

/**
 * AuthenticationModalsLogo
 */
export function AuthenticationModalsLogo({ onBackPress }) {
  const { t } = useTranslation("blocks", { keyPrefix: "welcome" });
  const { t: tScreen } = useTranslation("screens", { keyPrefix: "screen" });
  const { isDarkMode, isHighContrast } = useGetTheme();

  const { country: contextCountry } = useContext(Context) ?? {};
  const [storedCountry, setStoredCountry] = useState(null);

  useEffect(() => {
    localStorage.getItem("country").then((value) => {
      setStoredCountry(value ?? null);
    });
  }, []);

  useEffect(() => {
    if (!contextCountry) return;
    localStorage.setItem("country", contextCountry);
  }, [contextCountry]);

  const effectiveCountry = contextCountry ?? storedCountry;
  const isRo = effectiveCountry === "RO";
  const useDarkLogo = isDarkMode || isHighContrast;

  const logoSource = isRo
    ? useDarkLogo
      ? logoHorizontalRoDark
      : logoHorizontalRo
    : useDarkLogo
      ? logoHorizontalDark
      : logoHorizontal;

  const logoStripBg = useDarkLogo ? LOGO_STRIP_BG_DARK : LOGO_STRIP_BG_LIGHT;
  const backIconColor = useDarkLogo
    ? appStyles.color_blue_c1d7e0
    : appStyles.colorPrimary_20809e;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.logoContainer, { backgroundColor: logoStripBg }]}>
        <Image
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          source={logoSource}
          style={styles.logo}
        />
      </View>
      {onBackPress ? (
        <View style={styles.headingRow}>
          <View style={styles.headingSide}>
            <TouchableOpacity
              onPress={onBackPress}
              hitSlop={appStyles.hitSlop}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel={tScreen("go_back")}
            >
              <Icon
                name="arrow-chevron-back"
                size="md"
                color={backIconColor}
              />
            </TouchableOpacity>
          </View>
          <AppText namedStyle="h3" style={styles.headingCenteredWithBack}>
            {t("heading")}
          </AppText>
          <View style={styles.headingSide} />
        </View>
      ) : (
        <AppText namedStyle="h3" style={styles.heading}>
          {t("heading")}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
  },
  logoContainer: {
    width: "100%",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  // Match web `max-height: 100px` + `max-width: 25.3rem` (~253 at 10px/rem).
  logo: {
    alignSelf: "center",
    height: 100,
    width: "100%",
    maxWidth: 253,
  },
  heading: {
    marginTop: 32,
    marginBottom: 16,
  },
  headingRow: {
    width: "100%",
    marginTop: 32,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 32,
  },
  headingSide: {
    width: 48,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  backButton: {
    marginLeft: 16,
    justifyContent: "center",
  },
  headingCenteredWithBack: {
    textAlign: "center",
    flex: 1,
    paddingHorizontal: 12,
  },
});

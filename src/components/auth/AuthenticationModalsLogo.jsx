import React, { useContext, useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Config from "react-native-config";

import { AppText, Icon } from "#components";
import { useGetTheme } from "#hooks";
import { Context, localStorage } from "#services";
import { appStyles } from "#styles";

const { AMAZON_S3_BUCKET } = Config;

/**
 * AuthenticationModalsLogo
 */
export function AuthenticationModalsLogo({ onBackPress }) {
  const { t } = useTranslation("blocks", { keyPrefix: "welcome" });
  const { t: tScreen } = useTranslation("screens", { keyPrefix: "screen" });
  const { colors, isDarkMode } = useGetTheme();

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
  const imageUrl = isRo
    ? `${AMAZON_S3_BUCKET}/logo-horizontal-ro`
    : isDarkMode
      ? `${AMAZON_S3_BUCKET}/logo-vertical-dark`
      : `${AMAZON_S3_BUCKET}/logo-horizontal`;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.logoContainer,
          { backgroundColor: isDarkMode ? colors.background : "#f0f1f9" },
        ]}
      >
        <Image
          resizeMode="contain"
          source={{ uri: imageUrl }}
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
                color={appStyles.colorPrimary_20809e}
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
  logo: {
    width: 220,
    height: 90,
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

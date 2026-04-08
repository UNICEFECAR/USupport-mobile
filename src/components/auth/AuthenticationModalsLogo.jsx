import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Config from "react-native-config";

import { AppText, Icon } from "#components";
import { useGetTheme } from "#hooks";
import { appStyles } from "#styles";

const { AMAZON_S3_BUCKET } = Config;

/**
 * Mobile equivalent of client-ui `AuthenticationModalsLogo`.
 * Renders a tinted logo strip + the welcome heading.
 *
 * When `onBackPress` is set (e.g. Login modal), the back chevron is absolutely
 * positioned on the left so the heading can stay centered like the Welcome flow.
 */
export function AuthenticationModalsLogo({ onBackPress }) {
  const { t } = useTranslation("blocks", { keyPrefix: "welcome" });
  const { t: tScreen } = useTranslation("screens", { keyPrefix: "screen" });
  const { isDarkMode } = useGetTheme();

  // Match existing mobile welcome logo selection.
  const imageUrl = isDarkMode
    ? `${AMAZON_S3_BUCKET}/logo-vertical-dark`
    : `${AMAZON_S3_BUCKET}/logo-vertical`;

  return (
    <View style={styles.wrapper}>
      <View style={styles.logoContainer}>
        <Image
          resizeMode="contain"
          source={{ uri: imageUrl }}
          style={styles.logo}
        />
      </View>
      {onBackPress ? (
        <View style={styles.headingRow}>
          <TouchableOpacity
            onPress={onBackPress}
            hitSlop={appStyles.hitSlop}
            style={styles.backButtonAbsolute}
            accessibilityRole="button"
            accessibilityLabel={tScreen("go_back")}
          >
            <Icon
              name="arrow-chevron-back"
              size="md"
              color={appStyles.colorPrimary_20809e}
            />
          </TouchableOpacity>
          <AppText namedStyle="h3" style={styles.headingCenteredWithBack}>
            {t("heading")}
          </AppText>
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
  // web: background #f0f1f9 on the strip
  logoContainer: {
    width: "100%",
    backgroundColor: "#f0f1f9",
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
  // web: margin-top 3.2 spacing
  heading: {
    marginTop: 32,
  },
  headingRow: {
    width: "100%",
    marginTop: 32,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 32,
  },
  backButtonAbsolute: {
    position: "absolute",
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 1,
  },
  headingCenteredWithBack: {
    textAlign: "center",
    width: "100%",
    paddingHorizontal: 48,
  },
});

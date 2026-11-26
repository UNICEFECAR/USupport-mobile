import React, { useContext } from "react";
import { Linking, Platform, StyleSheet, View } from "react-native";
import { Trans, useTranslation } from "react-i18next";

import { AppText, Icon } from "#components";
import { useGetTheme } from "#hooks";
import { Context } from "#services";
import { appStyles } from "#styles";

const callNumber = (number) => {
  const url = Platform.OS === "android" ? `tel:${number}` : `tel://${number}`;
  Linking.openURL(url);
};

const HelplineLink = ({ number, style, children }) => (
  <AppText
    namedStyle="text"
    style={style}
    onPress={() => callNumber(number)}
    accessibilityRole="link"
  >
    {children}
  </AppText>
);

/**
 * Notice that the Poland pilot has ended. Renders only when the
 * selected country is Poland.
 */
export const PolandPilotBanner = ({ style }) => {
  const { t } = useTranslation("blocks");
  const { country } = useContext(Context);
  const { colors, isDarkMode } = useGetTheme();

  if (country?.toUpperCase() !== "PL") return null;

  const linkStyle = [styles.link, { color: colors.text }];

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: isDarkMode
            ? "rgba(140, 144, 235, 0.16)"
            : "rgba(106, 79, 251, 0.08)",
          borderColor: isDarkMode
            ? "rgba(140, 144, 235, 0.35)"
            : "rgba(106, 79, 251, 0.22)",
        },
        style,
      ]}
      accessibilityRole="text"
    >
      <Icon
        name="info"
        size="md"
        color={isDarkMode ? colors.tabUnderlinedBorder : appStyles.colorPurple}
      />
      <View style={styles.copy}>
        <AppText namedStyle="h3" style={{ color: colors.text }}>
          {t("poland-pilot-banner.title")}
        </AppText>
        <AppText
          namedStyle="text"
          style={[styles.body, { color: colors.text }]}
        >
          {t("poland-pilot-banner.body")}
        </AppText>
        <AppText
          namedStyle="text"
          style={[styles.helplines, { color: colors.text }]}
        >
          <Trans
            ns="blocks"
            i18nKey="poland-pilot-banner.helplines"
            parent={AppText}
            components={{
              a1: <HelplineLink number="116123" style={linkStyle} />,
              a2: <HelplineLink number="800702222" style={linkStyle} />,
              a3: <HelplineLink number="116111" style={linkStyle} />,
              a4: <HelplineLink number="112" style={linkStyle} />,
            }}
          />
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  copy: {
    flex: 1,
    gap: 8,
  },
  body: {
    lineHeight: 22,
  },
  helplines: {
    lineHeight: 22,
  },
  link: {
    textDecorationLine: "underline",
    fontFamily: appStyles.fontSemiBold,
  },
});

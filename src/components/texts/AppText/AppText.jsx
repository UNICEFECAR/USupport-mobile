import React from "react";
import { Text, StyleSheet } from "react-native";

import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

export const AppText = ({
  style,
  namedStyle,
  isBold = false,
  isSemibold = false,
  underlined = false,
  black,
  children,
  ...props
}) => {
  const { colors } = useGetTheme();

  return (
    <Text
      style={[
        styles.text,
        styles[namedStyle],
        { color: colors?.text ?? appStyles.colorTextMain_0e202f },
        black && { color: colors.textTertiary },
        isBold && styles.bold,
        isSemibold && styles.semibold,
        underlined && styles.underlined,
        style,
      ]}
      maxFontSizeMultiplier={appStyles.maxFontSizeMultiplier}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    flexWrap: "wrap",
    flexShrink: 1,
    // Color is set dynamically via theme, removed hardcoded color
    fontSize: 16,
    fontFamily: appStyles.fontRegular,
    lineHeight: 24,
  },
  h1: {
    fontSize: 40,
    lineHeight: 48,
    fontFamily: appStyles.fontSemiBold,
    // color: appStyles.colorBlue_3d527b,
  },
  h2: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: appStyles.fontSemiBold,
    // color: appStyles.colorBlue_3d527b,
  },
  h3: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: appStyles.fontSemiBold,
    // color: appStyles.colorBlue_3d527b,
  },
  smallText: {
    fontSize: 12,
    fontFamily: appStyles.fontRegular,
    lineHeight: 18,
  },
  bold: {
    fontFamily: appStyles.fontBold,
  },
  semibold: {
    fontFamily: appStyles.fontSemiBold,
  },
  underlined: { textDecorationLine: "underline" },
});

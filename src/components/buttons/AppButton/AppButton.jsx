import React, { useState } from "react";
import PropTypes from "prop-types";
import { StyleSheet, Pressable, Text } from "react-native";

import { appStyles } from "#styles";
import { Loading } from "../../loaders";
import { useGetTheme } from "#hooks";

/**
 * AppButton
 *
 * Base Button component
 *
 * @return {jsx}
 */
export const AppButton = ({
  type = "primary",
  color = "green",
  size = "md",
  label,
  disabled = false,
  loading = false,
  children,
  style,
  ...props
}) => {
  const { isDarkMode, isHighContrast } = useGetTheme();
  const [isPressed, setIsPressed] = useState(false);

  // In high-contrast keep the requested type; otherwise remap secondary to primary in dark mode
  const btnType = isHighContrast
    ? type
    : type === "secondary" && isDarkMode
      ? "primary"
      : type;

  // Compute text styles (separate from Pressable style callback)
  const textStyles = isHighContrast
    ? (() => {
        const hcTextPrimary = "#ffffff";
        const hcTextSecondary = "#000000";
        const hcDisabledText = "#666666";
        const isDisabledLike = disabled || loading;

        const base = [styles.btnText, size === "lg" && styles.btnTextLg];
        let textColor = hcTextPrimary;
        if (isPressed) {
          textColor = hcTextSecondary;
        }
        if (btnType === "secondary" || btnType === "ghost") {
          textColor = isPressed ? hcTextSecondary : hcTextPrimary;
        }
        if (isDisabledLike) {
          textColor = hcDisabledText;
        }
        base.push({ color: textColor });
        if (btnType === "ghost") {
          base.push({ textDecorationLine: "underline" });
        }
        if (isPressed) base.push(styles.btnTextPressed);
        return base;
      })()
    : [
        styles.btnText,
        size === "lg" && styles.btnTextLg,
        btnType === "secondary" && styles.btnTextSecondary,
        btnType === "secondary" &&
          color === "purple" &&
          styles.btnTextSecondaryPurple,
        btnType === "ghost" && styles.btnTextGhost,
        btnType === "ghost" && color === "purple" && styles.btnTextGhostPurple,
        isPressed && styles.btnTextPressed,
        isPressed &&
          (btnType === "secondary" || btnType === "ghost") &&
          styles[color + "Pressed" + "Text"],
        !isHighContrast &&
          color === "red" &&
          btnType != "primary" &&
          styles.btnTextRed,
      ];

  return (
    <Pressable
      style={({ pressed }) => {
        // High-contrast overrides (black/white scheme with strong borders, no shadows)
        if (isHighContrast) {
          const hcBgPrimary = "#000000";
          const hcTextPrimary = "#ffffff";
          const hcBorderPrimary = "#ffffff";
          const hcBgSecondary = "#ffffff";
          const hcTextSecondary = "#000000";
          const hcDisabledBg = "#333333";
          const hcDisabledText = "#666666";
          const hcDisabledBorder = "#666666";
          const hcBorderWidth = 2;

          const isDisabledLike = disabled || loading;

          // Base container style in HC
          const baseHC = [
            styles.btn,
            styles[size],
            {
              // Remove shadows/elevation in HC
              shadowColor: "transparent",
              elevation: 0,
              backgroundColor:
                btnType === "secondary" || btnType === "ghost"
                  ? "transparent"
                  : hcBgPrimary,
              borderColor:
                btnType === "ghost" ? "transparent" : hcBorderPrimary,
              borderWidth: btnType === "ghost" ? 0 : hcBorderWidth,
            },
          ];

          // Pressed/active feedback: invert to white bg/black text
          if (pressed && !isDisabledLike) {
            baseHC.push({
              backgroundColor: hcBgSecondary,
              borderColor: hcTextSecondary,
            });
          }

          // Ghost pressed gets white bg as well
          if (btnType === "ghost" && pressed && !isDisabledLike) {
            baseHC.push({
              backgroundColor: hcBgSecondary,
              borderColor: "transparent",
              borderWidth: 0,
            });
          }

          // Disabled state colors
          if (isDisabledLike) {
            baseHC.push({
              backgroundColor:
                btnType === "secondary" || btnType === "ghost"
                  ? "transparent"
                  : hcDisabledBg,
              borderColor:
                btnType === "ghost" ? "transparent" : hcDisabledBorder,
              borderWidth: btnType === "ghost" ? 0 : hcBorderWidth,
              opacity: 1,
            });
          }

          return [...baseHC, style];
        }

        return [
          btnType === "ghost"
            ? {}
            : btnType === "secondary"
              ? appStyles.shadow2
              : appStyles.shadow1,
          styles.btn,
          styles[color],
          styles[btnType],
          styles[size],
          disabled && styles.disabled,
          pressed && styles[color + "Pressed" + btnType],
          style,
        ];
      }}
      disabled={disabled || loading}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      {...props}
    >
      {children}

      {loading ? (
        <Loading style={{ width: 23, height: 23 }} />
      ) : (
        <Text
          style={textStyles}
          maxFontSizeMultiplier={appStyles.maxFontSizeMultiplier}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
};

// define your styles
const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: appStyles.colorPrimary_20809e,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },

  disabled: {
    opacity: 0.6,
  },

  //Pressed states:
  greenPressedprimary: {
    backgroundColor: appStyles.colorPrimaryPressed_0c5f7a,
  },

  purplePressedprimary: {
    backgroundColor: appStyles.colorSecondaryPressed_7f2ee5,
  },

  greenPressedsecondary: {
    borderColor: appStyles.colorPrimaryPressed_0c5f7a,
  },

  purplePressedsecondary: {
    borderWidth: 1,
    borderColor: appStyles.colorSecondaryPressed_7f2ee5,
  },

  //Types:
  secondary: {
    backgroundColor: appStyles.colorWhite_ff,
  },

  ghost: {
    backgroundColor: "transparent",
  },

  //Color:
  purple: { backgroundColor: appStyles.colorSecondary_9749fa },

  red: { backgroundColor: appStyles.colorRed_eb5757 },

  //Size:
  sm: {
    maxWidth: 148,
  },

  md: {
    minWidth: 168,
  },

  lg: {
    minWidth: "96%",
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 40,
  },

  //Text styling:
  btnText: {
    fontFamily: appStyles.fontBold,
    fontSize: 12,
    color: appStyles.colorWhite_ff,
    lineHeight: 22,
  },

  btnTextLg: {
    fontSize: 16,
    fontFamily: appStyles.fontSemiBold,
  },

  btnTextSecondary: {
    color: appStyles.colorPrimary_20809e,
  },

  btnTextSecondaryPurple: {
    color: appStyles.colorSecondary_9749fa,
  },

  btnTextGhost: {
    color: appStyles.colorPrimary_20809e,
  },

  btnTextGhostPurple: {
    color: appStyles.colorSecondary_9749fa,
  },

  btnTextPressed: {
    fontFamily: appStyles.fontExtraBold,
  },

  greenPressedText: {
    color: appStyles.colorPrimaryPressed_0c5f7a,
  },

  purplePressedText: {
    color: appStyles.colorSecondaryPressed_7f2ee5,
  },

  btnTextRed: {
    color: appStyles.colorRed_eb5757,
  },
});

AppButton.propTypes = {
  /**
   * Button type
   * @default: primary
   **/
  type: PropTypes.oneOf(["primary", "secondary", "ghost"]),

  /**
   * Button color
   * @default: green
   **/
  color: PropTypes.oneOf(["green", "purple", "red"]),

  /**
   * Button size
   * @default: md
   * */
  size: PropTypes.oneOf(["sm", "md", "lg"]),

  /**
   *Label to render in the Button component
   * */
  label: PropTypes.string,

  /**
   * Disables the button
   * @default: false
   * */
  disabled: PropTypes.bool,

  /**
   * Additional styles for the component
   * */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

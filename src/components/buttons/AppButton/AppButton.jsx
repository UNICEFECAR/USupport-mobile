import React, { useState } from "react";
import PropTypes from "prop-types";
import { StyleSheet, Pressable, Text } from "react-native";

import { appStyles } from "#styles";
import { Loading } from "../../loaders";

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
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      style={({ pressed }) => {
        return [
          type === "ghost"
            ? {}
            : type === "secondary"
            ? appStyles.shadow2
            : appStyles.shadow1,
          styles.btn,
          styles[color],
          styles[type],
          styles[size],
          disabled && styles.disabled,
          pressed && styles[color + "Pressed" + type],
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
          style={[
            styles.btnText,
            size === "lg" && styles.btnTextLg,
            type === "secondary" && styles.btnTextSecondary,
            type === "secondary" &&
              color === "purple" &&
              styles.btnTextSecondaryPurple,
            type === "ghost" && styles.btnTextGhost,
            type === "ghost" && color === "purple" && styles.btnTextGhostPurple,
            isPressed && styles.btnTextPressed,
            isPressed &&
              (type === "secondary" || type === "ghost") &&
              styles[color + "Pressed" + "Text"],
            color === "red" && type != "primary" && styles.btnTextRed,
          ]}
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
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: appStyles.colorWhite_ff,
    lineHeight: 22,
  },

  btnTextLg: {
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
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
    fontFamily: "Nunito_800ExtraBold",
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

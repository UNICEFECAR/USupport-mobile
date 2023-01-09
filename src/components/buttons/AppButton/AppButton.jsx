import React from "react";
import { StyleSheet, Pressable, Text } from "react-native";

import { appStyles } from "#styles";

export const AppButton = ({
  style,
  type = "primary",
  color = "green",
  size,
  label,
  disabled = false,
  children,
  ...props
}) => {
  return (
    <Pressable
      style={({ pressed }) => {
        return [
          styles.btn,
          styles[color],
          styles[type],
          styles[size],
          disabled && styles.disabled,
          pressed && styles[color + "Pressed" + type],
          style,
        ];
      }}
      disabled={disabled}
      {...props}
    >
      {children}
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
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

// define your styles
const styles = StyleSheet.create({
  btn: {
    minWidth: 168,
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: appStyles.colorPrimary_20809e,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },

  disabled: {
    opacity: 0.4,
  },

  //Pressed states:
  greenPressedprimary: {
    backgroundColor: appStyles.colorPrimaryPressed_0c5f7a,
  },

  purplePressedprimary: {
    backgroundColor: appStyles.colorSecondaryPressed_7f2ee5,
  },

  greenPressedsecondary: {
    borderWidth: 1,
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
  purple: {
    backgroundColor: appStyles.colorSecondary_9749fa,
  },

  //Size:
  sm: {
    minWidth: 148,
  },

  lg: {
    minWidth: "100%",
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
});

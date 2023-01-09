import React from "react";
import { StyleSheet, Pressable } from "react-native";
import { Icon } from "#components";

import { appStyles } from "#styles";

export const ButtonOnlyIcon = ({
  iconName = "phone-emergency",
  iconSize = "xl",
  style,
  ...rest
}) => {
  return (
    <Pressable
      style={({ pressed }) => {
        return [style, styles.btn, pressed && styles.pressed];
      }}
      {...rest}
    >
      <Icon name={iconName} size={iconSize} color={appStyles.colorWhite_ff} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: appStyles.colorSecondary_9749fa,
    borderRadius: 100,
  },
  pressed: {
    backgroundColor: appStyles.colorSecondaryPressed_6c16d9,
  },
});

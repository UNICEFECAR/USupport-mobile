import React from "react";
import { StyleSheet } from "react-native";
import { AppButton, Icon } from "#components";

import { appStyles } from "#styles";

export const ButtonWithIcon = ({ iconName, ...props }) => {
  return (
    <AppButton style={styles.btn} {...props}>
      <Icon name={iconName} size={"md"} color={appStyles.colorWhite_ff} />
    </AppButton>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 11,
    paddingVertical: 2,
    minWidth: 88,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

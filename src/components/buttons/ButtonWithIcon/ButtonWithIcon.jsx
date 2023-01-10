import React from "react";
import { PropTypes } from "prop-types";
import { StyleSheet } from "react-native";
import { AppButton, Icon } from "#components";

import { appStyles } from "#styles";

/**
 * ButtonWithIcon
 *
 * Button with icon component
 *
 * @return {jsx}
 */
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

ButtonWithIcon.PropTypes = {
  /**
   * Icon name
   *  */
  iconName: PropTypes.string.isRequired,

  /**
   * Additional props to pass
   * */
  props: PropTypes.object,
};

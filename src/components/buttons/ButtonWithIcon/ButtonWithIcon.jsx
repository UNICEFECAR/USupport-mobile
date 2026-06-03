import React from "react";
import { PropTypes } from "prop-types";
import { StyleSheet } from "react-native";
import { Icon } from "../../icons/Icon";
import { AppButton } from "../AppButton";

import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

/**
 * ButtonWithIcon
 *
 * Button with icon component
 *
 * @return {jsx}
 */
export const ButtonWithIcon = ({
  iconName,
  iconColor = appStyles.colorWhite_ff,
  iconSize = "md",
  color,
  style,
  ...props
}) => {
  const { isHighContrast } = useGetTheme();
  const resolvedIconColor =
    isHighContrast && color === "red"
      ? appStyles.colorWhite_ff
      : iconColor;

  return (
    <AppButton style={[styles.btn, style]} color={color} {...props}>
      <Icon
        name={iconName}
        size={iconSize}
        color={resolvedIconColor}
        style={styles.icon}
      />
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
  },

  icon: {
    marginRight: 8,
  },
});

ButtonWithIcon.propTypes = {
  /**
   * Icon name
   *  */
  iconName: PropTypes.string.isRequired,

  /**
   * Icon color
   * @default appStyles.colorWhite_ff
   * */
  iconColor: PropTypes.string,

  /**
   * Icon size
   * @default "md"
   * */
  iconSize: PropTypes.string,

  /**
   * Additional props to pass
   * */
  props: PropTypes.object,
};

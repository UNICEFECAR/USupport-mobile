import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, Pressable } from "react-native";
import { Icon } from "../../icons/Icon";

import { appStyles } from "#styles";

/**
 * ButtonOnlyIcon
 *
 * Button only with icon
 *
 * @return {jsx}
 */
export const ButtonOnlyIcon = ({
  iconName = "phone-emergency",
  iconSize = "xl",
  color = "purple",
  style,
  iconColor = appStyles.colorWhite_ff,
  ...props
}) => {
  return (
    <Pressable
      style={({ pressed }) => {
        return [
          styles.btn,
          pressed && styles.pressed,
          color === "red"
            ? styles.red
            : color === "transparent"
              ? styles.transparent
              : styles.purple,
          color === "red" ? styles.redShadow : appStyles.shadow1,
          styles.fabBase,
          pressed && styles.fabPressed,
          style,
        ];
      }}
      {...props}
    >
      <Icon name={iconName} size={iconSize} color={iconColor} />
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
  fabBase: {
    opacity: 0.9,
  },
  fabPressed: {
    opacity: 1,
  },
  pressed: {
    backgroundColor: appStyles.colorSecondaryPressed_6c16d9,
  },
  purple: {
    backgroundColor: appStyles.colorSecondary_9749fa,
  },
  red: {
    backgroundColor: appStyles.colorRed_eb5757,
  },
  redShadow: {
    shadowColor: appStyles.colorRed_eb5757,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  transparent: {
    backgroundColor: "transparent",
  },
});

ButtonOnlyIcon.propTypes = {
  /**
   * Icon name
   * @default: "phone-emergency"
   */
  iconName: PropTypes.string,

  /**
   * Icon size
   * @default: "xl"
   **/
  iconSize: PropTypes.oneOf(["sm", "md", "lg", "xl"]),

  /**
   * Additional styles to pass
   * */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

  /**
   * Button color
   * @default: "purple"
   * */
  color: PropTypes.oneOf(["purple", "red"]),

  /**
   * Additional props to pass
   **/
  props: PropTypes.object,
};

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
  ...props
}) => {
  return (
    <Pressable
      style={({ pressed }) => {
        return [
          appStyles.shadow1,
          styles.btn,
          pressed && styles.pressed,
          color === "red" ? styles.red : styles.purple,
          style,
        ];
      }}
      {...props}
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
  purple: {
    backgroundColor: appStyles.colorSecondary_9749fa,
  },
  red: {
    backgroundColor: appStyles.colorRed_eb5757,
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

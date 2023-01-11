import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View } from "react-native";

import { appStyles } from "#styles";

/**
 * Box
 *
 * A base box component that will be used as a wrapper
 *
 * @return {jsx}
 */
export const Box = ({
  borderRadius = "sm",
  boxShadow = 1,
  children,
  style,
  ...props
}) => {
  return (
    <View
      style={[
        style,
        appStyles[`shadow${boxShadow}`],
        styles.box,
        styles[borderRadius + "Border"],
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: appStyles.colorWhite_ff,
    borderWidth: 1,
    borderColor: "transparent",
  },

  xsBorder: {
    borderRadius: 16,
  },
  smBorder: {
    borderRadius: 24,
  },
  mdBorder: {
    borderRadius: 32,
  },
  lgBorder: {
    borderRadius: 48,
  },
});

Box.propTypes = {
  /**
   * Border radius of the box
   */
  borderRadius: PropTypes.oneOf(["xs", "sm", "md", "lg"]),

  /**
   * Box shadow of the box
   * */
  boxShadow: PropTypes.oneOf([1, 2, 3, 4]),

  /**
   * Children to pass to the component
   * */
  children: PropTypes.node,

  /**
   * Additional styles to pass to the component
   * */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

  /**
   * Additional props to pass to the component
   * */
  props: PropTypes.object,
};

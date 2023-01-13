import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View } from "react-native";

export const Block = ({ children, style }) => {
  return <View style={[styles.block, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  block: {
    paddingHorizontal: 16,
  },
});

Block.propTypes = {
  /**
   * The content of the component.
   * */
  children: PropTypes.node,

  /**
   * Additional styles for the block
   * */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

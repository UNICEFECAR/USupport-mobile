import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, Text } from "react-native";

import { appStyles } from "#styles";

/**
 * Error
 *
 * Error message
 *
 * @return {jsx}
 */
export const Error = ({ message, style }) => {
  return (
    <Text namedStyle="smallText" style={[styles.text, style]}>
      {message}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    color: appStyles.colorRed_eb5757,
    textAlign: "left",
    marginLeft: 20,
    marginTop: 4,
  },
});

Error.propTypes = {
  /**
   * Error message
   * */
  message: PropTypes.string.isRequired,

  /**
   * Additional styles to pass to the component
   * */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

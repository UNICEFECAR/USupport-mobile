import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View } from "react-native";

import { appStyles } from "#styles";

/**
 * Line
 *
 * Line separator component
 *
 * @return {jsx}
 */
export const Line = ({ style }) => {
  return (
    <View>
      <View style={[styles.lineSeparator, style]} />
    </View>
  );
};

const styles = StyleSheet.create({
  lineSeparator: {
    height: 1,
    width: "100%",
    marginVertical: 10,
    backgroundColor: appStyles.colorGray_a6b4b8,
  },
});

Line.propTypes = {
  /**
   * Style to pass to the component
   **/
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

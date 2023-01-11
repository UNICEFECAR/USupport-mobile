import React from "react";
import { StyleSheet } from "react-native";
import PropTypes from "prop-types";
import { Box } from "../../boxes";
import { CheckBox } from "../CheckBox/CheckBox";

/**
 * CheckBoxSelector
 *
 * CheckBoxSelector component
 *
 * @return {jsx}
 */
export const CheckBoxSelector = ({ style, ...props }) => {
  return (
    <Box style={[style, styles.checkBoxSelector]} boxShadow={2}>
      <CheckBox {...props} />
    </Box>
  );
};

const styles = StyleSheet.create({
  checkBoxSelector: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: 343,
  },
});

CheckBoxSelector.propTypes = {
  /**
   * Additional styles to pass to the component
   * */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

  /**
   * Additional props to pass to the component
   * */
  props: PropTypes.object,
};

import React from "react";
import { StyleSheet } from "react-native";
import PropTypes from "prop-types";
import { Box } from "../../boxes";
import { RadioButton } from "../RadioButton/RadioButton";
import { useGetTheme } from "#hooks";

/**
 * RadioButtonSelector
 *
 * RadioButtonSelector component
 *
 * @return {jsx}
 */
export const RadioButtonSelector = ({ style, ...props }) => {
  const { colors } = useGetTheme();

  return (
    <Box
      style={[
        style,
        styles.radioButtonSelector,
        { backgroundColor: colors.input },
      ]}
      boxShadow={2}
    >
      <RadioButton {...props} />
    </Box>
  );
};

const styles = StyleSheet.create({
  radioButtonSelector: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "97%",
    alignSelf: "center",
  },
});

RadioButtonSelector.propTypes = {
  /**
   * Additional styles to pass to the component
   * */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

  /**
   * Additional props to pass to the RadioButton component
   * */
  props: PropTypes.object,
};

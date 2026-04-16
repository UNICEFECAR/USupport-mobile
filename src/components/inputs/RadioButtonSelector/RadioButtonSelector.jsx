import React from "react";
import { StyleSheet } from "react-native";
import PropTypes from "prop-types";
import { Box } from "../../boxes";
import { RadioButton } from "../RadioButton/RadioButton";
import { useGetTheme } from "#hooks";
import { appStyles } from "#styles";

/**
 * RadioButtonSelector
 *
 * RadioButtonSelector component
 *
 * @return {jsx}
 */
export const RadioButtonSelector = ({ style, size, disabled, ...props }) => {
  const { colors, isHighContrast } = useGetTheme();
  const isSelected = Boolean(props.isChecked);

  return (
    <Box
      style={[
        style,
        styles.radioButtonSelector,
        size === "sm" && styles.radioButtonSelectorSm,
        size === "lg" && styles.radioButtonSelectorLg,
        {
          backgroundColor: colors.input,
          borderColor:
            isSelected && isHighContrast
              ? appStyles.colorHighContrast_ffff00
              : isSelected
                ? appStyles.colorSecondary_9749fa
                : colors.inputBorder || appStyles.colorGray_cdd8e1,
        },
        disabled && styles.radioButtonSelectorDisabled,
      ]}
      boxShadow={2}
    >
      <RadioButton disabled={disabled} {...props} />
    </Box>
  );
};

const styles = StyleSheet.create({
  radioButtonSelector: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "97%",
    alignSelf: "center",
    borderRadius: 12,
    borderWidth: 1,
  },
  radioButtonSelectorDisabled: {
    opacity: 0.4,
  },
  radioButtonSelectorSm: {
    maxWidth: 279, // web: calc(31.1rem - 2 * 1.6rem) ~= 279px
  },
  radioButtonSelectorLg: {
    maxWidth: 311, // web: calc(34.3rem - 2 * 1.6rem) ~= 311px
  },
});

RadioButtonSelector.propTypes = {
  /**
   * Additional styles to pass to the component
   * */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

  /**
   * Size of the radio button selector
   * @default "md"
   * */
  size: PropTypes.oneOf(["sm", "md", "lg"]),

  /**
   * If the radio button selector is disabled
   * @default false
   * */
  disabled: PropTypes.bool,

  /**
   * Additional props to pass to the RadioButton component
   * */
  props: PropTypes.object,
};

RadioButtonSelector.defaultProps = {
  size: "md",
  disabled: false,
};

import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View, Text } from "react-native";
import { CheckBox } from "../CheckBox/CheckBox";

import { appStyles } from "#styles";

/**
 * CheckBoxGroup
 *
 * CheckBoxGroup component
 *
 * @return {jsx}
 */
export const CheckBoxGroup = ({ label, options, setOptions, style }) => {
  const handleSelect = (value) => {
    let newOptions = [...options];
    console.log(value);

    newOptions = newOptions.map((option) => {
      if (option.value === value) {
        option.isSelected = !option.isSelected;
      }
      return option;
    });

    setOptions(newOptions);
  };

  const renderAllOptions = () => {
    return (
      options &&
      options.map((option, index) => {
        return (
          <CheckBox
            isChecked={option.isSelected}
            setIsChecked={() => handleSelect(option.value)}
            label={option.label}
            disabled={option.isDisabled}
            key={index}
          />
        );
      })
    );
  };

  return (
    <View style={[styles.checkBoxGroup, style]}>
      {label && (
        <Text namedStyle="text" style={styles.text}>
          {label}
        </Text>
      )}
      <View style={styles.optionsContainer}>{renderAllOptions()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  checkBoxGroup: {},

  text: {
    color: appStyles.colorBlue_3d527b,
  },

  optionsContainer: {
    flexDirection: "column",
    marginTop: 12,
  },
});

CheckBoxGroup.propTypes = {
  /**
   * Label
   * */
  label: PropTypes.string,

  /**
   * Options
   * */
  options: PropTypes.arrayOf(PropTypes.object),

  /**
   * Set options
   * */
  setOptions: PropTypes.func,

  /**
   * Additonal styles to pass to the group
   * */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

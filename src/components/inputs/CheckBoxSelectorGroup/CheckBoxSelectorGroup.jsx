import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View, Text } from "react-native";
import { CheckBoxSelector } from "../CheckBoxSelector/CheckBoxSelector";

import { appStyles } from "#styles";

/**
 * CheckBoxSelectorGroup
 *
 * CheckBoxSelectorGroup component
 *
 * @return {jsx}
 */
export const CheckBoxSelectorGroup = ({
  label,
  options,
  setOptions,
  style,
}) => {
  const handleSelect = (value) => {
    let newOptions = [...options];

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
          <CheckBoxSelector
            isChecked={option.isSelected}
            setIsChecked={() => handleSelect(option.value)}
            label={option.label}
            style={[
              styles.checkBoxSelector,
              index === 0 && styles.checkBoxSelectorFirst,
            ]}
            disabled={option.isDisabled}
            key={index}
          />
        );
      })
    );
  };

  return (
    <View style={[styles.checkBoxSelectorGroup, style]}>
      {label && (
        <Text namedStyle="text" style={styles.text}>
          {label}
        </Text>
      )}
      {renderAllOptions()}
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    color: appStyles.colorBlue_3d527b,
    marginBottom: 4,
  },

  checkBoxSelector: {
    marginTop: 20,
  },

  checkBoxSelectorFirst: {
    marginTop: 0,
  },
});

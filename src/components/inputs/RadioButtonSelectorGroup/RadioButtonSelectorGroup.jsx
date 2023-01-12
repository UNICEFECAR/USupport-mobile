import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View, Text } from "react-native";
import { RadioButtonSelector } from "../RadioButtonSelector/RadioButtonSelector";

import { appStyles } from "#styles";

/**
 * RadioButtonSelectorGroup
 *
 * RadioButtonSelectorGroup component
 *
 * @return {jsx}
 */
export const RadioButtonSelectorGroup = ({
  label,
  selected,
  setSelected,
  options,
  style,
}) => {
  const renderAllOptions = () => {
    return options.map((option, index) => {
      return (
        <RadioButtonSelector
          label={option.label}
          isChecked={selected === option.value}
          setIsChecked={() => {
            setSelected(option.value);
          }}
          disabled={option.isDisabled}
          style={[
            styles.radioButtonSelector,
            index === 0 && styles.radioButtonSelectorFirst,
          ]}
          key={index}
        />
      );
    });
  };

  return (
    <View style={[style]}>
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

  radioButtonSelector: {
    marginTop: 20,
  },

  radioButtonSelectorFirst: {
    marginTop: 0,
  },
});

RadioButtonSelectorGroup.propTypes = {
  /**
   * Label for the group
   * */
  label: PropTypes.string,

  /**
   * Selected value
   * */
  selected: PropTypes.string,

  /**
   *  Function to set the selected value
   * */
  setSelected: PropTypes.func,

  /**
   * Array of options
   * */
  options: PropTypes.array,

  /**
   * Additional styles to pass to the component
   * */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

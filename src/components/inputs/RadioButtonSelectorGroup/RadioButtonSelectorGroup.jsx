import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View } from "react-native";
import { RadioButtonSelector } from "../RadioButtonSelector/RadioButtonSelector";
import { AppText } from "../../texts/AppText/AppText";

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
    <View style={[style, styles.container]}>
      {label && (
        <AppText namedStyle="text" style={styles.text}>
          {label}
        </AppText>
      )}
      {renderAllOptions()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "96%", backgroundColor: "gold" },

  text: {
    color: appStyles.colorBlue_3d527b,
    marginBottom: 4,
    fontFamily: "Nunito_600SemiBold",
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
  selected: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

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

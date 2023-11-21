import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View } from "react-native";

import { CheckBox } from "../CheckBox/CheckBox";
import { AppText } from "../../texts/AppText/AppText";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

/**
 * CheckBoxGroup
 *
 * CheckBoxGroup component
 *
 * @return {jsx}
 */
export const CheckBoxGroup = ({ label, options, setOptions, style }) => {
  const { colors } = useGetTheme();

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
          <CheckBox
            isChecked={option.isSelected}
            setIsChecked={() => handleSelect(option.value)}
            label={option.label}
            disabled={option.isDisabled}
            key={index}
            style={styles.option}
          />
        );
      })
    );
  };

  return (
    <View style={[styles.checkBoxGroup, style]}>
      {label && (
        <AppText
          namedStyle="text"
          style={[styles.text, { color: colors.text }]}
        >
          {label}
        </AppText>
      )}
      <View style={styles.optionsContainer}>{renderAllOptions()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  checkBoxGroup: {},
  text: {
    color: appStyles.colorBlue_3d527b,
    fontFamily: appStyles.fontSemiBold,
  },
  optionsContainer: {
    flexDirection: "column",
  },
  option: { marginTop: 12 },
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

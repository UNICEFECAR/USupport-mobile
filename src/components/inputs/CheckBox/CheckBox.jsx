import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { Icon } from "../../icons/Icon";
import { AppText } from "../../texts/AppText/AppText";

import { appStyles } from "#styles";

/**
 * CheckBox
 *
 * CheckBox component
 *
 * @return {jsx}
 */
export const CheckBox = ({
  isChecked,
  setIsChecked,
  label,
  disabled = false,
  style,
  ...props
}) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => setIsChecked()}
      hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }}
      disabled={disabled}
      {...props}
    >
      <View
        style={[
          styles.checkboxWrapper,
          disabled && styles.checkboxWrapperDisabled,
          style,
        ]}
      >
        <View style={[styles.checkbox, isChecked && styles.checked, ,]}>
          {isChecked && (
            <Icon
              name="checkbox-check"
              size="sm"
              color={appStyles.colorWhite_ff}
            />
          )}
        </View>
        {label && (
          <AppText namedStyle="text" style={[isChecked && styles.textChecked]}>
            {label}
          </AppText>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  checkboxWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxWrapperDisabled: {
    opacity: 0.4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderColor: appStyles.colorGray_92989b,
    borderWidth: 1.5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    paddingHorizontal: 3,
    paddingVertical: 5,
    marginRight: 8,
  },

  checked: {
    backgroundColor: appStyles.colorSecondary_9749fa,
    borderColor: appStyles.colorSecondary_9749fa,
  },

  textChecked: {
    color: appStyles.colorBlue_3d527b,
    fontFamily: "Nunito_600SemiBold",
  },
});

CheckBox.propTypes = {
  /**
   * Is the checkbox checked
   **/
  isChecked: PropTypes.bool,

  /**
   * Function to set the checkbox checked state
   **/
  setIsChecked: PropTypes.func,

  /**
   * Label for the checkbox if needed
   **/
  label: PropTypes.string,

  /**
   * If the checkbox is disabled
   *
   **/
  disabled: PropTypes.bool,

  /**
   * Additional classes to add to the checkbox wrapper
   * */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

  /**
   * Additional props to pass to the checkbox
   **/
  props: PropTypes.object,
};

import React from "react";
import { StyleSheet, TouchableWithoutFeedback, View, Text } from "react-native";
import { Icon } from "#components";

import { appStyles } from "#styles";

export const CheckBox = ({
  isChecked,
  setIsChecked,
  label,
  style,
  disabled = false,
  ...props
}) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => setIsChecked(!isChecked)}
      hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }}
      disabled={disabled}
      {...props}
    >
      <View
        style={[
          styles.checkboxWrapper,
          disabled && styles.checkboxWrapperDisabled,
        ]}
      >
        <View style={[styles.checkbox, style, isChecked && styles.checked]}>
          {isChecked && (
            <Icon
              name="checkbox-check"
              size="sm"
              color={appStyles.colorWhite_ff}
            />
          )}
        </View>
        {label && (
          <Text style={[styles.text, isChecked && styles.textChecked]}>
            {label}
          </Text>
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

  text: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Nunito_400Regular",
    color: appStyles.colorGray_66768d,
  },

  textChecked: {
    color: appStyles.colorBlue_3d527b,
  },
});

import React from "react";
import { StyleSheet, TouchableWithoutFeedback, View, Text } from "react-native";

import { appStyles } from "#styles";

export const RadioButton = ({
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
          styles.radioButtonWrapper,
          disabled && styles.radioButtonWrapperDisabled,
        ]}
      >
        <View style={[styles.radioButton, style, isChecked && styles.checked]}>
          {isChecked && <View style={styles.radio} />}
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
  radioButtonWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },

  radioButtonWrapperDisabled: {
    opacity: 0.4,
  },

  radioButton: {
    width: 20,
    height: 20,
    borderColor: appStyles.colorGray_92989b,
    borderWidth: 1.5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 3,
    paddingVertical: 5,
    marginRight: 8,
  },

  checked: {
    borderColor: appStyles.colorSecondary_9749fa,
  },

  radio: {
    width: 8,
    height: 8,
    backgroundColor: appStyles.colorSecondary_9749fa,
    borderRadius: 4,
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

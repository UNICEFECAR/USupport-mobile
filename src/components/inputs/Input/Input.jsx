import React, { useState } from "react";
import PropTypes from "prop-types";
import { StyleSheet, TextInput, View, Text } from "react-native";
import { Error } from "../../errors/Error";

import { appStyles } from "#styles";

/**
 * Input
 *
 * Base Text input component
 *
 * @return {jsx}
 */
export const Input = ({
  label,
  disabled = false,
  errorMessage,
  isPassword = false,
  preInput,
  children,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.inputWrapper,
        disabled && styles.inputWrapperDisabled,
        style,
      ]}
    >
      {label && (
        <Text namedStyle="text" style={styles.label}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.input,
          appStyles.shadow2,
          errorMessage && styles.inputError,
          isFocused && styles.inputFocused,
        ]}
      >
        {preInput && preInput}
        <TextInput
          style={styles.textInput}
          {...props}
          editable={!disabled}
          selectTextOnFocus={!disabled}
          secureTextEntry={isPassword}
          placeholderTextColor={appStyles.colorGray_92989b}
          autoCorrect={false}
          autoCapitalize={false}
          autoComplete={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {children && children}
      </View>
      {errorMessage && !disabled && <Error message={errorMessage} />}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    width: 343,
    height: 50,
    display: "flex",
    textAlign: "left",
  },

  inputWrapperDisabled: {
    opacity: 0.4,
  },

  input: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: appStyles.colorWhite_ff,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 53,
    width: "100%",
    marginTop: 4,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },

  inputFocused: {
    borderColor: appStyles.colorSecondary_9749fa,
  },

  inputError: {
    borderColor: appStyles.colorRed_eb5757,
  },

  textInput: {
    width: "95%",
    height: 24,
    color: appStyles.colorBlack_37,
  },

  label: {
    color: appStyles.colorBlue_3d527b,
    fontFamily: "Nunito_600SemiBold",
  },
});

Input.propTypes = {
  /**
   * Label if needed
   **/
  label: PropTypes.string,

  /**
   * Is the input disabled
   * @default false
   * */
  disabled: PropTypes.bool,

  /**
   * Error message
   * */
  errorMessage: PropTypes.string,

  /**
   * Is the input a password
   * @default false
   * */
  isPassword: PropTypes.bool,

  /**
   * Pre input component
   * */
  preInput: PropTypes.node,

  /**
   * Children
   * */
  children: PropTypes.node,

  /**
   * Additional classes to add
   * */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

  /**
   * Additional props to pass to the <TextInput>
   **/
  props: PropTypes.object,
};

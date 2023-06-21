import React, { useState } from "react";
import PropTypes from "prop-types";
import { StyleSheet, TextInput, View } from "react-native";
import { Error } from "../../errors/Error";
import { AppText } from "../../texts/AppText/AppText";

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
  isTextarea = false,
  preInput,
  children,
  style,
  onBlur,
  onFocus,
  onChange,
  autoCapitalize = "sentences",
  inputStyles,
  reference,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.inputWrapper, style]}>
      {label && (
        <AppText namedStyle="text" style={styles.label}>
          {label}
        </AppText>
      )}
      <View
        style={[
          styles.input,
          appStyles.shadow2,
          errorMessage && styles.inputError,
          isTextarea && styles.textarea,
          isFocused && !errorMessage && styles.inputFocused,
        ]}
      >
        {preInput && preInput}
        <TextInput
          style={[
            styles.textInput,
            isTextarea && styles.inputTextarea,
            disabled && styles.inputWrapperDisabled,
            inputStyles,
          ]}
          editable={!disabled}
          selectTextOnFocus={!disabled}
          secureTextEntry={isPassword}
          placeholderTextColor={appStyles.colorGray_92989b}
          autoCorrect={false}
          autoComplete="email"
          spellCheck={false}
          autoCapitalize={autoCapitalize}
          onChangeText={(value) => onChange(value)}
          onFocus={() => {
            setIsFocused(true);
            onFocus && onFocus();
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur && onBlur(e);
          }}
          maxFontSizeMultiplier={appStyles.maxFontSizeMultiplier}
          ref={reference}
          {...props}
        />
        {children && children}
      </View>
      {errorMessage && !disabled && <Error message={errorMessage} />}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    width: "96%",
    maxWidth: 420,
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
    width: "97%",
    marginTop: 4,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
  },

  textarea: {
    borderRadius: 32,
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
    textAlignVertical: "top",
  },

  inputTextarea: {
    height: 120,
  },

  label: {
    color: appStyles.colorBlue_3d527b,
    fontFamily: appStyles.fontSemiBold,
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
   * Is the input a textarea
   * @default false
   * */
  isTextarea: PropTypes.bool,

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

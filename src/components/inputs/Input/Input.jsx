import React, { useState } from "react";
import PropTypes from "prop-types";
import { StyleSheet, TextInput, View } from "react-native";
import { Error } from "../../errors/Error";
import { AppText } from "../../texts/AppText/AppText";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

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
  wrapperStyles,
  ...props
}) => {
  const { colors, isDarkMode } = useGetTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.inputWrapper, style]}>
      {label && (
        <AppText
          namedStyle="text"
          style={[styles.label, { color: colors.text }]}
        >
          {label}
        </AppText>
      )}
      <View
        style={[
          styles.input,
          { backgroundColor: colors.input },
          appStyles.shadow2,
          errorMessage && styles.inputError,
          isTextarea && styles.textarea,
          isFocused && !errorMessage && styles.inputFocused,
          wrapperStyles,
        ]}
      >
        {preInput && preInput}
        <TextInput
          style={[
            styles.textInput,
            { color: colors.textTertiary },
            isTextarea && styles.inputTextarea,
            disabled && styles.inputWrapperDisabled,
            inputStyles,
          ]}
          editable={!disabled}
          selectTextOnFocus={!disabled}
          secureTextEntry={isPassword}
          placeholderTextColor={
            !isDarkMode ? appStyles.colorGray_92989b : appStyles.colorGray_ea
          }
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
  input: {
    alignItems: "center",
    alignSelf: "center",
    borderColor: "transparent",
    borderRadius: 53,
    borderWidth: 1,
    display: "flex",
    flexDirection: "row",
    marginTop: 4,
    paddingHorizontal: 24,
    paddingVertical: 12,
    width: "97%",
  },

  inputError: {
    borderColor: appStyles.colorRed_eb5757,
  },

  inputFocused: {
    borderColor: appStyles.colorSecondary_9749fa,
  },

  inputTextarea: {
    height: 120,
  },

  inputWrapper: {
    display: "flex",
    maxWidth: 420,
    textAlign: "left",
    width: "96%",
  },

  inputWrapperDisabled: {
    opacity: 0.4,
  },

  label: {
    fontFamily: appStyles.fontSemiBold,
  },

  textInput: {
    color: appStyles.colorBlack_37,
    height: 24,
    textAlignVertical: "top",
    width: "95%",
  },

  textarea: {
    borderRadius: 32,
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

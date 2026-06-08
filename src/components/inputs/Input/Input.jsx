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
  const { colors } = useGetTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (errorMessage) return appStyles.colorRed_eb5757;
    if (isFocused && !disabled) return appStyles.colorSecondary_9749fa;
    return colors.inputBorder || appStyles.colorGray_cdd8e1;
  };

  return (
    <View style={[styles.inputContainer, style]}>
      {label && (
        <AppText
          namedStyle="text"
          style={[styles.label, disabled && styles.labelDisabled]}
        >
          {label}
        </AppText>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.input,
            borderColor: getBorderColor(),
          },
          !disabled && appStyles.shadow1,
          disabled && styles.inputWrapperDisabled,
          errorMessage && styles.inputError,
          isTextarea && styles.textarea,
          wrapperStyles,
        ]}
      >
        {preInput && preInput}
        <TextInput
          style={[
            styles.textInput,
            {
              color: colors.inputText || colors.textTertiary,
              backgroundColor: colors.input,
            },
            isTextarea && styles.inputTextarea,
            inputStyles,
          ]}
          placeholderTextColor={colors.inputPlaceholder || colors.textSecondary}
          editable={!disabled}
          selectTextOnFocus={!disabled}
          secureTextEntry={isPassword}
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
  inputContainer: {
    width: "100%",
    textAlign: "left",
  },

  labelDisabled: {
    opacity: 0.7,
  },

  inputWrapperDisabled: {
    opacity: 0.7,
  },

  label: {
    fontFamily: appStyles.fontMedium,
    marginBottom: 4,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: appStyles.colorWhite_ff,
  },

  inputError: {
    borderColor: appStyles.colorRed_eb5757,
  },

  textInput: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: appStyles.fontRegular,
    textAlignVertical: "center",
  },

  inputTextarea: {
    height: 120,
    textAlignVertical: "top",
  },

  textarea: {
    alignItems: "flex-start",
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

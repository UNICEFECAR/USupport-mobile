import React from "react";
import { Platform, StyleSheet, Switch, View } from "react-native";

import { AppText } from "../../texts/AppText";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

import { CustomSwitch } from "./CustomSwitch";

/**
 * Toggle
 *
 * Toggle component
 *
 * @return {jsx}
 */
export const Toggle = ({
  isToggled,
  handleToggle,
  label,
  labelStyle,
  style,
  wrapperStyles,
  disabled,
  value: valueProp,
  onValueChange: onValueChangeProp,
  ...props
}) => {
  const { colors } = useGetTheme();
  const value = isToggled ?? valueProp ?? false;
  const onValueChange = handleToggle ?? onValueChangeProp;

  const switchElement =
    Platform.OS === "ios" ? (
      <CustomSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        style={style}
      />
    ) : (
      <Switch
        trackColor={{
          false: appStyles.colorGray_ea,
          true: appStyles.colorSecondary_9749fa,
        }}
        thumbColor={appStyles.colorWhite_ff}
        onValueChange={onValueChange}
        value={value}
        disabled={disabled}
        style={style}
        {...props}
      />
    );

  return (
    <View style={wrapperStyles}>
      {label && (
        <AppText
          namedStyle="text"
          style={[styles.label, { color: colors.text }, labelStyle]}
        >
          {label}
        </AppText>
      )}
      {switchElement}
    </View>
  );
};

const styles = StyleSheet.create({
  label: { fontFamily: appStyles.fontSemiBold, marginBottom: 4 },
});

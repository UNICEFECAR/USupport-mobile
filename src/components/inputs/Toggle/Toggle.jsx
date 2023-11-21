import React from "react";
import { StyleSheet, Switch, View } from "react-native";
import { AppText } from "../../texts/AppText";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

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
  ...props
}) => {
  const { colors } = useGetTheme();

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
      <Switch
        trackColor={{
          false: appStyles.colorGray_ea,
          true: appStyles.colorSecondary_9749fa,
        }}
        thumbColor={appStyles.colorWhite_ff}
        ios_backgroundColor={
          isToggled ? appStyles.colorSecondary_9749fa : appStyles.colorGray_ea
        }
        onValueChange={handleToggle}
        value={isToggled}
        style={style}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  label: { fontFamily: appStyles.fontSemiBold, marginBottom: 4 },
});

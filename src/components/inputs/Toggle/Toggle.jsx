import React from "react";
import { Switch, View } from "react-native";
import { AppText } from "../../texts/AppText";
import { appStyles } from "#styles";

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
  return (
    <View style={wrapperStyles}>
      {label && (
        <AppText
          style={[{ color: appStyles.colorBlue_3d527b }, labelStyle]}
          namedStyle="text"
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

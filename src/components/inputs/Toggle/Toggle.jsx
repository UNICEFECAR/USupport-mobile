import React from "react";
import { Switch } from "react-native";

import { appStyles } from "#styles";

/**
 * Toggle
 *
 * Toggle component
 *
 * @return {jsx}
 */
export const Toggle = ({ isToggled, handleToggle, style, ...props }) => {
  return (
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
  );
};

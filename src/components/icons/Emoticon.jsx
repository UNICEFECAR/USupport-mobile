import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View } from "react-native";

import {
  EmoticonHappySm,
  EmoticonHappyLg,
  EmoticonGoodSm,
  EmoticonGoodLg,
  EmoticonSadSm,
  EmoticonSadLg,
  EmoticonDepressedSm,
  EmoticonDepressedLg,
  EmoticonWorriedSm,
  EmoticonWorriedLg,
} from "./assets/sprite";

/**
 * Emoticon
 *
 * EmotIcon component
 *
 * @return {jsx}
 */
export const Emoticon = ({ name, size, style }) => {
  let icon;
  let iconName = `${name}-${size === "xs" ? "sm" : size}`;

  switch (iconName) {
    case "happy-sm":
      icon = <EmoticonHappySm />;
      break;
    case "happy-lg":
      icon = <EmoticonHappyLg />;
      break;
    case "good-sm":
      icon = <EmoticonGoodSm />;
      break;
    case "good-lg":
      icon = <EmoticonGoodLg />;
      break;
    case "sad-sm":
      icon = <EmoticonSadSm />;
      break;
    case "sad-lg":
      icon = <EmoticonSadLg />;
      break;
    case "depressed-sm":
      icon = <EmoticonDepressedSm />;
      break;
    case "depressed-lg":
      icon = <EmoticonDepressedLg />;
      break;
    case "worried-sm":
      icon = <EmoticonWorriedSm />;
      break;
    case "worried-lg":
      icon = <EmoticonWorriedLg />;
      break;
  }

  return <View style={[style, styles[size]]}>{icon}</View>;
};

const styles = StyleSheet.create({
  xs: {
    width: 22,
    height: 22,
  },
  sm: {
    width: 44,
    height: 44,
  },
  lg: {
    width: 58,
    height: 58,
  },
});

Emoticon.propTypes = {
  /**
   * The name of the icon to display.
   **/
  name: PropTypes.string.isRequired,

  /**
   * The size of the icon.
   * @default 'md'
   * @type 'sm' | 'md' | 'lg' | 'xl'
   * */
  size: PropTypes.oneOf(["xs", "sm", "lg"]),

  /**
   * Additional styles to apply to the icon.
   **/
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

import React from "react";
import { Text, StyleSheet } from "react-native";

import appStyles from "../appStyles";

const AppText = ({ style, namedStyle, children, ...rest }) => {
  return (
    <Text style={[style, styles.text, styles[namedStyle]]} {...rest}>
      {children}
    </Text>
  );
};

// define your styles
const styles = StyleSheet.create({
  text: {
    color: appStyles.colorGray66768d,
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
    lineHeight: 24,
  },
  h1: {
    fontSize: 40,
    lineHeight: 48,
    fontFamily: "Nunito_600SemiBold",
    color: appStyles.colorBlue_3d527b,
  },
  h2: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: "Nunito_600SemiBold",
    color: appStyles.colorBlue_3d527b,
  },
  h3: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: "Nunito_600SemiBold",
    color: appStyles.colorBlue_3d527b,
  },
  smallText: {
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
    lineHeight: 18,
  },
});

//make this component available to the app
export default AppText;

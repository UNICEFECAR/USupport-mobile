import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { calcGradientDegrees } from "../utils";

// create a component
const LinearGradient = ({ children, gradient, ...rest }) => {
  return (
    <ExpoLinearGradient
      {...calcGradientDegrees(gradient.degrees)}
      colors={gradient.colors}
      locations={gradient.locations.map((x) => x / 100)}
      {...rest}
    >
      {children}
    </ExpoLinearGradient>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2c3e50",
  },
});

//make this component available to the app
export default LinearGradient;

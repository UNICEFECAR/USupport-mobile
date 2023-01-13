//import liraries
import React from "react";
import LottieView from "lottie-react-native";

export const Loading = ({ style }) => {
  return (
    <LottieView
      style={[
        {
          width: 50,
          height: 50,
        },
        style,
      ]}
      autoPlay
      loop
      source={require("../../../assets/Loading.json")}
    />
  );
};

import AnimatedLottieView from "lottie-react-native";
import React from "react";
import { View, StyleSheet } from "react-native";

import loading from "./typing.json";
import { AppText } from "../../texts/AppText";
import { appStyles } from "#styles";

export const TypingIndicator = ({ text }) => {
  return (
    <View style={styles.container}>
      <AppText>{text}</AppText>
      <AnimatedLottieView
        style={{
          width: 40,
          height: 40,
        }}
        autoPlay
        loop
        source={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    width: "auto",
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    backgroundColor: appStyles.colorGreen_c1eaea,
    paddingVertical: 0,
    paddingHorizontal: 20,
    marginBottom: 10,
    marginRight: "auto",
  },
  dotStyle: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: "black",
  },
});

export default TypingIndicator;

import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Screen } from "#components";
import { Welcome as WelcomeBlock } from "#blocks";

export const Welcome = () => {
  return (
    <Screen
      hasEmergencyButton={false}
      hasSpiralBackground={false}
      outsideComponent={
        <>
          <Image
            source={require("../../assets/welcome-spiral.png")}
            style={styles.spiralBackground}
            resizeMode="stretch"
          />
          <Image
            source={require("../../assets/welcome-radial.png")}
            style={styles.radialBackround}
            resizeMode="stretch"
          />
        </>
      }
    >
      <WelcomeBlock />
    </Screen>
  );
};

const styles = StyleSheet.create({
  spiralBackground: {
    width: "120%",
    height: "120%",
    position: "absolute",
    zIndex: -1,
  },
  radialBackround: {
    width: "120%",
    height: "120%",
    position: "absolute",
    bottom: 0,
    right: 0,
    zIndex: -1,
  },
});

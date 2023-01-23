import React from "react";
import { Image, StyleSheet } from "react-native";
import { Screen } from "#components";

import { RegisterPreview as RegisterPreviewBlock } from "#blocks";

/**
 * RegisterPreview
 *
 * RegisterPreview screen
 *
 * @returns {JSX.Element}
 */
export const RegisterPreview = ({ navigation }) => {
  return (
    <Screen
      hasEmergencyButton={false}
      outsideComponent={
        <>
          <Image
            source={require("../../assets/spiral-background-2.png")}
            style={styles.background}
            resizeMode="cover"
          />
          <Image
            source={require("../../assets/radial-green.png")}
            style={styles.background}
            resizeMode="stretch"
          />
        </>
      }
    >
      <RegisterPreviewBlock navigation={navigation} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  background: {
    width: "100%",
    height: "120%",
    position: "absolute",
    zIndex: -1,
  },
});

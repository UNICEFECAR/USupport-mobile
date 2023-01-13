import React from "react";
import {
  StyleSheet,
  SafeAreaView,
  Platform,
  View,
  StatusBar,
  Image,
} from "react-native";

import { ButtonOnlyIcon } from "../../buttons";
import { appStyles } from "#styles";
import { RadialGradient } from "react-native-gradients";
import spiralBackground from "../../../assets/spiral-background.png";

// Main wrapper for every screen
export function Screen({
  children,
  style,
  isBackgroundColorEnabled = true,
  outsideComponent,
  hasRadialGradient = true,
  hasEmergencyButton = true,
  hasSpiralBackground = true,
}) {
  const colorList = [
    { offset: "0%", color: "#ebe0ff", opacity: "0.55" },
    { offset: "100%", color: "#ebe0ff", opacity: "0" },
  ];
  return (
    <SafeAreaView
      style={[
        styles.screen,
        isBackgroundColorEnabled ? styles.screenBackground : "",
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={"transparent"}
        translucent={Platform.OS === "android" ? true : false}
      />

      <View style={[styles.screenChildren, style]}>{children}</View>

      {hasSpiralBackground && (
        <Image
          source={spiralBackground}
          style={styles.spiralImage}
          resizeMode="stretch"
        />
      )}

      {hasEmergencyButton && (
        <ButtonOnlyIcon
          style={styles.emergencyButton}
          onPress={() => console.log("Must be implemented")}
        />
      )}
      {outsideComponent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    flex: 1,
    position: "relative",
  },
  screenBackground: { backgroundColor: appStyles.colorWhite_ff },
  screenChildren: {
    flex: 1,
    // paddingHorizontal: 16,
  },
  radialGradient: {
    position: "absolute",
    top: 0,
    left: -50,
    width: "50%",
    height: "50%",
    zIndex: -1,
  },
  emergencyButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    zIndex: 999,
  },
  spiralImage: { width: "100%", position: "absolute", bottom: 0, zIndex: -1 },
});

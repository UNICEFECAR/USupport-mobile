import React from "react";
import {
  StyleSheet,
  SafeAreaView,
  Platform,
  View,
  StatusBar,
} from "react-native";

import { ButtonOnlyIcon } from "../../buttons";
import { appStyles } from "#styles";

// Main wrapper for every screen
function Screen({
  children,
  style,
  isBackgroundColorEnabled = true,
  outsideComponent,
  hasEmergencyButton = true,
}) {
  return (
    <SafeAreaView
      style={[
        styles.screen,
        style,
        isBackgroundColorEnabled ? styles.screenBackground : "",
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={"transparent"}
        translucent={Platform.OS === "android" ? true : false}
      />
      <View style={[styles.screenChildren, style]}>{children}</View>
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
    zIndex: 1,
    position: "relative",
  },
  screenBackground: { backgroundColor: appStyles.colorGray100 },
  screenChildren: {
    flex: 1,
  },
  emergencyButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
  },
});

export default Screen;

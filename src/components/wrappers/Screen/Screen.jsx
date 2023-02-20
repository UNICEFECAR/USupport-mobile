import React, { useContext } from "react";
import {
  StyleSheet,
  SafeAreaView,
  Platform,
  View,
  StatusBar,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ButtonOnlyIcon } from "../../buttons";
import { appStyles } from "#styles";
import spiralBackground from "../../../assets/spiral-background.png";
import { HeaderNavigation } from "../../headings";

import { useCheckHasUnreadNotifications } from "#hooks";
import { Context } from "#services";

// Main wrapper for every screen
export function Screen({
  children,
  style,
  isBackgroundColorEnabled = true,
  backgroundColor,
  outsideComponent,
  hasEmergencyButton = true,
  hasSpiralBackground = true,
  hasHeaderNavigation = false,
  t,
}) {
  const { isTmpUser, token } = useContext(Context);
  const navigation = useNavigation();

  const { top: topInset } = useSafeAreaInsets();

  const queryEnabled = !isTmpUser && token;
  const queryHasUnreadNotifications =
    useCheckHasUnreadNotifications(queryEnabled);

  return (
    <SafeAreaView
      style={[
        styles.screen,
        backgroundColor
          ? { backgroundColor }
          : isBackgroundColorEnabled
          ? styles.screenBackground
          : "",
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
          onPress={() => navigation.push("SOSCenter")}
        />
      )}
      {hasHeaderNavigation ? (
        <HeaderNavigation
          t={t}
          navigation={navigation}
          style={{
            position: "absolute",
            top: 0,
            width: "100%",
            paddingTop:
              (Platform.OS === "android" ? StatusBar.currentHeight : topInset) +
              7,
          }}
          hasUnreadNotifications={queryHasUnreadNotifications.data}
        />
      ) : null}
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
    bottom: 75,
    right: 16,
    zIndex: 999,
  },
  spiralImage: { width: "100%", position: "absolute", bottom: 0, zIndex: -1 },
});

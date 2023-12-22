import React, { useContext, useState } from "react";
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
import spiralBackground from "../../../assets/spiral-background.png";
import { HeaderNavigation } from "../../headings";
import { useCheckHasUnreadNotifications, useGetTheme } from "#hooks";
import { Context } from "#services";
import { appStyles } from "#styles";

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
  const { colors, isDarkMode } = useGetTheme();
  const { isTmpUser, token, handleRegistrationModalOpen, hasCheckedTmpUser } =
    useContext(Context);
  const navigation = useNavigation();

  const [hasUnreadNotifications, setHasUnreadNotifications] = useState();

  const { top: topInset } = useSafeAreaInsets();

  const onCheckHasUnreadNotificationsSuccess = (data) => {
    setHasUnreadNotifications(data);
  };
  const queryEnabled = !isTmpUser && !!token && hasCheckedTmpUser;
  useCheckHasUnreadNotifications(
    queryEnabled,
    onCheckHasUnreadNotificationsSuccess
  );

  return (
    <SafeAreaView
      style={[
        styles.screen,
        backgroundColor
          ? { backgroundColor }
          : isBackgroundColorEnabled
          ? { backgroundColor: colors.background }
          : "",
      ]}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={"transparent"}
        translucent={Platform.OS === "android" ? true : false}
      />
      <View style={[styles.screenChildren, style]}>
        {children}
        {hasEmergencyButton && (
          <ButtonOnlyIcon
            style={styles.emergencyButton}
            onPress={() => navigation.push("SOSCenter")}
            color="red"
          />
        )}
      </View>

      {hasSpiralBackground && (
        <Image
          source={spiralBackground}
          style={styles.spiralImage}
          resizeMode="stretch"
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
              Platform.OS === "android"
                ? StatusBar.currentHeight + 7
                : topInset + 7,
          }}
          hasUnreadNotifications={hasUnreadNotifications}
          isTmpUser={isTmpUser}
          handleRegistrationModalOpen={handleRegistrationModalOpen}
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
    bottom: 16,
    right: 16,
    zIndex: 998,
    elevation: 998,
  },
  spiralImage: { width: "100%", position: "absolute", bottom: 0, zIndex: -1 },
});

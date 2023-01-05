import React, { useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";

import AppText from "./src/components/AppText";

import {
  useFonts,
  Nunito_300Light,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";

import LinearGradient from "./src/components/LinearGradient";
import appStyles from "./src/appStyles";

export default function App() {
  let [loaded, error] = useFonts({
    Nunito_300Light,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  // Hide the splash screen when the fonts finish loading
  const onLayoutRootView = useCallback(async () => {
    if (loaded) {
      await SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (error) {
    return (
      <View style={styles.container}>{JSON.stringify(error, null, 2)}</View>
    );
  }
  if (!loaded) {
    return null;
  }
  return (
    <View onLayout={onLayoutRootView} style={styles.container}>
      <LinearGradient gradient={appStyles.gradientSecondary3}>
        <AppText namedStyle="h2">
          The quick brown fox jumps over the lazy dog
        </AppText>
      </LinearGradient>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

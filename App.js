import React, { useCallback, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StyleSheet, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { NavigationContainer } from "@react-navigation/native";
import FlashMessage from "react-native-flash-message";

import {
  useFonts,
  Nunito_300Light,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";

import { AuthNavigation, AppNavigation } from "#navigation";
import { localStorage, Context } from "#services";

// Create a react-query client
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

export default function App() {
  let [loaded, error] = useFonts({
    Nunito_300Light,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  const [token, setToken] = useState();

  // localStorage.setItem("token", "");

  useEffect(() => {
    localStorage.getItem("token").then((jwtToken) => {
      setToken(jwtToken);
    });
  }, []);

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
    <Context.Provider value={{ setToken }}>
      <NavigationContainer>
        <QueryClientProvider client={queryClient}>
          <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            {token ? <AppNavigation /> : <AuthNavigation />}
          </View>
          <FlashMessage position="top" />
        </QueryClientProvider>
      </NavigationContainer>
    </Context.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

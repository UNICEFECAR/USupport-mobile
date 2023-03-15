import React, { useCallback, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StyleSheet, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import FlashMessage from "react-native-flash-message";
import { StripeProvider } from "@stripe/stripe-react-native";
import * as Notifications from "expo-notifications";

import { STRIPE_PUBLIC_KEY } from "@env";

import {
  useFonts,
  Nunito_300Light,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";

import { Navigation } from "#navigation";
import { localStorage, Context, userSvc } from "#services";
import { RequireRegistration } from "#modals";
import { DropdownBackdrop } from "#backdrops";
import { FIVE_MINUTES } from "#utils";

// if (__DEV__) {
//   require("basil-ws-flipper").wsDebugPlugin;р
// }

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Create a react-query client
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchInterval: FIVE_MINUTES } },
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
  const [initialRouteName, setInitialRouteName] = useState("TabNavigation"); // Initial route name for the AppNavigation
  const [initialAuthRouteName, setInitialAuthRouteName] = useState("Welcome"); // Initial route name for the AuthNavigation
  const [isTmpUser, setIsTmpUser] = useState(null); // Is the user logged in as a guest
  const [isRegistrationModalOpan, setIsRegistrationModalOpen] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState("");
  const [userPin, setUserPin] = useState(); // The value of the user's PIN code
  const [hasCheckedTmpUser, setHasCheckedTmpUser] = useState(false);

  const [dropdownOptions, setDropdownOptions] = useState({
    isOpen: false,
    options: [],
    heading: "",
    selectedOption: "",
    handleChooseOption: () => {},
    dropdownId: null,
  });

  const handleRegistrationModalClose = () => setIsRegistrationModalOpen(false);
  const handleRegistrationModalOpen = () => setIsRegistrationModalOpen(true);
  const handleRegisterRedirection = () => {
    setInitialAuthRouteName("RegisterPreview");
    handleRegistrationModalClose();
    localStorage.removeItem("token");
    localStorage.removeItem("refresh-token");
    localStorage.removeItem("expires-in");
    setToken(null);
  };

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    async function checkToken() {
      const token = await localStorage.getItem("token");
      setToken(token);

      const pinCode = await localStorage.getItem("pin-code");
      setUserPin(pinCode);
    }
    checkToken();
  }, []);

  useEffect(() => {
    async function checkIsTmpUser() {
      if (token) {
        const userId = await userSvc.getUserID();
        const tmpUser = userId === "tmp-user";
        setIsTmpUser(tmpUser);
        setHasCheckedTmpUser(true);
      }
    }
    checkIsTmpUser();
  }, [token]);

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
  const contextValues = {
    token,
    setToken,
    userPin,
    initialRouteName,
    setInitialRouteName,
    isTmpUser,
    setIsTmpUser,
    handleRegistrationModalOpen,
    initialAuthRouteName,
    setInitialAuthRouteName,
    currencySymbol,
    setCurrencySymbol,
    dropdownOptions,
    setDropdownOptions,
    hasCheckedTmpUser,
  };

  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLIC_KEY}
      // urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
      // merchantIdentifier="merchant.com.{{YOUR_APP_NAME}}" // required for Apple Pay
    >
      <Context.Provider value={contextValues}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
              <Navigation />
              <RequireRegistration
                handleContinue={handleRegisterRedirection}
                isOpen={isRegistrationModalOpan}
                onClose={handleRegistrationModalClose}
              />
              <DropdownBackdrop
                onClose={() =>
                  setDropdownOptions((options) => ({
                    ...options,
                    isOpen: false,
                  }))
                }
                {...dropdownOptions}
              />
            </View>
          </SafeAreaProvider>
          <FlashMessage position="top" />
        </QueryClientProvider>
      </Context.Provider>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

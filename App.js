import codePush from "react-native-code-push";

import React, { useCallback, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StyleSheet, View, Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import FlashMessage from "react-native-flash-message";
import { StripeProvider } from "@stripe/stripe-react-native";
import * as Notifications from "expo-notifications";

import Config from "react-native-config";

const { STRIPE_PUBLIC_KEY } = Config;

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
import { GestureHandlerRootView } from "react-native-gesture-handler";

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

function App() {
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
  const [activeCoupon, setActiveCoupon] = useState();
  const [isAnonymousRegister, setIsAnonymousRegister] = useState(false);
  const [theme, setTheme] = useState(null);
  const [isInConsultation, setIsInConsultation] = useState(false);
  const [isLoginDisabled, setIsLoginDisabled] = useState(false);
  const [hasAuthenticatedWithPin, setHasAuthenticatedWithPin] = useState(false);

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
    async function checkCurencySymbol() {
      const localStorageCurrencySymbol =
        await localStorage.getItem("currencySymbol");
      if (!currencySymbol && localStorageCurrencySymbol) {
        setCurrencySymbol(localStorageCurrencySymbol);
      }
      if (!localStorageCurrencySymbol && currencySymbol) {
        await localStorage.setItem("currencySymbol", currencySymbol);
      }

      if (
        localStorageCurrencySymbol &&
        currencySymbol &&
        localStorageCurrencySymbol !== currencySymbol
      ) {
        await localStorage.setItem("currencySymbol", currencySymbol);
      }
    }
    checkCurencySymbol();
  }, [currencySymbol]);

  const handleCodePushCheck = async (data) => {
    const [token, pinCode] = data;

    const clearTokenIfNoPinOrBiometrics = async () => {
      // If the client doesn't have biometrics enabled and doesn't have a pin code remove the
      // token  from the local storage, so that re-authentication is required on next app launch
      const hasBiometrics = await localStorage.getItem("biometrics-enabled");
      // await localStorage.removeItem("has-declined-biometrics");
      if (!hasBiometrics && !pinCode && token) {
        await localStorage.removeItem("token");
        setToken(null);
      }
    };

    codePush.notifyApplicationReady();
    codePush
      .sync(
        {
          checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
          installMode: codePush.InstallMode.IMMEDIATE,
          minimumBackgroundDuration: 5,
          // updateDialog: true,
          rollbackRetryOptions: 5,
          maxRetryAttempts: 999,
          deploymentKey:
            Platform.OS === "android"
              ? process.env.CODEPUSH_ANDROID_DEPLOYMENT_KEY
              : process.env.CODEPUSH_IOS_DEPLOYMENT_KEY,
        },
        (status) => {
          switch (status) {
            // Clear token if no biometrics or pin code
            // after the app has been updated
            case codePush.SyncStatus.UP_TO_DATE:
              clearTokenIfNoPinOrBiometrics();
              break;
            default:
              break;
          }
        }
      )
      .catch((err) => {
        console.log(err, "err");
      });
  };

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    async function checkToken() {
      const token = await localStorage.getItem("token");
      setToken(token);

      const pinCode = await localStorage.getItem("pin-code");
      setUserPin(pinCode);

      return [token, pinCode];
    }
    checkToken().then((data) => {
      handleCodePushCheck(data);
    });
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
    activeCoupon,
    setActiveCoupon,
    isAnonymousRegister,
    setIsAnonymousRegister,
    theme,
    setTheme,
    isLoginDisabled,
    setIsLoginDisabled,
    isInConsultation,
    setIsInConsultation,
    setUserPin,
    hasAuthenticatedWithPin,
    setHasAuthenticatedWithPin,
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StripeProvider publishableKey={STRIPE_PUBLIC_KEY}>
        <Context.Provider value={contextValues}>
          <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
              <View style={styles.flex1} onLayout={onLayoutRootView}>
                <Navigation
                  contextTheme={theme}
                  setTheme={setTheme}
                  isInConsultation={isInConsultation}
                >
                  <DropdownBackdrop
                    onClose={() =>
                      setDropdownOptions((options) => ({
                        ...options,
                        isOpen: false,
                      }))
                    }
                    {...dropdownOptions}
                  />
                  <RequireRegistration
                    handleContinue={handleRegisterRedirection}
                    isOpen={isRegistrationModalOpan}
                    onClose={handleRegistrationModalClose}
                  />
                </Navigation>
              </View>
            </SafeAreaProvider>
            <FlashMessage position="top" />
          </QueryClientProvider>
        </Context.Provider>
      </StripeProvider>
    </GestureHandlerRootView>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  flex1: { flex: 1 },
});

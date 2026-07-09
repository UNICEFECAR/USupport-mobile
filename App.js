globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

import React, { useCallback, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StyleSheet, View, Text, Linking } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import FlashMessage from "react-native-flash-message";
import { StripeProvider } from "@stripe/stripe-react-native";
import * as Notifications from "expo-notifications";
import NetInfo from "@react-native-community/netinfo";

import "./firebase.js";

import Config from "react-native-config";

const STRIPE_PUBLIC_KEY = Config.STRIPE_PUBLIC_KEY || "";

import { Navigation } from "#navigation";
import { localStorage, Context, userSvc } from "#services";
import { NoInternetModal, RequireRegistration } from "#modals";
import { DropdownBackdrop } from "#backdrops";
import {
  FIVE_MINUTES,
  isTokenExpired,
  isKeepMeSignedIn,
  clearAbandonedPendingOnColdStart,
} from "#utils";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useFonts,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";

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

class AppErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error("AppErrorBoundary:", error, errorInfo);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>
            {this.state.error?.message ?? String(this.state.error)}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
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
  const [isConnected, setIsConnected] = useState(true);
  const [country, setCountry] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null); // full country object { value, label, countryID, ... }
  const [isPodcastsActive, setIsPodcastsActive] = useState(false);
  const [isVideosActive, setIsVideosActive] = useState(false);
  const [pendingDeepLink, setPendingDeepLink] = useState(null);
  const [requireBiometricsSetup, setRequireBiometricsSetup] = useState(false);

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

  // Add network connectivity check
  useEffect(() => {
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

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
    async function checkCountry() {
      const localStorageCountry = await localStorage.getItem("country");
      if (!country && localStorageCountry) {
        setCountry(localStorageCountry);
      }
    }
    checkCurencySymbol();
    checkCountry();
  }, [currencySymbol, country]);

  const handleTokenCheck = async (data) => {
    const [token, pinCode] = data;
    const clearTokenIfNoPinOrBiometrics = async () => {
      const hasBiometrics = await localStorage.getItem("biometrics-enabled");
      const keepSignedIn = await isKeepMeSignedIn();
      if (!hasBiometrics && !pinCode && !keepSignedIn && token && !__DEV__) {
        await localStorage.removeItem("token");
        setToken(null);
      }
    };
    clearTokenIfNoPinOrBiometrics();
  };

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    async function checkToken() {
      const token = await localStorage.getItem("token");
      const pinCode = await localStorage.getItem("pin-code");
      setUserPin(pinCode);
      await clearAbandonedPendingOnColdStart(pinCode);

      // Treat expired or invalid token as no token (clear storage and stay logged out)
      if (token && isTokenExpired(token)) {
        await localStorage.removeItem("token");
        await localStorage.removeItem("refresh-token");
        await localStorage.removeItem("expires-in");
        setToken(null);
        return [null, pinCode];
      }

      setToken(token);
      return [token, pinCode];
    }
    checkToken().then((data) => {
      handleTokenCheck(data);
      const [tokenFromCheck] = data;
      Linking.getInitialURL().then((url) => {
        if (url && !tokenFromCheck) {
          setPendingDeepLink(url);
          // Decide which auth screen to show first:
          // - Welcome: no country selected yet
          // - Login: country already chosen
          localStorage.getItem("country").then((storedCountry) => {
            const hasCountry = !!storedCountry;
            setInitialAuthRouteName(hasCountry ? "Login" : "Welcome");
          });
        }
      });
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

  // Hide splash once Inter is ready (or failed — fall back to system fonts)
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // if (error) {
  //   return (
  //     <View style={styles.container}>{JSON.stringify(error, null, 2)}</View>
  //   );
  // }

  if (!fontsLoaded && !fontError) {
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
    country,
    setCountry,
    selectedCountry,
    setSelectedCountry,
    isPodcastsActive,
    setIsPodcastsActive,
    isVideosActive,
    setIsVideosActive,
    pendingDeepLink,
    setPendingDeepLink,
    requireBiometricsSetup,
    setRequireBiometricsSetup,
  };

  return (
    <AppErrorBoundary>
      <GestureHandlerRootView style={styles.flex1}>
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
                    <NoInternetModal theme={theme} isVisible={!isConnected} />
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
    </AppErrorBoundary>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  flex1: { flex: 1 },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#1a1a1a",
  },
  errorTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  errorText: {
    color: "#f44",
    fontSize: 14,
  },
});

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  AppState,
  Platform,
  PermissionsAndroid,
  useColorScheme,
  PanResponder,
  View,
  Linking,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import {
  NavigationContainer,
  useNavigation,
  createNavigationContainerRef,
} from "@react-navigation/native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import uuid from "react-native-uuid";

import messaging from "@react-native-firebase/messaging";

import { AppNavigation } from "./AppNavigation";
import { linkingConfig, getMainStackStateFromUrl } from "./linking";

import { appColors } from "#styles";
import { LocalAuthenticationScreen } from "#screens";
import { AuthModalManager } from "../components/auth/AuthModalManager";
import {
  useAddPushNotificationToken,
  useGetClientData,
  useLogout,
} from "#hooks";
import { countrySvc, localStorage, Context, userSvc } from "#services";

import {
  getCountryFromTimezone,
  FIVE_MINUTES,
  isKeepMeSignedIn,
  isPendingKeepMeSignedIn,
} from "#utils";

export const navigationRef = createNavigationContainerRef();

function getInitialState() {
  return (async () => {
    try {
      const url = await Linking.getInitialURL();
      const token = await localStorage.getItem("token");
      if (!token || !url) return undefined;
      const mainState = getMainStackStateFromUrl(url);
      if (!mainState) return undefined;
      return mainState;
    } catch {
      return undefined;
    }
  })();
}

const kazakhstanCountry = {
  value: "KZ",
  label: "Kazakhstan",
  iconName: "KZ",
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const TWENTY_MINUTES = FIVE_MINUTES * 4;

const addPlatformAccess = async () => {
  let visitorId = await localStorage.getItem("visitorId");
  if (!visitorId) {
    visitorId = uuid.v4();
    await localStorage.setItem("visitorId", visitorId);
  }

  return await userSvc.addPlatformAccess(visitorId);
};

export function Navigation({
  contextTheme,
  setTheme,
  isInConsultation,
  children,
}) {
  const [hasSavedPushToken, setHasSavedPushToken] = useState(false);
  const { i18n } = useTranslation();
  const theme = useColorScheme();
  const darkTheme = {
    colors: {
      ...appColors.dark,
    },
    dark: true,
  };
  const highContrastTheme = {
    colors: {
      ...appColors.highContrast,
    },
    dark: true,
    highContrast: true,
  };
  const defaultTheme = {
    colors: {
      ...appColors.light,
    },
    dark: false,
    highContrast: false,
  };

  const {
    hasAuthenticatedWithPin,
    setHasAuthenticatedWithPin,
    token,
    setCurrencySymbol,
    isTmpUser,
    userPin,
    hasCheckedTmpUser,
    initialRouteName,
    setIsPodcastsActive,
    setIsVideosActive,
    country,
    setCountry,
    setSelectedCountry,
    pendingDeepLink,
    setPendingDeepLink,
    requireBiometricsSetup,
  } = useContext(Context);

  const getClientDataEnabled = !!(
    (isTmpUser === false ? true : false) && token
  );
  const [clientDataQuery, clientDataFromHook] =
    useGetClientData(getClientDataEnabled);
  const clientData = isTmpUser
    ? {}
    : (clientDataFromHook ?? clientDataQuery?.data ?? {});

  const timerId = useRef(false);
  const inConsultationRef = useRef(isInConsultation);
  const hasHandledInitialUrlRef = useRef(false);

  const logoutMutation = useLogout();

  useEffect(() => {
    inConsultationRef.current = isInConsultation;
    if (token && !isInConsultation) {
      resetInactivityTimeout();
    }
  }, [isInConsultation, resetInactivityTimeout, token]);

  useEffect(() => {
    if (isInConsultation && timerId.current) {
      clearTimeout(timerId.current);
      timerId.current = null;
    }
  }, [isInConsultation]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        resetInactivityTimeout();
      },
    })
  ).current;

  // After five minutes of inactivity, the user will be prompted to enter their PIN code or authenticate with biometrics
  const resetInactivityTimeout = useCallback(async () => {
    const actualToken = await localStorage.getItem("token");

    if (!inConsultationRef.current && actualToken) {
      if (timerId.current) {
        clearTimeout(timerId.current);
      }
      timerId.current = setTimeout(async () => {
        if (inConsultationRef.current) {
          // User entered a consultation after the timeout was scheduled; skip inactivity handling
          return;
        }
        const hasBiometrics = await localStorage.getItem("biometrics-enabled");
        const userPin = await localStorage.getItem("pin-code");
        const keepSignedIn = await isKeepMeSignedIn();

        if (!hasBiometrics && !userPin && !keepSignedIn) {
          logoutMutation.mutate();
          console.log("logout");
        } else {
          setHasAuthenticatedWithPin(false);
        }
      }, FIVE_MINUTES);
    } else {
      if (timerId.current) {
        clearTimeout(timerId.current);
        timerId.current = null;
      }
    }
  }, [token]);

  const hasClearedTimeout = useRef();

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      let timeout;
      if (state === "background") {
        hasClearedTimeout.current = false;
        timeout = setTimeout(() => {
          if (!hasClearedTimeout.current) {
            setHasAuthenticatedWithPin(false);
          }
        }, FIVE_MINUTES);
      } else {
        clearTimeout(timeout);
        hasClearedTimeout.current = true;
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    localStorage.getItem("theme").then((localStorageTheme) => {
      if (!localStorageTheme) {
        const newTheme = theme === "dark" ? "dark" : "light";
        localStorage.setItem("theme", newTheme);
        setTheme(newTheme);
        return;
      }
      if (localStorageTheme === "dark") {
        setTheme("dark");
      } else if (localStorageTheme === "highContrast") {
        setTheme("highContrast");
      } else {
        setTheme("light");
      }
    });
  }, [theme]);

  const addPushNotificationTokenMutation = useAddPushNotificationToken();
  useEffect(() => {
    if (
      !hasSavedPushToken &&
      !isTmpUser &&
      clientData &&
      Object.values(clientData).length !== 0 &&
      token &&
      hasCheckedTmpUser
    ) {
      registerForPushNotifications().then((pushToken) => {
        setHasSavedPushToken(true);
        const tokensArray = clientData.pushNotificationTokens || [];
        if (pushToken && !tokensArray.includes(pushToken)) {
          tokensArray.push(pushToken);
          addPushNotificationTokenMutation.mutate(pushToken);
        }
      });
    }
  }, [isTmpUser, token, clientData, hasCheckedTmpUser, hasSavedPushToken]);

  const fetchCountries = async () => {
    const localStorageCountry = await localStorage.getItem("country");
    const localStorageLanguage = await localStorage.getItem("language");
    i18n.changeLanguage(localStorageLanguage);

    const res = await countrySvc.getActiveCountries();
    const usersCountry = getCountryFromTimezone();
    const validCountry = res.data.find((x) => x.alpha2 === usersCountry);
    let hasSetDefaultCountry = false;
    const countries = res.data.map((x) => {
      const countryObject = {
        value: x.alpha2,
        label: x.name,
        countryID: x["country_id"],
        iconName: x.alpha2,
        minAge: x["min_client_age"],
        maxAge: x["max_client_age"],
        currencySymbol: x["symbol"],
        localName: x["local_name"],
        podcastsActive: x["podcasts_active"],
        videosActive: x["videos_active"],
        hasPayments: x.has_payments,
        hasCoupons: x.has_coupons,
        hasFreeConsultations: x.has_free_consultations,
        defaultBillingType: x.default_billing_type,
        defaultCouponCode: x.default_coupon_code,
      };
      const countryID = countryObject.countryID;
      const currencySymbol = countryObject.currencySymbol;
      if (localStorageCountry === x.alpha2) {
        localStorage.setItem("country_id", countryID);
        if (currencySymbol) {
          localStorage.setItem("currency_symbol", currencySymbol);
        }
        setCurrencySymbol(currencySymbol);
        setIsPodcastsActive(countryObject.podcastsActive);
        setIsVideosActive(countryObject.videosActive);
        setCountry(x.alpha2);
        setSelectedCountry(countryObject);
      } else if (!localStorageCountry) {
        if (validCountry?.alpha2 === x.alpha2) {
          hasSetDefaultCountry = true;

          localStorage.setItem("country", x.alpha2);
          localStorage.setItem("country_id", countryObject.countryID);
          if (countryObject.currencySymbol) {
            localStorage.setItem(
              "currency_symbol",
              countryObject.currencySymbol
            );
          }

          setCurrencySymbol(countryObject.currencySymbol);
          setIsPodcastsActive(countryObject.podcastsActive);
          setIsVideosActive(countryObject.videosActive);
          setCountry(x.alpha2);
          setSelectedCountry(countryObject);
        }
      }

      return countryObject;
    });

    if (!hasSetDefaultCountry && !localStorageCountry) {
      const kazakhstanCountryObject = countries.find(
        (x) => x.value === kazakhstanCountry.value
      );

      localStorage.setItem("country", kazakhstanCountry.value);
      localStorage.setItem("country_id", kazakhstanCountryObject.countryID);
      localStorage.setItem(
        "currency_symbol",
        kazakhstanCountryObject.currencySymbol
      );

      setIsPodcastsActive(kazakhstanCountryObject.podcastsActive);
      setIsVideosActive(kazakhstanCountryObject.videosActive);
      setCurrencySymbol(kazakhstanCountryObject.currencySymbol);
      setCountry(kazakhstanCountry.value);
      setSelectedCountry(kazakhstanCountryObject);
    }

    return await countries;
  };

  useQuery(["countries"], fetchCountries, {
    // staleTime: Infinity,
    onError: (err) => console.log(err, "fetch countries error"),
  });

  useQuery(["platformAccess", country], addPlatformAccess, {
    staleTime: Infinity,
    enabled: !!country && !isTmpUser,
    retry: false,
  });

  // Handle initial URL on cold start (extra safety for TestFlight / production builds)
  useEffect(() => {
    if (hasHandledInitialUrlRef.current) return;

    (async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (!initialUrl) return;

        hasHandledInitialUrlRef.current = true;

        if (!token) {
          // Not authenticated: remember deep link and send user to auth flow
          setPendingDeepLink(initialUrl);
          return;
        }

        // Authenticated: navigate to app screen directly
        const mainState = getMainStackStateFromUrl(initialUrl);
        if (mainState && navigationRef.isReady()) {
          const route = mainState.routes[mainState.index];
          navigationRef.navigate(route.name, route.params);
        }
      } catch {
        // ignore
      }
    })();
  }, [token, country, setPendingDeepLink]);

  // After login: if we had a pending deep link, reset app stack to that screen
  useEffect(() => {
    if (
      !token ||
      !hasCheckedTmpUser ||
      !pendingDeepLink ||
      !navigationRef.isReady()
    ) {
      return;
    }
    const state = getMainStackStateFromUrl(pendingDeepLink);
    if (state) {
      const t = setTimeout(() => {
        if (navigationRef.isReady()) {
          navigationRef.reset(state);
          setPendingDeepLink(null);
        }
      }, 200);
      return () => clearTimeout(t);
    }
    setPendingDeepLink(null);
  }, [token, hasCheckedTmpUser, pendingDeepLink, setPendingDeepLink]);

  // Handle deep link when app is already open (foreground/background)
  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (!url) return;

      // If the user is not authenticated yet, remember the deep link and
      // navigate them into the appropriate auth screen first.
      if (!token) {
        setPendingDeepLink(url);
        return;
      }

      // Authenticated: root is App stack, navigate to the screen directly
      const mainState = getMainStackStateFromUrl(url);
      if (mainState && navigationRef.isReady()) {
        const route = mainState.routes[mainState.index];
        navigationRef.navigate(route.name, route.params);
      }
    });
    return () => subscription.remove();
  }, [token, country, setPendingDeepLink]);

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={{
        ...linkingConfig,
        getInitialState,
      }}
      theme={
        contextTheme === "highContrast"
          ? highContrastTheme
          : contextTheme === "dark"
            ? darkTheme
            : defaultTheme
      }
    >
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        {userPin && !hasAuthenticatedWithPin && token ? (
          <LocalAuthenticationScreen
            userPin={userPin}
            setHasAuthenticatedWithPin={setHasAuthenticatedWithPin}
          />
        ) : token && hasCheckedTmpUser ? (
          <>
            <RedirectToBiometrics
              checkForDeclined={initialRouteName !== "RegisterAboutYou"}
              requireBiometricsSetup={requireBiometricsSetup}
            />
            <AppNavigation />
          </>
        ) : null}
        <AuthModalManager />
        {children}
      </View>
    </NavigationContainer>
  );
}

const RedirectToBiometrics = ({ checkForDeclined, requireBiometricsSetup }) => {
  const navigation = useNavigation();
  const { initialRouteName } = useContext(Context);

  useEffect(() => {
    const checkHasDeclined = async () => {
      const hasDeclined = await localStorage.getItem("has-declined-biometrics");
      const userPin = await localStorage.getItem("pin-code");
      const hasBiometrics = await localStorage.getItem("biometrics-enabled");
      const pending = await isPendingKeepMeSignedIn();
      const keepSignedIn = await isKeepMeSignedIn();

      if (
        requireBiometricsSetup ||
        pending ||
        keepSignedIn ||
        initialRouteName === "SetUpBiometrics"
      ) {
        return;
      }

      if (!hasDeclined && !userPin && !hasBiometrics && checkForDeclined) {
        navigation.navigate("SetUpBiometrics", { goBackOnSkip: true });
      }
    };
    checkHasDeclined();
  }, [checkForDeclined, requireBiometricsSetup, initialRouteName, navigation]);
  return <></>;
};

const askForPermissions = async () => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });

    if (Device.platformApiLevel >= 33) {
      const alreadyGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      if (!alreadyGranted) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          return false;
        }
      }
    }
    return true;
  } else {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      return true;
    }
    return false;
  }
};

const registerForPushNotifications = async () => {
  let token;

  try {
    const hasPermission = await askForPermissions();
    if (hasPermission) {
      token = await messaging().getToken();
    }
    return token;
  } catch (err) {
    console.log("Error getting permissions", err);
    return null;
  }
};

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
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";

import messaging from "@react-native-firebase/messaging";

import { AppNavigation } from "./AppNavigation";
import { AuthNavigation } from "./AuthNavigation";

import { appColors } from "#styles";
import { LocalAuthenticationScreen } from "#screens";
import { useAddPushNotificationToken, useGetClientData } from "#hooks";
import { countrySvc, localStorage, Context } from "#services";

import { getCountryFromTimezone, FIVE_MINUTES } from "#utils";

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

export function Navigation({
  contextTheme,
  setTheme,
  isInConsultation,
  children,
}) {
  const [hasSavedPushToken, setHasSavedPushToken] = useState(false);
  const [hasAuthenticatedWithPin, setHasAuthenticatedWithPin] = useState(false);
  const { i18n } = useTranslation();
  const theme = useColorScheme();
  const darkTheme = {
    colors: {
      ...appColors.dark,
    },
    dark: true,
  };
  const defaultTheme = {
    colors: {
      ...appColors.light,
    },
    dark: false,
  };

  const { token, setCurrencySymbol, isTmpUser, userPin, hasCheckedTmpUser } =
    useContext(Context);

  const getClientDataEnabled = !!(
    (isTmpUser === false ? true : false) && token
  );
  const clientDataQuery = useGetClientData(getClientDataEnabled);
  const clientData = isTmpUser ? {} : clientDataQuery[0].data;

  const timerId = useRef(false);
  const inConsultationRef = useRef(isInConsultation);

  useEffect(() => {
    if (token) {
      resetInactivityTimeout();
    }
    inConsultationRef.current = isInConsultation;
  }, [isInConsultation, resetInactivityTimeout, token, inConsultationRef]);

  useEffect(() => {
    if (isInConsultation && timerId.current) {
      clearTimeout(timerId.current);
    }
  }, [isInConsultation, timerId.current]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        resetInactivityTimeout();
      },
    })
  ).current;

  // After five minutes of inactivity, the user will be prompted to enter their PIN code or authenticate with biometrics
  const resetInactivityTimeout = useCallback(() => {
    if (!inConsultationRef.current && token) {
      clearTimeout(timerId.current);
      timerId.current = setTimeout(() => {
        setHasAuthenticatedWithPin(false);
      }, FIVE_MINUTES);
    } else {
      if (timerId.current) {
        clearTimeout(timerId.current);
      }
    }
  }, [token, isInConsultation]);

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
        }, TWENTY_MINUTES);
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
      }
      setTheme(localStorageTheme === "dark" ? "dark" : "light");
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
      registerForPushNotifications().then((token) => {
        setHasSavedPushToken(true);
        const tokensArray = clientData.pushNotificationTokens || [];
        if (token && !tokensArray.includes(token)) {
          tokensArray.push(token);
          addPushNotificationTokenMutation.mutate(token);
        }
      });
    }
  }, [isTmpUser, token, clientData, hasCheckedTmpUser]);

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
      };
      const countryID = countryObject.countryID;
      const currencySymbol = countryObject.currencySymbol;
      if (localStorageCountry === x.alpha2) {
        localStorage.setItem("country_id", countryID);
        localStorage.setItem("currency_symbol", currencySymbol);
        setCurrencySymbol(currencySymbol);
      } else if (!localStorageCountry) {
        if (validCountry?.alpha2 === x.alpha2) {
          hasSetDefaultCountry = true;

          localStorage.setItem("country", x.alpha2);
          localStorage.setItem("country_id", countryObject.countryID);
          localStorage.setItem("currency_symbol", countryObject.currencySymbol);

          setCurrencySymbol(countryObject.currencySymbol);
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

      setCurrencySymbol(kazakhstanCountryObject.currencySymbol);
    }

    return await countries;
  };

  useQuery(["countries"], fetchCountries, {
    staleTime: Infinity,
    onError: (err) => console.log(err, "fetch countries error"),
  });

  return (
    <NavigationContainer
      theme={contextTheme === "dark" ? darkTheme : defaultTheme}
    >
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        {userPin && !hasAuthenticatedWithPin && token ? (
          <LocalAuthenticationScreen
            userPin={userPin}
            setHasAuthenticatedWithPin={setHasAuthenticatedWithPin}
          />
        ) : token && hasCheckedTmpUser ? (
          <>
            <RedirectToBiometrics />
            <AppNavigation />
          </>
        ) : (
          <AuthNavigation />
        )}
        {children}
      </View>
    </NavigationContainer>
  );
}

const RedirectToBiometrics = () => {
  const navigation = useNavigation();
  useEffect(() => {
    const checkHasDeclined = async () => {
      const hasDeclined = await localStorage.getItem("has-declined-biometrics");
      const userPin = await localStorage.getItem("pin-code");
      const hasBiometrics = await localStorage.getItem("biometrics-enabled");

      if (!hasDeclined && !userPin && !hasBiometrics) {
        navigation.navigate("SetUpBiometrics", { goBackOnSkip: true });
      }
    };
    checkHasDeclined();
  }, []);
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
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATION
      );

      if (!alreadyGranted) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATION
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

  const hasPermission = await askForPermissions();
  if (hasPermission) {
    token = await messaging().getToken();
  }
  return token;
};

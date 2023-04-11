import React, { useContext, useEffect, useState } from "react";
import { Platform, PermissionsAndroid } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import messaging from "@react-native-firebase/messaging";

import { AppNavigation } from "./AppNavigation";
import { AuthNavigation } from "./AuthNavigation";

import { LocalAuthenticationScreen } from "#screens";
import { useAddPushNotificationToken, useGetClientData } from "#hooks";
import { countrySvc, localStorage, Context } from "#services";

import { getCountryFromTimezone } from "#utils";

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

export function Navigation() {
  const [hasSavedPushToken, setHasSavedPushToken] = useState(false);
  const [hasAuthenticatedWithPin, setHasAuthenticatedWithPin] = useState(false);

  const { token, setCurrencySymbol, isTmpUser, userPin, hasCheckedTmpUser } =
    useContext(Context);

  const getClientDataEnabled = !!(
    (isTmpUser === false ? true : false) && token
  );
  const clientDataQuery = useGetClientData(getClientDataEnabled);
  const clientData = isTmpUser ? {} : clientDataQuery[0].data;

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
    <NavigationContainer>
      {userPin && !hasAuthenticatedWithPin ? (
        <LocalAuthenticationScreen
          userPin={userPin}
          setHasAuthenticatedWithPin={setHasAuthenticatedWithPin}
        />
      ) : token && hasCheckedTmpUser ? (
        <AppNavigation />
      ) : (
        <AuthNavigation />
      )}
    </NavigationContainer>
  );
}

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
    await messaging().registerDeviceForRemoteMessages();
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

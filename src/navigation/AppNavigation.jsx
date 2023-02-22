import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { TabNavigation } from "./TabNavigation";

import {
  FAQ,
  UserProfile,
  UserDetails,
  PrivacyPolicy,
  ContactUs,
  Checkout,
  PlatformRating,
  SelectProvider,
  ProviderOverview,
  SharePlatform,
  NotificationPreferences,
  SOSCenter,
  Articles,
  ArticleInformation,
  Passcode,
  ActivityHistory,
  RegisterAboutYou,
  RegisterSupport,
  Consultation,
  Notifications,
  MoodTracker,
  PaymentHistory,
  ChangePasscode,
} from "#screens";

import { Context } from "#services";

const Stack = createStackNavigator();

export const AppNavigation = () => {
  const { initialRouteName } = useContext(Context);
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRouteName}
    >
      <Stack.Screen name="RegisterAboutYou" component={RegisterAboutYou} />
      <Stack.Screen
        options={{ gestureEnabled: false }}
        name="TabNavigation"
        component={TabNavigation}
      />
      <Stack.Screen name="RegisterSupport" component={RegisterSupport} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="Checkout" component={Checkout} />
      <Stack.Screen name="Consultation" component={Consultation} />
      <Stack.Screen name="UserDetails" component={UserDetails} />
      <Stack.Screen name="SelectProvider" component={SelectProvider} />
      <Stack.Screen name="Articles" component={Articles} />
      <Stack.Screen name="FAQ" component={FAQ} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
      <Stack.Screen name="ContactUs" component={ContactUs} />
      <Stack.Screen name="PlatformRating" component={PlatformRating} />
      <Stack.Screen name="ProviderOverview" component={ProviderOverview} />
      <Stack.Screen name="SharePlatform" component={SharePlatform} />
      <Stack.Screen
        name="NotificationPreferences"
        component={NotificationPreferences}
      />
      <Stack.Screen name="SOSCenter" component={SOSCenter} />
      <Stack.Screen name="ArticleInformation" component={ArticleInformation} />
      <Stack.Screen name="Passcode" component={Passcode} />
      <Stack.Screen name="ActivityHistory" component={ActivityHistory} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="MoodTracker" component={MoodTracker} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistory} />
      <Stack.Screen name="ChangePasscode" component={ChangePasscode} />
    </Stack.Navigator>
  );
};

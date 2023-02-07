import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";

import {
  FAQ,
  UserProfile,
  UserDetails,
  PrivacyPolicy,
  ContactUs,
  PlatformRating,
  SelectProvider,
  ProviderOverview,
  SharePlatform,
  NotificationPreferences,
  SOSCenter,
  InformationalPortal,
  Articles,
  ArticleInformation,
  Dashboard,
  Consultations,
  Passcode,
  ActivityHistory,
  RegisterAboutYou,
  RegisterSupport,
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
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="RegisterAboutYou" component={RegisterAboutYou} />
      <Stack.Screen name="RegisterSupport" component={RegisterSupport} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="UserDetails" component={UserDetails} />
      <Stack.Screen name="SelectProvider" component={SelectProvider} />
      <Stack.Screen
        name="InformationalPortal"
        component={InformationalPortal}
      />
      <Stack.Screen name="Consultations" component={Consultations} />
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
    </Stack.Navigator>
  );
};

import React from "react";
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
} from "#screens";

const Stack = createStackNavigator();

export const AppNavigation = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Consultations" component={Consultations} />
      <Stack.Screen
        name="InformationalPortal"
        component={InformationalPortal}
      />
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="Articles" component={Articles} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="UserDetails" component={UserDetails} />
      <Stack.Screen name="FAQ" component={FAQ} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
      <Stack.Screen name="ContactUs" component={ContactUs} />
      <Stack.Screen name="PlatformRating" component={PlatformRating} />
      <Stack.Screen name="SelectProvider" component={SelectProvider} />
      <Stack.Screen name="ProviderOverview" component={ProviderOverview} />
      <Stack.Screen name="SharePlatform" component={SharePlatform} />
      <Stack.Screen
        name="NotificationPreferences"
        component={NotificationPreferences}
      />
      <Stack.Screen name="SOSCenter" component={SOSCenter} />
      <Stack.Screen name="ArticleInformation" component={ArticleInformation} />
    </Stack.Navigator>
  );
};

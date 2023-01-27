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
} from "#screens";

const Stack = createStackNavigator();

export const AppNavigation = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="UserDetails" component={UserDetails} />
      <Stack.Screen name="FAQ" component={FAQ} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
      <Stack.Screen name="ContactUs" component={ContactUs} />
      <Stack.Screen name="PlatformRating" component={PlatformRating} />
      <Stack.Screen name="SelectProvider" component={SelectProvider} />
      <Stack.Screen name="ProviderOverview" component={ProviderOverview} />
      <Stack.Screen name="SharePlatform" component={SharePlatform} />
    </Stack.Navigator>
  );
};

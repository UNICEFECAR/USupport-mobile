import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import {
  FAQ,
  UserProfile,
  UserDetails,
  PrivacyPolicy,
  ContactUs,
  InformationalPortal,
  Articles,
  ArticleInformation,
  Dashboard,
} from "#screens";

const Stack = createStackNavigator();

export const AppNavigation = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
      <Stack.Screen name="ArticleInformation" component={ArticleInformation} />
    </Stack.Navigator>
  );
};

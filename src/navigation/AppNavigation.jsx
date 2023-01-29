import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import {
  FAQ,
  UserProfile,
  UserDetails,
  PrivacyPolicy,
  ContactUs,
  Checkout,
} from "#screens";

const Stack = createStackNavigator();

export const AppNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName="UserProfile"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="Checkout" component={Checkout} />
      <Stack.Screen name="UserDetails" component={UserDetails} />
      <Stack.Screen name="FAQ" component={FAQ} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
      <Stack.Screen name="ContactUs" component={ContactUs} />
    </Stack.Navigator>
  );
};

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import {
  Welcome,
  RegisterAnonymous,
  RegisterEmail,
  Login,
  RegisterPreview,
  ForgotPassword,
} from "#screens";

const Stack = createStackNavigator();

export const AuthNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Welcome"
    >
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="RegisterPreview" component={RegisterPreview} />
      <Stack.Screen name="RegisterEmail" component={RegisterEmail} />
      <Stack.Screen name="RegisterAnonymous" component={RegisterAnonymous} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
};

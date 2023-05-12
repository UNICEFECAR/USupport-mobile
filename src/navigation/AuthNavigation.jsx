import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";

import {
  Welcome,
  RegisterAnonymous,
  RegisterEmail,
  Login,
  RegisterPreview,
  ForgotPassword,
  PrivacyPolicy,
} from "#screens";

import { Context } from "#services";

const Stack = createStackNavigator();

export const AuthNavigation = () => {
  const { initialAuthRouteName } = useContext(Context);
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialAuthRouteName}
    >
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="RegisterPreview" component={RegisterPreview} />
      <Stack.Screen name="RegisterEmail" component={RegisterEmail} />
      <Stack.Screen name="RegisterAnonymous" component={RegisterAnonymous} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
    </Stack.Navigator>
  );
};

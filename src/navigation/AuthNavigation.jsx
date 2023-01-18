import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import { Welcome, RegisterAnonymous, RegisterEmail, Login } from "#screens";

const Stack = createStackNavigator();

export const AuthNavigation = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="RegisterEmail" component={RegisterEmail} />
      <Stack.Screen name="RegisterAnonymous" component={RegisterAnonymous} />
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
};

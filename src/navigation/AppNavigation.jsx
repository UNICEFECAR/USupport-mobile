import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import { FAQ } from "#screens";

const Stack = createStackNavigator();

export const AppNavigation = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FAQ" component={FAQ} />
    </Stack.Navigator>
  );
};

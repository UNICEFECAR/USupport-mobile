import React from "react";

import { Screen } from "#components";
import { RegisterAboutYou as RegisterAboutYouBlock } from "#blocks";

/**
 * RegisterAboutYou
 *
 * RegisterAboutYou page
 *
 * @returns {JSX.Element}
 */
export const RegisterAboutYou = ({ navigation }) => {
  return (
    <Screen hasEmergencyButton={false}>
      <RegisterAboutYouBlock navigation={navigation} />
    </Screen>
  );
};

import React from "react";

import { Screen } from "#components";
import { Passcode as PasscodeBlock } from "#blocks";

/**
 * Passcode
 *
 * Passcode and Biometrics screen
 *
 * @returns {JSX.Element}
 */
export const Passcode = ({ navigation }) => {
  return (
    <Screen>
      <PasscodeBlock navigation={navigation} />
    </Screen>
  );
};

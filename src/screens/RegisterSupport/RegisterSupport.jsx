import React from "react";

import { Screen } from "#components";
import { RegisterSupport as RegisterSupportBlock } from "#blocks";

/**
 * RegisterSupport
 *
 * RegisterSupport page
 *
 * @returns {JSX.Element}
 */
export const RegisterSupport = ({ navigation }) => {
  return (
    <Screen hasEmergencyButton={false}>
      <RegisterSupportBlock navigation={navigation} />
    </Screen>
  );
};

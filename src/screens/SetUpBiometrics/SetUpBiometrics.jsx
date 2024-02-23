import React from "react";

import { Screen } from "#components";
import { SetUpBiometrics as SetUpBiometricsBlock } from "#blocks";

export const SetUpBiometrics = ({ navigation }) => {
  return (
    <Screen hasEmergencyButton={false}>
      <SetUpBiometricsBlock navigation={navigation} />
    </Screen>
  );
};

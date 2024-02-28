import React from "react";

import { Screen } from "#components";
import { SetUpBiometrics as SetUpBiometricsBlock } from "#blocks";

export const SetUpBiometrics = ({ navigation, route }) => {
  const { goBackOnSkip } = route.params;

  return (
    <Screen hasEmergencyButton={false}>
      <SetUpBiometricsBlock
        navigation={navigation}
        goBackOnSkip={goBackOnSkip}
      />
    </Screen>
  );
};

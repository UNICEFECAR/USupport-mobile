import React, { useContext } from "react";

import { Screen } from "#components";
import { SetUpBiometrics as SetUpBiometricsBlock } from "#blocks";
import { Context } from "#services";

export const SetUpBiometrics = ({ navigation, route }) => {
  const goBackOnSkip = route.params?.goBackOnSkip || false;
  const { requireBiometricsSetup } = useContext(Context);
  const mandatory = route.params?.mandatory || requireBiometricsSetup;

  return (
    <Screen hasEmergencyButton={false}>
      <SetUpBiometricsBlock
        navigation={navigation}
        goBackOnSkip={goBackOnSkip}
        mandatory={mandatory}
      />
    </Screen>
  );
};

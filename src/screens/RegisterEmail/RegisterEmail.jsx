import React from "react";
import { Screen } from "#components";
import { RegisterEmail as RegisterEmailBlock } from "#blocks";

export const RegisterEmail = () => {
  return (
    <Screen hasEmergencyButton={false}>
      <RegisterEmailBlock />
    </Screen>
  );
};

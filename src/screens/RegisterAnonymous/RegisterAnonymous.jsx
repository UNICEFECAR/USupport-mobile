import React from "react";
import { RegisterAnonymous as RegisterAnonymousBlock } from "#blocks";

import { Screen } from "#components";

export const RegisterAnonymous = () => {
  return (
    <Screen hasEmergencyButton={false}>
      <RegisterAnonymousBlock />
    </Screen>
  );
};

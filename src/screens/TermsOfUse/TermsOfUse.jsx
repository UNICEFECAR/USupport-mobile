import React from "react";

import { Screen } from "#components";
import { TermsOfUse as TermsOfUseBlock } from "#blocks";

/**
 * TermsOfUse
 *
 * TermsOfUse Page
 *
 * @returns {JSX.Element}
 */
export const TermsOfUse = ({ navigation }) => {
  return (
    <Screen>
      <TermsOfUseBlock navigation={navigation} />
    </Screen>
  );
};

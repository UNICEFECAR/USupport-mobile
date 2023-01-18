import React from "react";
import { Screen } from "#components";
import { PrivacyPolicy as PrivacyPolicyBlock } from "#blocks";

/**
 * PrivacyPolicy
 *
 * Privacy Policy Page
 *
 * @returns {JSX.Element}
 */
export const PrivacyPolicy = ({ navigation }) => {
  return (
    <Screen>
      <PrivacyPolicyBlock navigation={navigation} />
    </Screen>
  );
};

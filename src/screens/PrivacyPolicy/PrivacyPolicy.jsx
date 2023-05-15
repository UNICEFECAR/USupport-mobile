import React, { useContext } from "react";
import { Screen } from "#components";
import { PrivacyPolicy as PrivacyPolicyBlock } from "#blocks";
import { Context } from "#services";

/**
 * PrivacyPolicy
 *
 * Privacy Policy Page
 *
 * @returns {JSX.Element}
 */
export const PrivacyPolicy = ({ navigation }) => {
  const { token } = useContext(Context);
  return (
    <Screen hasEmergencyButton={!!token}>
      <PrivacyPolicyBlock navigation={navigation} />
    </Screen>
  );
};

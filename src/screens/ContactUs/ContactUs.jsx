import React from "react";
import { ContactUs as ContactUsBlock } from "#blocks";
import { Screen } from "#components";

/**
 * ContactUs
 *
 * Contact us page
 *
 * @returns {JSX.Element}
 */
export const ContactUs = ({ navigation }) => {
  return (
    <Screen>
      <ContactUsBlock navigation={navigation} />
    </Screen>
  );
};

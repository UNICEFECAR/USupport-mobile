import React from "react";
import { Screen } from "#components";
import { FAQ as FAQBlock } from "#blocks";

/**
 * FAQ
 *
 * FAQ screen
 *
 * @returns {JSX.Element}
 */
export const FAQ = ({ navigation }) => {
  return (
    <Screen>
      <FAQBlock navigation={navigation} />
    </Screen>
  );
};

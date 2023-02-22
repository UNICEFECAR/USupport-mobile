import React from "react";
import { useTranslation } from "react-i18next";

import { Screen, Block, Heading } from "#components";
import { Passcode as PasscodeBlock } from "#blocks";

/**
 * Passcode
 *
 * Passcode and Biometrics screen
 *
 * @returns {JSX.Element}
 */
export const Passcode = ({ navigation }) => {
  const { t } = useTranslation("passcode-screen");

  return (
    <Screen>
      <Block>
        <Heading
          heading={t("heading")}
          subheading={t("subheading")}
          handleGoBack={() => navigation.goBack()}
        />
      </Block>
      <PasscodeBlock navigation={navigation} />
    </Screen>
  );
};

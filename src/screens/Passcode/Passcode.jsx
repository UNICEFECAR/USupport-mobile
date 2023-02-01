import React from "react";
import { useTranslation } from "react-i18next";

import { Screen, Block, Heading } from "#components";
import { Passcode as PasscodeBlock } from "#blocks";

export const Passcode = ({ navigation }) => {
  const { t } = useTranslation("passcode-screen");

  /**
   * Passcode
   *
   * Passcode and Biometrics screen
   *
   * @returns {JSX.Element}
   */
  return (
    <Screen>
      <Block>
        <Heading
          heading={t("heading")}
          subheading={t("subheading")}
          handleGoBack={() => navigation.goBack()}
        />
      </Block>
      <PasscodeBlock />
    </Screen>
  );
};

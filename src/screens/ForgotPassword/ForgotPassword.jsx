import React from "react";
import { useTranslation } from "react-i18next";

import { Screen, Block, Heading } from "#components";
import { ForgotPassword as ForgotPasswordBlock } from "#blocks";

/**
 * ForgotPassword
 *
 * ForgotPassword screen
 *
 * @return {jsx}
 */
export const ForgotPassword = ({ navigation }) => {
  const { t } = useTranslation("forgot-password-screen");

  return (
    <Screen hasEmergencyButton={false}>
      <Block>
        <Heading heading={t("heading")} handleGoBack={navigation.goBack} />
      </Block>
      <ForgotPasswordBlock navigation={navigation} />
    </Screen>
  );
};

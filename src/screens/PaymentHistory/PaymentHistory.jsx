import React from "react";
import { useTranslation } from "react-i18next";

import { Screen, Block, Heading } from "#components";

import { PaymentHistory as PaymentHistoryBlock } from "#blocks";

/**
 * PaymentHistory
 *
 * PaymentHistory Screen
 *
 * @returns {JSX.Element}
 */
export const PaymentHistory = ({ navigation }) => {
  const { t } = useTranslation("payment-history-screen");

  return (
    <Screen>
      <Heading
        heading={t("heading")}
        subheading={t("subheading")}
        handleGoBack={() => navigation.goBack()}
      />
      <PaymentHistoryBlock />
    </Screen>
  );
};

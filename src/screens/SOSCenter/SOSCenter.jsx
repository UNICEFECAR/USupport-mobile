import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";

import { Screen, Heading, Block } from "#components";
import { SOSCenter as SOSCenterBlock } from "#blocks";

/**
 * SOSCenter
 *
 * SOSCenter screen
 *
 * @returns {JSX.Element}
 */
export const SOSCenter = ({ navigation }) => {
  const { t } = useTranslation("sos-center-screen");

  return (
    <Screen hasEmergencyButton={false}>
      <Heading
        heading={t("heading")}
        subheading={t("subheading")}
        handleGoBack={() => navigation.goBack()}
      />
      <ScrollView style={{ marginTop: 112 }}>
        <SOSCenterBlock />
      </ScrollView>
    </Screen>
  );
};

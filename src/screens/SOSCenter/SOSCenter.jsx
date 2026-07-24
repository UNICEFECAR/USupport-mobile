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
  const { t } = useTranslation("screens", { keyPrefix: "sos-center-screen" });

  return (
    <Screen hasEmergencyButton={false}>
      <Block>
        <Heading
          heading={t("heading")}
          subheading={t("subheading")}
          handleGoBack={() => navigation.goBack()}
        />
      </Block>
      <ScrollView>
        <SOSCenterBlock navigation={navigation} />
      </ScrollView>
    </Screen>
  );
};

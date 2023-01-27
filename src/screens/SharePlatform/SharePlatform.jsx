import React from "react";
import { useTranslation } from "react-i18next";

import { Screen, Heading, Block } from "#components";
import { SharePlatform as SharePlatformBlock } from "#blocks";

/**
 * SharePlatform
 *
 * SharePlatform page
 *
 * @returns {JSX.Element}
 */
export const SharePlatform = ({ navigation }) => {
  const { t } = useTranslation("share-platform-screen");

  return (
    <Screen>
      <Block>
        <Heading
          heading={t("heading")}
          subheading={t("subheading")}
          handleGoBack={() => navigation.goBack()}
        />
      </Block>
      <SharePlatformBlock />
    </Screen>
  );
};

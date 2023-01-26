import React from "react";
import { useTranslation } from "react-i18next";

import { PlatformRating as PlatformRatingBlock } from "#blocks";

import { Screen, Heading, Block } from "#components";

/**
 * PlatformRating
 *
 * PlatformRating screen
 *
 * @returns {JSX.Element}
 */
export const PlatformRating = ({ navigation }) => {
  const { t } = useTranslation("platfrom-rating-screen");

  return (
    <Screen>
      <Block>
        <Heading
          heading={t("heading")}
          subheading={t("subheading")}
          handleGoBack={() => navigation.goBack()}
        />
      </Block>
      <PlatformRatingBlock navigation={navigation} />
    </Screen>
  );
};

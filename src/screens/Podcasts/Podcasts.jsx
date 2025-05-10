import React from "react";
import { useTranslation } from "react-i18next";

import { Screen, Heading } from "#components";
import { Podcasts as PodcastsBlock } from "#blocks";

/**
 * Podcasts
 *
 * Podcasts screen
 *
 * @returns {JSX.Element}
 */
export const Podcasts = ({ navigation, route }) => {
  const { t } = useTranslation("podcasts-screen");
  const sort = route.params?.sort;

  let heading = t("heading_default");
  let subheading = t("subheading_default");

  switch (sort) {
    case "createdAt":
      heading = t("heading_newest");
      subheading = t("subheading_newest");
      break;
    case "view_count":
      heading = t("heading_most_viewed");
      subheading = t("subheading_most_viewed");
      break;
    default:
      break;
  }

  return (
    <Screen>
      <Heading
        heading={heading}
        subheading={subheading}
        showBackGoBackArrow={true}
        handleGoBack={() => navigation.goBack()}
      />
      <PodcastsBlock
        navigation={navigation}
        showSearch={true}
        showCategories={true}
        sort={sort}
      />
    </Screen>
  );
};

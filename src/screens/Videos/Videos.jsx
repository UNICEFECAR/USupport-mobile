import React from "react";
import { useTranslation } from "react-i18next";

import { Screen, AppText, Heading } from "#components";
import { Videos as VideosBlock } from "#blocks";

/**
 * Videos
 *
 * Videos screen
 *
 * @returns {JSX.Element}
 */
export const Videos = ({ navigation, route }) => {
  const { t } = useTranslation("screens", { keyPrefix: "videos-screen" });
  const sort = route.params?.sort;
  const initialSearchValue = route?.params?.initialSearchValue;

  let heading = t("heading_default");
  let subheading = t("subheading_default");
  let showBackGoBackArrow = false;

  switch (sort) {
    case "createdAt":
      heading = t("heading_newest");
      subheading = t("subheading_newest");
      showBackGoBackArrow = true;
      break;
    case "view_count":
      heading = t("heading_most_viewed");
      subheading = t("subheading_most_viewed");
      showBackGoBackArrow = true;
      break;
    default:
      break;
  }

  return (
    <Screen>
      <Heading
        heading={heading}
        subheading={subheading}
        showBackGoBackArrow={showBackGoBackArrow}
        handleGoBack={() => navigation.goBack()}
      />
      <VideosBlock
        navigation={navigation}
        showSearch={true}
        showCategories={true}
        sort={sort}
        initialSearchValue={initialSearchValue}
      />
    </Screen>
  );
};

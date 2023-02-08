import React from "react";
import { ScrollView } from "react-native";
import { useTranslation } from "react-i18next";

import { Screen, Heading, Block } from "#components";

import { Articles as ArticlesBlock } from "#blocks";

/**
 * Articles
 *
 * Articles screen
 *
 * @returns {JSX.Element}
 */
export const Articles = ({ navigation, route }) => {
  const { t } = useTranslation("articles-screen");

  const sort = route.params?.sort || null;

  let heading = t("heading_default");
  let subheading = t("subheading_default");
  let showBackGoBackArrow = false;

  switch (sort) {
    case "createdAt":
      heading = t("heading_newest");
      subheading = t("subheading_newest");
      showBackGoBackArrow = true;
      break;
    case "read_count":
      heading = t("heading_most_read");
      subheading = t("subheading_most_read");
      showBackGoBackArrow = true;
      break;

    default:
      break;
  }

  return (
    <Screen>
      {/* <ScrollView> */}
      <Block>
        <Heading
          heading={heading}
          subheading={subheading}
          handleGoBack={() => navigation.goBack()}
        />
      </Block>
      <ArticlesBlock navigation={navigation} route={route} />
      {/* </ScrollView> */}
    </Screen>
  );
};

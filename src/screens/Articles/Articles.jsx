import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Screen, Heading } from "#components";
import { ArticleCategories } from "#backdrops";

import { Articles as ArticlesBlock } from "#blocks";

import { appStyles } from "#styles";

/**
 * Articles
 *
 * Articles screen
 *
 * @returns {JSX.Element}
 */
export const Articles = ({ navigation, route }) => {
  const { t } = useTranslation("screens", { keyPrefix: "articles-screen" });

  let heading = t("heading_default");
  let subheading = t("subheading_default");

  const [isArticlesModalOpen, setIsArticlesModalOpen] = useState(false);

  const openArticlesModal = () => setIsArticlesModalOpen(true);
  const [allCategories, setAllCategories] = useState();
  const [selectedCategory, setSelectedCategory] = useState();

  const handleSetCategories = (categories) => {
    setAllCategories(categories);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setIsArticlesModalOpen(false);
  };

  return (
    <>
      <ArticleCategories
        isOpen={isArticlesModalOpen}
        onClose={() => setIsArticlesModalOpen(false)}
        allCategories={allCategories}
        selectedCategory={selectedCategory}
        handleCategorySelect={handleCategorySelect}
        handleSetCategories={handleSetCategories}
      />
      <Screen>
        <Heading
          heading={heading}
          subheading={subheading}
          handleGoBack={() => navigation.goBack()}
        />

        <ArticlesBlock
          navigation={navigation}
          route={route}
          openArticlesModal={openArticlesModal}
          handleSetCategories={handleSetCategories}
          handleCategorySelect={handleCategorySelect}
          selectedCategory={selectedCategory}
          allCategories={allCategories}
        />
      </Screen>
    </>
  );
};

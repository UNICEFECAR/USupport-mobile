import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, View, TouchableOpacity } from "react-native";

import { Block, AppText, Tabs, Loading, CardMedia } from "#components";

import { appStyles } from "#styles";

import { localStorage, adminSvc, cmsSvc } from "#services";

import { useEventListener } from "#hooks";

import { destructureArticleData } from "#utils";

/**
 * ArticlesDashboard
 *
 * ArticlesDashboard Block
 *
 * @return {jsx}
 */
export const ArticlesDashboard = ({ navigation }) => {
  const { t, i18n } = useTranslation("articles-dashboard");

  const [usersLanguage, setUsersLanguage] = useState(i18n.language);

  useEffect(() => {
    if (i18n.language !== usersLanguage) {
      setUsersLanguage(i18n.language);
    }
  }, [i18n.language]);

  //--------------------- Country Change Event Listener ----------------------//
  const [currentCountry, setCurrentCountry] = useState(
    localStorage.getItem("country")
  );

  const handler = useCallback(() => {
    setCurrentCountry(localStorage.getItem("country"));
  }, []);

  // Add event listener
  useEventListener("countryChanged", handler);

  //--------------------- Categories ----------------------//
  const [categories, setCategories] = useState();
  const [selectedCategory, setSelectedCategory] = useState();

  const getCategories = async () => {
    try {
      const res = await cmsSvc.getCategories(usersLanguage);
      let categoriesData = [
        { label: t("all"), value: "all", isSelected: true },
      ];
      res.data.map((category, index) =>
        categoriesData.push({
          label: category.attributes.name,
          value: category.attributes.name,
          id: category.id,
          isSelected: false,
        })
      );

      setSelectedCategory(categoriesData[0]);
      return categoriesData;
    } catch {}
  };

  const categoriesQuery = useQuery(
    ["articles-categories", usersLanguage],
    getCategories,
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setCategories([...data]);
      },
    }
  );

  const handleCategoryOnPress = (index) => {
    const categoriesCopy = [...categories];

    for (let i = 0; i < categoriesCopy.length; i++) {
      if (i === index) {
        categoriesCopy[i].isSelected = true;
        setSelectedCategory(categoriesCopy[i]);
      } else {
        categoriesCopy[i].isSelected = false;
      }
    }
    setCategories(categoriesCopy);
  };

  //--------------------- Articles ----------------------//

  const getArticlesIds = async () => {
    // Request articles ids from the master DB based for website platform
    const articlesIds = await adminSvc.getArticles();

    return articlesIds;
  };

  const articleIdsQuerry = useQuery(
    ["articleIds", currentCountry],
    getArticlesIds
  );

  //--------------------- Newest Article ----------------------//

  const getNewestArticle = async () => {
    let categoryId = "";
    if (selectedCategory?.value !== "all") {
      categoryId = selectedCategory.id;
    }

    let { data } = await cmsSvc.getArticles({
      limit: 2, // Only get the newest article
      sortBy: "createdAt", // Sort by created date
      categoryId: categoryId,
      sortOrder: "desc", // Sort in descending order
      locale: usersLanguage,
      populate: true,
      ids: articleIdsQuerry.data,
    });
    for (let i = 0; i < data.data.length; i++) {
      data.data[i] = destructureArticleData(data.data[i]);
    }

    return data.data;
  };

  const {
    data: newestArticles,
    isLoading: newestArticlesLoading,
    isFetched: isNewestArticlesFetched,
  } = useQuery(
    ["newestArticle", usersLanguage, selectedCategory, articleIdsQuerry.data],
    getNewestArticle,
    {
      onError: (error) => console.log(error),
      enabled:
        !articleIdsQuerry.isLoading &&
        articleIdsQuerry.data?.length > 0 &&
        !categoriesQuery.isLoading &&
        categoriesQuery.data?.length > 0 &&
        selectedCategory !== null,

      refetchOnWindowFocus: false,
    }
  );

  const handleRedirect = (sort) =>
    sort === "createdAt"
      ? navigation.push("Articles", { sort: "createdAt" })
      : navigation.push("Articles", { sort: "read_count" });

  return (
    <>
      {categories?.length > 1 && (
        <>
          <Block>
            <View style={styles.headingContainer}>
              <AppText namedStyle="h3">{t("heading")}</AppText>
              <TouchableOpacity onPress={() => handleRedirect("read_count")}>
                <AppText style={styles.viewAllText}>{t("view_all")}</AppText>
              </TouchableOpacity>
            </View>
          </Block>

          {categories?.length > 1 && (
            <Tabs
              options={categories}
              handleSelect={handleCategoryOnPress}
              style={styles.tabs}
            />
          )}
          {newestArticlesLoading && (
            <View style={styles.container}>
              <Loading />
            </View>
          )}

          <Block>
            <View style={styles.articlesContainer}>
              {!newestArticlesLoading &&
                newestArticles?.length > 0 &&
                categories.length > 1 &&
                newestArticles?.map((article, index) => {
                  return (
                    <CardMedia
                      style={styles.cardMedia}
                      title={article.title}
                      image={article.imageMedium}
                      description={article.description}
                      labels={article.labels}
                      creator={article.creator}
                      readingTime={article.readingTime}
                      onPress={() => {
                        navigation.push("ArticleInformation", {
                          articleId: article.id,
                        });
                      }}
                      key={index}
                    />
                  );
                })}
            </View>
            {isNewestArticlesFetched && newestArticles?.length === 0 && (
              <View style={styles.container}>
                <AppText namedStyle="h3">{t("heading_no_results")}</AppText>
              </View>
            )}
          </Block>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  headingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  container: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  tabs: { marginTop: 24, zIndex: 2 },
  viewAllText: {
    color: appStyles.colorSecondary_9749fa,
  },
  articlesContainer: { alignItems: "center" },
  cardMedia: { marginTop: 24 },
});

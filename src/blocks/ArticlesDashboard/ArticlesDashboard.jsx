import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, View, TouchableOpacity, Button } from "react-native";

import {
  Block,
  AppText,
  Tabs,
  Loading,
  CardMedia,
  TabsUnderlined,
} from "#components";

import { appStyles } from "#styles";

import { localStorage, adminSvc, cmsSvc } from "#services";

import { useEventListener } from "#hooks";

import { destructureArticleData } from "#utils";
import { Error } from "../../components/errors";

/**
 * ArticlesDashboard
 *
 * ArticlesDashboard Block
 *
 * @return {jsx}
 */
export const ArticlesDashboard = ({
  navigation,
  openArticlesModal,
  handleSetCategories,
  handleCategorySelect,
  selectCategory,
  allCategories,
}) => {
  const { t, i18n } = useTranslation("articles-dashboard");

  const [usersLanguage, setUsersLanguage] = useState(i18n.language);
  const [showAgeGroups, setShowAgeGroups] = useState(true);

  useEffect(() => {
    async function checkCountry() {
      const country = await localStorage.getItem("country");
      if (country === "PL") {
        setShowAgeGroups(false);
      }
    }
    checkCountry();
  }, []);

  useEffect(() => {
    if (i18n.language !== usersLanguage) {
      setUsersLanguage(i18n.language);
    }
  }, [i18n.language]);

  //--------------------- Age Groups ----------------------//
  const [ageGroups, setAgeGroups] = useState();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState();

  const getAgeGroups = async () => {
    try {
      const res = await cmsSvc.getAgeGroups(usersLanguage);
      const ageGroupsData = res.data.map((age, index) => ({
        label: age.attributes.name,
        id: age.id,
        isSelected: index === 0 ? true : false,
      }));
      setSelectedAgeGroup(ageGroupsData[0]);
      return ageGroupsData;
    } catch {}
  };

  const ageGroupsQuery = useQuery(["ageGroups", usersLanguage], getAgeGroups, {
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    onSuccess: (data) => {
      setAgeGroups([...data]);
    },
  });

  const handleAgeGroupOnPress = (index) => {
    const ageGroupsCopy = [...ageGroups];

    for (let i = 0; i < ageGroupsCopy.length; i++) {
      if (i === index) {
        ageGroupsCopy[i].isSelected = true;
        setSelectedAgeGroup(ageGroupsCopy[i]);
      } else {
        ageGroupsCopy[i].isSelected = false;
      }
    }

    setAgeGroups(ageGroupsCopy);
  };

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

      handleSetCategories(categoriesData);
      return categoriesData;
    } catch {}
  };

  const categoriesQuery = useQuery(
    ["articles-categories", usersLanguage],
    getCategories,
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        handleSetCategories([...data]);
      },
    }
  );

  const handleCategoryOnPress = (index) => {
    const categoriesCopy = [...allCategories];

    for (let i = 0; i < categoriesCopy.length; i++) {
      if (i === index) {
        categoriesCopy[i].isSelected = true;
        handleCategorySelect(categoriesCopy[i]);
      } else {
        categoriesCopy[i].isSelected = false;
      }
    }
    handleSetCategories(categoriesCopy);
  };

  //--------------------- Articles ----------------------//

  const getArticlesIds = async () => {
    // Request articles ids from the master DB based for website platform
    const articlesIds = await adminSvc.getArticles();

    return articlesIds;
  };

  const articleIdsQuery = useQuery(
    ["articleIds", currentCountry],
    getArticlesIds
  );

  const { isError: isArticleIdsError, isFetched: isArticleIdsFetched } =
    articleIdsQuery;

  //--------------------- Newest Article ----------------------//

  const getNewestArticle = async () => {
    let categoryId = "";
    if (selectCategory && selectCategory.value !== "all") {
      categoryId = selectCategory.id;
    }

    let { data } = await cmsSvc.getArticles({
      limit: 2, // Only get the newest article
      sortBy: "createdAt", // Sort by created date
      categoryId: categoryId,
      sortOrder: "desc", // Sort in descending order
      locale: usersLanguage,
      populate: true,
      ids: articleIdsQuery.data,
      ageGroupId: selectedAgeGroup.id,
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
    isError: isNewestArticlesError,
  } = useQuery(
    [
      "newestArticle",
      usersLanguage,
      selectCategory,
      articleIdsQuery.data,
      selectedAgeGroup,
    ],
    getNewestArticle,
    {
      onError: (error) => console.log(error),
      enabled:
        !articleIdsQuery.isLoading &&
        articleIdsQuery.data?.length > 0 &&
        !categoriesQuery.isLoading &&
        categoriesQuery.data?.length > 0 &&
        selectCategory !== null,

      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  const handleRedirect = (sort) =>
    sort === "createdAt"
      ? navigation.push("Articles", { sort: "createdAt" })
      : navigation.push("Articles", { sort: "read_count" });

  return (
    <>
      {allCategories?.length > 1 && (
        <>
          <Block style={styles.headingBlock}>
            <View style={styles.headingContainer}>
              <AppText namedStyle="h3">{t("heading")}</AppText>
              <TouchableOpacity onPress={() => handleRedirect("read_count")}>
                <AppText style={styles.viewAllText}>{t("view_all")}</AppText>
              </TouchableOpacity>
            </View>
          </Block>

          {ageGroupsQuery?.data?.length > 0 && ageGroups && showAgeGroups ? (
            <TabsUnderlined
              options={ageGroups}
              handleSelect={handleAgeGroupOnPress}
              style={{
                marginTop: 12,
              }}
            />
          ) : null}

          {allCategories?.length > 1 && (
            <Tabs
              options={allCategories}
              handleSelect={handleCategoryOnPress}
              style={styles.tabs}
              t={t}
              handleModalOpen={openArticlesModal}
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
                allCategories.length > 1 &&
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
                      categoryName={article.categoryName}
                      onPress={() => {
                        navigation.push("ArticleInformation", {
                          articleId: article.id,
                        });
                      }}
                      t={t}
                      key={index}
                    />
                  );
                })}
            </View>
            {((isNewestArticlesFetched && isNewestArticlesError) ||
              (isArticleIdsError && isArticleIdsFetched)) && (
              <View style={styles.container}>
                <Error message={t("heading_no_results")} />
              </View>
            )}
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
  articlesContainer: { alignItems: "center" },
  cardMedia: { marginTop: 24 },
  container: {
    alignItems: "center",
    height: 250,
    justifyContent: "center",
  },
  headingBlock: { paddingTop: 40 },
  headingContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tabs: { marginTop: 24, zIndex: 2 },
  viewAllText: {
    color: appStyles.colorSecondary_9749fa,
    fontFamily: appStyles.fontSemiBold,
  },
});

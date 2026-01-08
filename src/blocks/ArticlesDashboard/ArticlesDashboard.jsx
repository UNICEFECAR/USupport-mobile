import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, View } from "react-native";

import {
  Block,
  AppText,
  Tabs,
  Loading,
  CardMedia,
  TabsUnderlined,
} from "#components";

import { appStyles } from "#styles";

import { localStorage, cmsSvc, adminSvc, Context } from "#services";

import {
  useEventListener,
  useGetUserContentEngagements,
  useRecommendedArticles,
} from "#hooks";

import {
  destructureArticleData,
  checkIsLikedAndDisliked,
  getLikesAndDislikesForContent,
} from "#utils";
import { Error } from "../../components/errors";

const PL_LANGUAGE_AGE_GROUP_IDS = {
  pl: 13,
  uk: 11,
};

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
  const { t, i18n } = useTranslation("blocks", {
    keyPrefix: "articles-dashboard",
  });

  const { isTmpUser } = useContext(Context);
  const [country, setCountry] = useState();

  const [usersLanguage, setUsersLanguage] = useState(i18n.language);
  const [showAgeGroups, setShowAgeGroups] = useState(true);
  const [articlesLikes, setArticlesLikes] = useState(new Map());
  const [articlesDislikes, setArticlesDislikes] = useState(new Map());
  const [articleIdsForRatings, setArticleIdsForRatings] = useState([]);

  const selectedCategory = allCategories?.find((category) => {
    return !!category.isSelected;
  });

  const isPLCountry = country === "PL";
  const hardcodedAgeGroupId = isPLCountry
    ? PL_LANGUAGE_AGE_GROUP_IDS[usersLanguage]
    : null;
  const shouldUseHardcodedAgeGroup = typeof hardcodedAgeGroupId === "number";

  useEffect(() => {
    async function checkCountry() {
      const countryValue = await localStorage.getItem("country");
      setCountry(countryValue);
      if (countryValue === "PL") {
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

  const { data: contentEngagements } = useGetUserContentEngagements(!isTmpUser);

  //--------------------- Age Groups ----------------------//
  const [ageGroups, setAgeGroups] = useState();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState();

  const selectedAgeGroupId = selectedAgeGroup?.id;

  const getAgeGroups = async () => {
    if (shouldUseHardcodedAgeGroup) {
      const hardcodedAgeGroup = {
        label: "",
        id: hardcodedAgeGroupId,
        isSelected: true,
      };
      setSelectedAgeGroup(hardcodedAgeGroup);
      setAgeGroups([hardcodedAgeGroup]);
      return [hardcodedAgeGroup];
    }

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

  const ageGroupsQuery = useQuery(
    ["ageGroups", usersLanguage, hardcodedAgeGroupId],
    getAgeGroups,
    {
      enabled: showAgeGroups || shouldUseHardcodedAgeGroup,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      onSuccess: (data) => {
        setAgeGroups([...data]);
      },
    }
  );

  const handleAgeGroupOnPress = (index) => {
    const ageGroupsCopy = [...ageGroups];

    for (let i = 0; i < ageGroupsCopy.length; i++) {
      if (i === index) {
        if (!ageGroupsCopy[i].isSelected) {
          handleCategoryOnPress(0);
        }
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

  useQuery({
    queryKey: ["articles-ratings", usersLanguage, articleIdsForRatings],
    queryFn: async () => {
      const { likes, dislikes } = await getLikesAndDislikesForContent(
        articleIdsForRatings,
        "article"
      );

      setArticlesLikes(likes);
      setArticlesDislikes(dislikes);

      return true;
    },
    enabled: articleIdsForRatings.length > 0,
  });

  const getArticlesIds = async () => {
    // Request articles ids from the master DB based for website platform
    const articlesIds = await adminSvc.getArticles();

    if (usersLanguage === "en") {
      setArticleIdsForRatings(articlesIds);
    }

    return articlesIds;
  };

  const articleIdsQuerry = useQuery(
    ["articleIds", selectedAgeGroupId],
    getArticlesIds
  );

  const { data: articleCategoryIdsToShow } = useQuery(
    [
      "articles-category-ids",
      usersLanguage,
      articleIdsQuerry.data,
      selectedAgeGroupId,
    ],
    () =>
      cmsSvc.getArticleCategoryIds(
        usersLanguage,
        selectedAgeGroupId,
        articleIdsQuerry.data
      ),
    {
      enabled: !!articleIdsQuerry.data && !!selectedAgeGroupId,
    }
  );

  const categoriesToShow = useMemo(() => {
    if (!allCategories || !articleCategoryIdsToShow) return [];

    const filtered = allCategories.filter(
      (category) =>
        articleCategoryIdsToShow.includes(category.id) ||
        category.value === "all"
    );

    return filtered;
  }, [allCategories, articleCategoryIdsToShow]);

  const handleCategoryOnPress = (index) => {
    const categoriesCopy = [...allCategories];

    const clicked = categoriesToShow[index];
    for (let i = 0; i < categoriesCopy.length; i++) {
      const cat = categoriesCopy[i];
      if (cat.id === clicked.id) {
        cat.isSelected = true;
        handleCategorySelect(cat);
      } else {
        cat.isSelected = false;
      }
    }
    handleSetCategories(categoriesCopy);
  };

  //--------------------- Newest Article ----------------------//

  const getNewestArticle = async () => {
    let categoryId = "";
    if (selectedCategory?.value !== "all") {
      categoryId = selectedCategory.id;
    }

    const requestParams = {
      limit: 2, // Only get the newest article
      sortBy: "createdAt", // Sort by created date
      sortOrder: "desc", // Sort in descending order
      locale: usersLanguage,
      populate: true,
      ids: articleIdsQuerry.data,
    };

    if (categoryId) {
      requestParams.categoryId = categoryId;
    }

    if (shouldUseHardcodedAgeGroup) {
      requestParams.ageGroupId = hardcodedAgeGroupId;
    } else if (showAgeGroups && selectedAgeGroupId) {
      requestParams.ageGroupId = selectedAgeGroupId;
    }

    let { data } = await cmsSvc.getArticles(requestParams);
    for (let i = 0; i < data.data.length; i++) {
      data.data[i] = destructureArticleData(data.data[i]);
    }

    const ids = data.data.map((article) => article.id);
    setArticleIdsForRatings((prev) => [...prev, ...ids]);

    return data.data;
  };

  const {
    data: newestArticles,
    isLoading: newestArticlesLoading,
    isFetched: isNewestArticlesFetched,
  } = useQuery(
    [
      "newestArticle",
      usersLanguage,
      selectedCategory,
      selectedAgeGroup?.id,
      articleIdsQuerry.data,
    ],
    getNewestArticle,
    {
      onError: (error) => console.log(error),
      enabled:
        !articleIdsQuerry.isLoading &&
        articleIdsQuerry.data?.length > 0 &&
        !categoriesQuery.isLoading &&
        categoriesQuery.data?.length > 0 &&
        (isTmpUser || shouldUseHardcodedAgeGroup),

      refetchOnWindowFocus: false,
    }
  );

  const availableCategories = useMemo(() => {
    return categoriesToShow.map((category) => category.id).filter((id) => !!id);
  }, [categoriesToShow]);

  //--------------------- Use Recommended Articles Hook ----------------------//
  const {
    articles,
    loading: isArticlesLoading,
    error,
    isReady,
    readArticleIds,
  } = useRecommendedArticles({
    limit: 6, // Only show 2 articles
    ageGroupId: selectedAgeGroup?.id,
    categoryIdFilter:
      selectedCategory?.value === "all" ? null : selectedCategory?.id || null,
    sortFilter: "read_count",
    availableCategories,
    enabled: !isTmpUser,
  });

  useEffect(() => {
    if (usersLanguage !== "en") {
      const articleIds = articles.map((article) => {
        const articleData = article.data ? article.data : article;
        return articleData.id;
      });
      if (articleIds.length > 0) {
        setArticleIdsForRatings((prev) => [...prev, ...articleIds]);
      }
    }
  }, [usersLanguage, articles]);

  const articlesToTransform = isTmpUser ? newestArticles : articles;

  // Transform articles data to match expected format
  const transformedArticles = articlesToTransform
    ?.slice(0, 2)
    ?.map((article) => {
      // If article already has direct properties, use them, otherwise use article.data
      return article.data ? article.data : article;
    });

  const showLoading = isTmpUser ? newestArticlesLoading : isArticlesLoading;

  const handleRedirect = (sort) =>
    sort === "createdAt"
      ? navigation.push("Articles", { sort: "createdAt" })
      : navigation.push("Articles", { sort: "read_count" });

  return (
    <>
      <Block
        style={styles.headingBlock}
        heading={t("heading")}
        btnLabel={t("view_all")}
        btnOnPress={() => handleRedirect("read_count")}
      />
      {ageGroupsQuery?.isLoading && (
        <View style={styles.container}>
          <Loading />
        </View>
      )}
      {allCategories?.length > 1 && (
        <>
          {ageGroupsQuery?.data?.length > 0 && ageGroups && showAgeGroups ? (
            <TabsUnderlined
              options={ageGroups}
              handleSelect={handleAgeGroupOnPress}
              style={styles.tabsUnderlined}
            />
          ) : null}

          {allCategories?.length > 1 && (
            <Tabs
              options={categoriesToShow}
              handleSelect={handleCategoryOnPress}
              style={styles.tabs}
              t={t}
              handleModalOpen={openArticlesModal}
            />
          )}

          {showLoading && (
            <View style={styles.container}>
              <Loading />
            </View>
          )}

          <Block style={country === "RO" && { paddingBottom: 100 }}>
            <View style={styles.articlesContainer}>
              {!showLoading &&
                transformedArticles?.length > 0 &&
                allCategories.length > 1 &&
                transformedArticles?.map((article, index) => {
                  const articleData = article.attributes
                    ? destructureArticleData(article)
                    : article;
                  const { isLikedByUser, isDislikedByUser } =
                    checkIsLikedAndDisliked(
                      contentEngagements,
                      article.id,
                      "article"
                    );
                  return (
                    <CardMedia
                      isRead={readArticleIds.includes(article.id)}
                      style={styles.cardMedia}
                      title={articleData.title}
                      image={articleData.imageMedium || articleData.imageSmall}
                      description={articleData.description}
                      labels={articleData.labels}
                      creator={articleData.creator}
                      readingTime={articleData.readingTime}
                      categoryName={articleData.categoryName}
                      likes={articlesLikes.get(article.id) || 0}
                      dislikes={articlesDislikes.get(article.id) || 0}
                      isLikedByUser={isLikedByUser}
                      isDislikedByUser={isDislikedByUser}
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
            {error && (
              <View style={styles.container}>
                <Error message={t("heading_no_results")} />
              </View>
            )}
            {(isReady || isNewestArticlesFetched) &&
              transformedArticles?.length === 0 && (
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
  tabs: { marginTop: 24, zIndex: 2 },
  tabsUnderlined: { marginTop: 12 },
});

import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { FlashList } from "@shopify/flash-list";

import {
  Block,
  InputSearch,
  Tabs,
  CardMedia,
  AppText,
  Loading,
  TabsUnderlined,
} from "#components";
import { cmsSvc, adminSvc, localStorage, Context } from "#services";
import {
  useDebounce,
  useEventListener,
  useGetUserContentEngagements,
  useRecommendedArticles,
} from "#hooks";
import {
  destructureArticleData,
  getLikesAndDislikesForContent,
  checkIsLikedAndDisliked,
} from "#utils";
import { appStyles } from "#styles";

const PL_LANGUAGE_AGE_GROUP_IDS = {
  pl: 13,
  uk: 11,
};

/**
 * Articles
 *
 * Articles block
 *
 * @returns {JSX.Element}
 */
export const Articles = ({
  navigation,
  showSearch = true,
  showCategories = true,
  openArticlesModal,
}) => {
  const { i18n, t } = useTranslation("blocks", { keyPrefix: "articles" });
  const { isTmpUser } = useContext(Context);
  const [usersLanguage, setUsersLanguage] = useState(i18n.language);
  const [showAgeGroups, setShowAgeGroups] = useState(true);
  const [country, setCountry] = useState();
  const [articlesLikes, setArticlesLikes] = useState(new Map());
  const [articlesDislikes, setArticlesDislikes] = useState(new Map());
  const [articleIdsForRatings, setArticleIdsForRatings] = useState([]);

  const isPLCountry = country === "PL";
  const hardcodedAgeGroupId = isPLCountry
    ? PL_LANGUAGE_AGE_GROUP_IDS[usersLanguage]
    : null;
  const shouldUseHardcodedAgeGroup = typeof hardcodedAgeGroupId === "number";

  async function checkCountry() {
    const countryValue = await localStorage.getItem("country");
    setCountry(countryValue);
    if (countryValue === "PL") {
      setShowAgeGroups(false);
    }
  }

  useEffect(() => {
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
    } catch {
      return [];
    }
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

  //--------------------- Categories ----------------------//
  const [categories, setCategories] = useState();
  const [selectedCategory, setSelectedCategory] = useState();

  const getCategories = async () => {
    try {
      const res = await cmsSvc.getCategories(usersLanguage);
      let categoriesData = [
        { label: t("all"), value: "all", isSelected: true },
      ];
      res.data.map((category) =>
        categoriesData.push({
          label: category.attributes.name,
          value: category.attributes.name,
          id: category.id,
          isSelected: false,
        })
      );

      setSelectedCategory(categoriesData[0]);
      return categoriesData;
    } catch (err) {
      console.log(err);
      return [];
    }
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
    const selectedCategoryFromFiltered = categoriesToShow[index];
    if (!selectedCategoryFromFiltered) return;

    // Update all categories to set the selected one
    const categoriesCopy = [...categories];
    for (let i = 0; i < categoriesCopy.length; i++) {
      categoriesCopy[i].isSelected =
        categoriesCopy[i].id === selectedCategoryFromFiltered.id;
    }
    setCategories(categoriesCopy);
    setSelectedCategory(selectedCategoryFromFiltered);
  };
  //--------------------- Search Input ----------------------//
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500);

  const handleInputChange = (value) => {
    setSearchValue(value);
  };

  //--------------------- Country Change Event Listener ----------------------//
  const [currentCountry, setCurrentCountry] = useState(
    localStorage.getItem("country")
  );

  const handler = useCallback(() => {
    const country = localStorage.getItem("country");
    if (country !== currentCountry) {
      setCurrentCountry(country);
    }
    // setShowAgeGroups(country !== "PL");
  }, []);

  // Add event listener
  useEventListener("countryChanged", handler);

  const { data: contentEngagements } = useGetUserContentEngagements(!isTmpUser);

  const getArticlesIds = async () => {
    const articlesIds = await adminSvc.getArticles();
    if (usersLanguage === "en") {
      setArticleIdsForRatings(articlesIds);
    }
    return articlesIds;
  };

  const articleIdsQuery = useQuery(
    ["articleIds", currentCountry],
    getArticlesIds
  );

  const { data: articleCategoryIdsToShow } = useQuery(
    [
      "articles-category-ids",
      usersLanguage,
      selectedAgeGroup?.id,
      articleIdsQuery.data,
    ],
    () => {
      if (!selectedAgeGroup?.id) return [];
      return cmsSvc.getArticleCategoryIds(
        usersLanguage,
        selectedAgeGroup.id,
        articleIdsQuery.data?.length > 0 ? articleIdsQuery.data : undefined
      );
    },
    {
      enabled:
        !!selectedAgeGroup?.id &&
        !articleIdsQuery.isLoading &&
        !!articleIdsQuery.data?.length,
    }
  );

  const categoriesToShow = useMemo(() => {
    if (!categories || !articleCategoryIdsToShow) return [];

    return categories.filter(
      (category) =>
        articleCategoryIdsToShow.includes(category.id) ||
        category.value === "all"
    );
  }, [categories, articleCategoryIdsToShow]);

  const [hasMoreGuest, setHasMoreGuest] = useState(true);

  const getArticlesData = async () => {
    const ageGroupId = ageGroupsQuery.data.find((x) => x.isSelected).id;

    let categoryId = "";
    if (selectedCategory.value !== "all") {
      categoryId = selectedCategory.id;
    }

    let { data } = await cmsSvc.getArticles({
      limit: 6,
      contains: debouncedSearchValue,
      ageGroupId,
      categoryId,
      // sortBy: sort ? sort : "createdAt",
      // sortOrder: sort ? "desc" : "desc",
      locale: usersLanguage,
      populate: true,
      ids: articleIdsQuery.data,
    });

    const articles = data.data;
    const numberOfArticles = data.meta.pagination.total;

    return { articles, numberOfArticles };
  };

  const [guestArticles, setArticles] = useState();
  const [numberOfArticles, setNumberOfArticles] = useState();
  const {
    isLoading: isGuestArticlesLoading,
    isFetching: isArticlesFetching,
    isFetched: isArticlesFetched,
    fetchStatus: articlesFetchStatus,
    data: articlesQueryData,
  } = useQuery(
    [
      "articles",
      debouncedSearchValue,
      selectedAgeGroup,
      selectedCategory,
      articleIdsQuery.data,
      usersLanguage,
    ],
    getArticlesData,
    {
      enabled:
        !articleIdsQuery.isLoading &&
        !ageGroupsQuery.isLoading &&
        !categoriesQuery.isLoading &&
        categoriesQuery.data?.length > 0 &&
        ageGroupsQuery.data?.length > 0 &&
        articleIdsQuery.data?.length > 0 &&
        selectedCategory !== null &&
        selectedAgeGroup !== null,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setArticles([...data.articles]);
        setNumberOfArticles(data.numberOfArticles);
      },
    }
  );

  useEffect(() => {
    if (guestArticles) {
      setHasMoreGuest(numberOfArticles > guestArticles.length);
    }
  }, [guestArticles]);

  const getMoreArticles = async () => {
    let ageGroupId = "";
    if (ageGroups) {
      let selectedAgeGroup = ageGroups.find((o) => o.isSelected === true);
      ageGroupId = selectedAgeGroup.id;
    }

    let categoryId = null;
    if (categories) {
      let selectedCategory = categories.find((o) => o.isSelected === true);
      categoryId = selectedCategory.id;
    }

    const { data } = await cmsSvc.getArticles({
      startFrom: guestArticles?.length,
      limit: 6,
      contains: searchValue,
      ageGroupId: ageGroupId,
      categoryId,
      locale: usersLanguage,
      sortBy: sort,
      sortOrder: sort ? "desc" : null,
      populate: true,
      ids: articleIdsQuery.data,
    });

    const newArticles = data.data;

    setArticles((prevArticles) => [...(prevArticles || []), ...newArticles]);
  };

  const availableCategories = useMemo(() => {
    return categoriesToShow.map((category) => category.id).filter((id) => !!id);
  }, [categoriesToShow]);

  const {
    articles,
    loading: isArticlesLoading,
    hasMore,
    loadMore,
    isReady,
    readArticleIds,
  } = useRecommendedArticles({
    limit: 16,
    ageGroupId: selectedAgeGroup?.id,
    enabled: isTmpUser
      ? false
      : selectedAgeGroup?.id &&
        !ageGroupsQuery.isLoading &&
        availableCategories.length > 0,
    categoryIdFilter:
      selectedCategory?.value === "all" ? null : selectedCategory?.id || null,
    searchValue: debouncedSearchValue,
    availableCategories,
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
    enabled: articleIdsForRatings?.length > 0,
  });

  const articlesToTransform = isTmpUser ? guestArticles : articles;

  // Transform articles data to match expected format
  const transformedArticles = articlesToTransform?.map((article) => {
    const baseArticle = article.data ? article.data : article;
    // console.log(Object.keys(baseArticle));

    return {
      ...article,

      likes: articlesLikes.get(article.id) || 0,
      dislikes: articlesDislikes.get(article.id) || 0,
    };
  });

  let areCategoriesAndAgeGroupsReady =
    categoriesQuery?.data?.length > 1 && ageGroupsQuery?.data?.length > 0;

  const renderArticle = ({ item, index }) => {
    const articleData = destructureArticleData(item.data ? item.data : item);
    const { isLikedByUser, isDislikedByUser } = checkIsLikedAndDisliked(
      contentEngagements,
      articleData.id,
      "article"
    );
    return (
      <CardMedia
        style={styles.cardMedia}
        title={articleData.title}
        image={articleData.imageMedium || articleData.imageSmall}
        description={articleData.description}
        labels={articleData.labels}
        creator={articleData.creator}
        readingTime={articleData.readingTime}
        categoryName={articleData.categoryName}
        likes={articlesLikes.get(articleData.id) || 0}
        dislikes={articlesDislikes.get(articleData.id) || 0}
        isLikedByUser={isLikedByUser}
        isDislikedByUser={isDislikedByUser}
        isRead={readArticleIds.includes(articleData.id)}
        onPress={() => {
          navigation.push("ArticleInformation", {
            articleId: item.id || articleData.id,
          });
        }}
        t={t}
        key={index}
      />
    );
  };

  return (
    <>
      <Block style={styles.blockWithMargin}>
        {showAgeGroups &&
        categoriesQuery?.data?.length > 1 &&
        ageGroupsQuery?.data?.length > 0 &&
        ageGroups ? (
          <TabsUnderlined
            options={ageGroups}
            handleSelect={handleAgeGroupOnPress}
          />
        ) : null}

        {showSearch && areCategoriesAndAgeGroupsReady ? (
          <InputSearch
            onChange={(value) => handleInputChange(value)}
            value={searchValue}
            style={styles.searchInput}
          />
        ) : null}
      </Block>

      {showCategories &&
      areCategoriesAndAgeGroupsReady &&
      categoriesToShow &&
      categoriesToShow.length > 2 ? (
        <Tabs
          options={categoriesToShow}
          handleSelect={handleCategoryOnPress}
          style={styles.tabs}
          t={t}
          handleModalOpen={openArticlesModal}
        />
      ) : null}

      <Block style={styles.articlesBlock}>
        <View style={styles.flashListWrapper}>
          <FlashList
            estimatedItemSize={25}
            showsVerticalScrollIndicator={false}
            keyExtractor={(_item, index) => index.toString()}
            data={transformedArticles || []}
            renderItem={renderArticle}
            onEndReached={() => {
              if (!isTmpUser && hasMore) {
                loadMore();
              } else if (isTmpUser && hasMoreGuest) {
                getMoreArticles();
              }
            }}
            onEndReachedThreshold={0.2}
            ListFooterComponent={
              !isTmpUser ? (
                // Logged-in user
                isArticlesLoading && transformedArticles?.length === 0 ? (
                  <View style={styles.loadingContainer}>
                    <Loading />
                  </View>
                ) : isReady &&
                  !isArticlesLoading &&
                  transformedArticles?.length === 0 ? (
                  <View style={styles.articlesNoResultsContainer}>
                    <AppText>{t("no_results")}</AppText>
                  </View>
                ) : null
              ) : // Guest
              isGuestArticlesLoading && transformedArticles?.length === 0 ? (
                <View style={styles.loadingContainer}>
                  <Loading />
                </View>
              ) : isArticlesFetched &&
                !isGuestArticlesLoading &&
                transformedArticles?.length === 0 ? (
                <View style={styles.articlesNoResultsContainer}>
                  <AppText>{t("no_results")}</AppText>
                </View>
              ) : null
            }
            contentContainerStyle={styles.flashListWrapperWithPadding}
          />
        </View>
      </Block>
    </>
  );
};

const styles = StyleSheet.create({
  articlesBlock: {
    alignItems: "center",
    paddingBottom: 50,
  },
  articlesNoResultsContainer: { padding: 100, textAlign: "center" },
  blockWithMargin: { marginTop: 100 },
  cardMedia: { alignSelf: "center", marginTop: 24 },
  flashListWrapper: {
    height: "100%",
    paddingHorizontal: 16,
    width: appStyles.screenWidth,
  },
  flashListWrapperWithPadding: {
    height: "100%",
    paddingBottom: 200,
    paddingHorizontal: 16,
    width: appStyles.screenWidth,
  },
  loadingContainer: {
    alignItems: "center",
    paddingTop: 60,
  },
  searchInput: { alignSelf: "center", marginTop: 12 },
  tabs: { marginTop: 24, zIndex: 2 },
});

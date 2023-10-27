import React, { useState, useEffect, useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { FlashList } from "@shopify/flash-list";

import { Block, InputSearch, Tabs, CardMedia, AppText } from "#components";
import { localStorage, adminSvc, cmsSvc } from "#services";
import { useDebounce, useEventListener } from "#hooks";
import { destructureArticleData } from "#utils";
import { appStyles } from "#styles";

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
  showAgeGroups,
  sort,
  openArticlesModal,
  handleSetCategories,
  handleCategorySelect,
  selectCategory,
  allCategories,
}) => {
  const { i18n, t } = useTranslation("articles");

  const [usersLanguage, setUsersLanguage] = useState(i18n.language);

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
        handleCategorySelect([...data]);
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
  }, []);

  // Add event listener
  useEventListener("countryChanged", handler);

  //--------------------- Articles ----------------------//
  const getArticlesIds = async () => {
    const articlesIds = await adminSvc.getArticles();

    return articlesIds;
  };

  const articleIdsQuery = useQuery(
    ["articleIds", currentCountry],
    getArticlesIds
  );

  const [hasMore, setHasMore] = useState(true);

  const getArticlesData = async () => {
    const ageGroupId = ageGroupsQuery.data.find((x) => x.isSelected).id;

    let categoryId = "";
    if (selectCategory.value !== "all") {
      categoryId = selectCategory.id;
    }

    let { data } = await cmsSvc.getArticles({
      limit: 6,
      contains: debouncedSearchValue,
      ageGroupId,
      categoryId,
      sortBy: sort ? sort : null,
      sortOrder: sort ? "desc" : null,
      locale: usersLanguage,
      populate: true,
      ids: articleIdsQuery.data,
    });

    const articles = data.data;
    const numberOfArticles = data.meta.pagination.total;

    return { articles, numberOfArticles };
  };

  const [articles, setArticles] = useState();
  const [numberOfArticles, setNumberOfArticles] = useState();
  const {
    isLoading: isArticlesLoading,
    isFetching: isArticlesFetching,
    isFetched: isArticlesFetched,
    fetchStatus: articlesFetchStatus,
    data: articlesQueryData,
  } = useQuery(
    [
      "articles",
      debouncedSearchValue,
      selectedAgeGroup,
      selectCategory,
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
        selectCategory !== null &&
        selectedAgeGroup !== null,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setArticles([...data.articles]);
        setNumberOfArticles(data.numberOfArticles);
      },
    }
  );

  useEffect(() => {
    if (articles) {
      setHasMore(numberOfArticles > articles.length);
    }
  }, [articles]);

  const getMoreArticles = async () => {
    if (!articles) return;
    let ageGroupId = "";
    if (ageGroups) {
      let selectedAgeGroup = ageGroups.find((o) => o.isSelected === true);
      ageGroupId = selectedAgeGroup.id;
    }

    let categoryId = "";
    if (allCategories) {
      let selectedCategory = allCategories.find((o) => o.isSelected === true);
      categoryId = selectedCategory.id;
    }

    const { data } = await cmsSvc.getArticles({
      startFrom: articles?.length,
      limit: 6,
      contains: searchValue,
      ageGroupId: ageGroupId,
      categoryId: null,
      locale: usersLanguage,
      sortBy: sort,
      sortOrder: sort ? "desc" : null,
      populate: true,
      ids: articleIdsQuery.data,
    });

    const newArticles = data.data;

    setArticles((prevArticles) => [...prevArticles, ...newArticles]);
  };

  let areCategoriesAndAgeGroupsReady =
    categoriesQuery?.data?.length > 1 && ageGroupsQuery?.data?.length > 0;

  const renderArticle = ({ item, index }) => {
    const articleData = destructureArticleData(item);
    return (
      <CardMedia
        style={styles.cardMedia}
        title={articleData.title}
        image={articleData.imageMedium}
        description={articleData.description}
        labels={articleData.labels}
        creator={articleData.creator}
        readingTime={articleData.readingTime}
        categoryName={articleData.categoryName}
        onPress={() => {
          navigation.push("ArticleInformation", {
            articleId: item.id,
          });
        }}
        t={t}
        key={index}
      />
    );
  };

  return (
    <>
      <Block style={{ marginTop: 100 }}>
        {showAgeGroups &&
        categoriesQuery?.data.length > 1 &&
        ageGroupsQuery?.data.length > 0 &&
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

      {showCategories && areCategoriesAndAgeGroupsReady && allCategories ? (
        <Tabs
          options={allCategories}
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
            keyExtractor={(item, index) => index.toString()}
            data={articles || []}
            renderItem={renderArticle}
            onEndReached={getMoreArticles}
            onEndReachedThreshold={0.2}
            contentContainerStyle={{
              paddingBottom: 200,
            }}
          />
        </View>
        {!articles?.length &&
        !isArticlesLoading &&
        !isArticlesFetching &&
        categoriesQuery?.data?.length > 1 &&
        ageGroupsQuery?.data?.length > 0 ? (
          <View style={styles.articlesNoResultsContainer}>
            <AppText>{t("no_results")}</AppText>
          </View>
        ) : null}
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
  cardMedia: { alignSelf: "center", marginTop: 24 },
  flashListWrapper: {
    height: "100%",
    paddingHorizontal: 16,
    width: appStyles.screenWidth,
  },
  searchInput: { alignSelf: "center", marginTop: 24 },
  tabs: { marginTop: 24, zIndex: 2 },
});

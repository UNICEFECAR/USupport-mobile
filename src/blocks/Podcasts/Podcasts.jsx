import React, { useState, useEffect, useCallback, useContext } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import {
  Block,
  AppText,
  Loading,
  CardMedia,
  InputSearch,
  Tabs,
} from "#components";

import {
  destructurePodcastData,
  getLikesAndDislikesForContent,
  isLikedOrDislikedByUser,
} from "#utils";

import {
  useEventListener,
  useGetUserContentEngagements,
  useDebounce,
} from "#hooks";

import { localStorage, adminSvc, cmsSvc, Context } from "#services";

/**
 * Podcasts
 *
 * Podcasts block
 *
 * @returns {JSX.Element}
 */
export const Podcasts = ({
  navigation,
  showSearch,
  showCategories,
  sort,
  initialSearchValue = "",
  externalSearchValue,
  topPadding = 94,
}) => {
  const { t, i18n } = useTranslation("blocks", { keyPrefix: "videos" });
  const { isTmpUser } = useContext(Context);
  const [usersLanguage, setUsersLanguage] = useState(i18n.language);
  const [podcastsLikes, setPodcastsLikes] = useState(new Map());
  const [podcastsDislikes, setPodcastsDislikes] = useState(new Map());

  useEffect(() => {
    if (i18n.language !== usersLanguage) {
      setUsersLanguage(i18n.language);
    }
  }, [i18n.language]);

  const { data: contentEngagements } = useGetUserContentEngagements(!isTmpUser);

  //--------------------- Country Change Event Listener ----------------------//
  const [currentCountry, setCurrentCountry] = useState();
  useEffect(() => {
    localStorage.getItem("country").then((country) => {
      setCurrentCountry(country || "KZ");
    });
  }, []);

  const handler = useCallback(() => {
    localStorage
      .getItem("country")
      .then((country) => setCurrentCountry(country || "KZ"));
  }, []);

  // Add event listener
  useEventListener("countryChanged", handler);

  //--------------------- Categories ----------------------//
  const [categories, setCategories] = useState();
  const [selectedCategory, setSelectedCategory] = useState();

  //--------------------- Podcasts ----------------------//
  const getPodcastsIds = async () => {
    const podcastIds = await adminSvc.getPodcasts();
    return podcastIds;
  };

  const podcastIdsQuery = useQuery(
    ["podcastIds", currentCountry],
    getPodcastsIds
  );

  const getCategories = async () => {
    try {
      // First get category IDs that have podcasts
      const categoryIdsWithPodcasts = await cmsSvc.getPodcastCategoryIds(
        usersLanguage,
        podcastIdsQuery.data
      );

      // If no categories have podcasts, return empty array with "all" option
      if (!categoryIdsWithPodcasts || categoryIdsWithPodcasts.length === 0) {
        const categoriesData = [
          { label: t("all"), value: "all", isSelected: true },
        ];
        setSelectedCategory(categoriesData[0]);
        return categoriesData;
      }

      // Get all categories
      const res = await cmsSvc.getCategories(usersLanguage);

      // Filter categories to only include those that have podcasts
      const filteredCategories = res.data.filter((category) =>
        categoryIdsWithPodcasts.includes(category.id)
      );

      let categoriesData = [
        { label: t("all"), value: "all", isSelected: true },
      ];
      filteredCategories.map((category) =>
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
    ["podcasts-categories", usersLanguage, podcastIdsQuery.data],
    getCategories,
    {
      enabled: !!podcastIdsQuery.data && podcastIdsQuery.data.length > 0,
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

  //--------------------- Search Input ----------------------//
  const [searchValue, setSearchValue] = useState(initialSearchValue || "");
  const internalDebouncedSearchValue = useDebounce(searchValue, 500);

  const debouncedSearchValue =
    externalSearchValue !== undefined
      ? externalSearchValue
      : internalDebouncedSearchValue;
  const hasSearch = !!debouncedSearchValue?.trim();

  useEffect(() => {
    setSearchValue(initialSearchValue || "");
  }, [initialSearchValue]);

  const handleInputChange = (value) => {
    setSearchValue(value);
  };

  //--------------------- Podcasts ----------------------//
  const getPodcastsData = async () => {
    let categoryId = "";
    if (selectedCategory && selectedCategory.value !== "all") {
      categoryId = selectedCategory.id;
    }

    let { data } = await cmsSvc.getPodcasts({
      limit: 50, // Get all podcasts instead of paginating
      contains: debouncedSearchValue,
      categoryId,
      sortBy: sort,
      sortOrder: sort ? "desc" : null,
      locale: usersLanguage,
      populate: true,
      ids: podcastIdsQuery.data,
    });

    // Destructure podcast data with async handling
    const podcasts = data.data || [];
    const destructuredPodcasts = await Promise.all(
      podcasts.map((podcast) => destructurePodcastData(podcast))
    );
    return destructuredPodcasts;
  };

  const {
    data: podcasts,
    isLoading: isPodcastsLoading,
    isFetching: isPodcastsFetching,
    isFetched: isPodcastsFetched,
    fetchStatus: podcastsFetchStatus,
  } = useQuery(
    [
      "podcasts",
      debouncedSearchValue,
      selectedCategory,
      podcastIdsQuery.data,
      usersLanguage,
      sort,
    ],
    getPodcastsData,
    {
      enabled:
        !podcastIdsQuery.isLoading &&
        !categoriesQuery.isLoading &&
        categoriesQuery.data?.length > 0 &&
        podcastIdsQuery.data?.length > 0 &&
        selectedCategory !== null,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    async function getPodcastsRatings() {
      const podcastIds = podcasts.reduce((acc, podcast) => {
        if (
          !podcastsLikes.has(podcast.id) &&
          !podcastsDislikes.has(podcast.id)
        ) {
          acc.push(podcast.id);
        }
        return acc;
      }, []);

      if (!podcastIds.length) return;

      const { likes, dislikes } = await getLikesAndDislikesForContent(
        podcastIds,
        "podcast"
      );

      setPodcastsLikes((prevLikes) => {
        return new Map([...prevLikes, ...likes]);
      });
      setPodcastsDislikes((prevDislikes) => {
        return new Map([...prevDislikes, ...dislikes]);
      });
    }

    getPodcastsRatings();
  }, [podcasts, usersLanguage]);

  let areCategoriesReady = categoriesQuery?.data?.length > 1;

  return (
    <Block style={[styles.podcastsBlock, { paddingTop: topPadding }]}>
      <ScrollView>
        {showSearch && areCategoriesReady && (
          <View style={styles.searchContainer}>
            <InputSearch onChangeText={handleInputChange} value={searchValue} />
          </View>
        )}

        {showCategories &&
          !hasSearch &&
          areCategoriesReady &&
          categories &&
          categories.length > 2 && (
            <View style={styles.categoriesContainer}>
              <Tabs
                options={categories}
                handleSelect={handleCategoryOnPress}
                t={t}
              />
            </View>
          )}
        <View
          style={{
            paddingHorizontal: 16,
          }}
        >
          {podcasts?.length > 0 &&
            areCategoriesReady &&
            !isPodcastsLoading &&
            !isPodcastsFetching && (
              <View style={styles.podcastsContainer}>
                {podcasts?.map((podcast, index) => {
                  const { isLiked, isDisliked } = isLikedOrDislikedByUser({
                    contentType: "podcast",
                    contentData: podcast,
                    userEngagements: contentEngagements,
                  });
                  const podcastData = podcast; // Already destructured in getPodcastsData
                  return (
                    <CardMedia
                      key={index}
                      title={podcastData.title}
                      image={podcastData.imageMedium || podcastData.imageSmall}
                      description={podcastData.description}
                      labels={podcastData.labels}
                      categoryName={podcastData.categoryName}
                      creator={podcastData.creator}
                      likes={podcastsLikes.get(podcastData.id) || 0}
                      dislikes={podcastsDislikes.get(podcastData.id) || 0}
                      isLikedByUser={isLiked}
                      isDislikedByUser={isDisliked}
                      contentType="podcasts"
                      t={t}
                      onPress={() => {
                        navigation.push("PodcastInformation", {
                          podcastId: podcastData.id,
                        });
                      }}
                      style={styles.podcastCard}
                    />
                  );
                })}
              </View>
            )}

          {!podcasts?.length &&
            !isPodcastsLoading &&
            !isPodcastsFetching &&
            categoriesQuery?.data?.length > 0 && (
              <View style={styles.noResultsContainer}>
                <AppText>{t("no_results")}</AppText>
              </View>
            )}

          {(isPodcastsFetching ||
            podcastIdsQuery.isLoading ||
            podcastIdsQuery.isFetching) && (
            <View style={styles.loadingContainer}>
              <Loading style={styles.loading} />
            </View>
          )}

          {podcastIdsQuery.isFetched &&
            (isPodcastsFetched || podcastsFetchStatus === "idle") &&
            !podcasts && (
              <View style={styles.noResultsContainer}>
                <AppText namedStyle="h3">{t("could_not_load_content")}</AppText>
              </View>
            )}
        </View>
      </ScrollView>
    </Block>
  );
};

const styles = StyleSheet.create({
  podcastsBlock: {
    flex: 1,
    paddingTop: 94,
    paddingHorizontal: 0,
  },
  searchContainer: {
    marginBottom: 24,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  podcastsContainer: {
    alignItems: "center",
  },
  podcastCard: {
    marginBottom: 24,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 220,
  },
  loading: {
    alignSelf: "center",
  },
});

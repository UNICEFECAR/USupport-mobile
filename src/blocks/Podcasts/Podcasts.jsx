import React, { useState, useEffect, useCallback } from "react";
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

import { destructurePodcastData } from "#utils";

import {
  useEventListener,
  useGetUserContentRatings,
  useDebounce,
} from "#hooks";

import { localStorage, adminSvc, cmsSvc } from "#services";

/**
 * Podcasts
 *
 * Podcasts block
 *
 * @returns {JSX.Element}
 */
export const Podcasts = ({ navigation, showSearch, showCategories, sort }) => {
  const { t, i18n } = useTranslation("videos");

  const [usersLanguage, setUsersLanguage] = useState(i18n.language);

  useEffect(() => {
    if (i18n.language !== usersLanguage) {
      setUsersLanguage(i18n.language);
    }
  }, [i18n.language]);

  const { data: contentRatings } = useGetUserContentRatings();

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
    ["podcasts-categories", usersLanguage],
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

  //--------------------- Search Input ----------------------//
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500);

  const handleInputChange = (value) => {
    setSearchValue(value);
  };

  //--------------------- Podcasts ----------------------//
  const getPodcastsIds = async () => {
    const podcastIds = await adminSvc.getPodcasts();
    return podcastIds;
  };

  const podcastIdsQuery = useQuery(
    ["podcastIds", currentCountry],
    getPodcastsIds
  );

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

    return data.data || [];
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

  let areCategoriesReady = categoriesQuery?.data?.length > 1;

  return (
    <Block style={styles.podcastsBlock}>
      <ScrollView>
        {showSearch && areCategoriesReady && (
          <View style={styles.searchContainer}>
            <InputSearch onChangeText={handleInputChange} value={searchValue} />
          </View>
        )}

        {showCategories && areCategoriesReady && categories && (
          <View style={styles.categoriesContainer}>
            <Tabs
              options={categories}
              handleSelect={handleCategoryOnPress}
              t={t}
            />
          </View>
        )}

        {podcasts?.length > 0 &&
          areCategoriesReady &&
          !isPodcastsLoading &&
          !isPodcastsFetching && (
            <View style={styles.podcastsContainer}>
              {podcasts?.map((podcast, index) => {
                const isLikedByUser = contentRatings?.some(
                  (rating) =>
                    rating.content_id === podcast.id &&
                    rating.content_type === "podcast" &&
                    rating.positive === true
                );
                const isDislikedByUser = contentRatings?.some(
                  (rating) =>
                    rating.content_id === podcast.id &&
                    rating.content_type === "podcast" &&
                    rating.positive === false
                );
                const podcastData = destructurePodcastData(podcast);
                return (
                  <CardMedia
                    key={index}
                    title={podcastData.title}
                    image={podcastData.imageMedium || podcastData.imageSmall}
                    description={podcastData.description}
                    labels={podcastData.labels}
                    categoryName={podcastData.categoryName}
                    creator={podcastData.creator}
                    likes={podcastData.likes}
                    dislikes={podcastData.dislikes}
                    isLikedByUser={isLikedByUser}
                    isDislikedByUser={isDislikedByUser}
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
      </ScrollView>
    </Block>
  );
};

const styles = StyleSheet.create({
  podcastsBlock: {
    flex: 1,
    paddingTop: 94,
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

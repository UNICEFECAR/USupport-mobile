import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
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
import { PodcastModal } from "#backdrops";

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
 * Behaviour aligned with client-ui Podcasts: featured newest podcast, category tabs
 * filtered to categories that have podcasts, paginated list (6 per page), card opens
 * detail screen, play opens PodcastModal.
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
  const [podcastToPlay, setPodcastToPlay] = useState(null);

  const [podcasts, setPodcasts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (i18n.language !== usersLanguage) {
      setUsersLanguage(i18n.language);
    }
  }, [i18n.language]);

  const { data: contentEngagements } = useGetUserContentEngagements(!isTmpUser);

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

  useEventListener("countryChanged", handler);

  const [categories, setCategories] = useState();
  const [selectedCategory, setSelectedCategory] = useState();

  const getPodcastsIds = async () => {
    return await adminSvc.getPodcasts();
  };

  const podcastIdsQuery = useQuery(
    ["podcastIds", currentCountry],
    getPodcastsIds
  );

  const getCategories = async () => {
    try {
      const res = await cmsSvc.getCategories(usersLanguage);
      const categoriesData = [
        { label: t("all"), value: "all", isSelected: true },
      ];
      res.data.forEach((category) =>
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

  const { data: podcastCategoryIdsToShow } = useQuery(
    ["podcasts-category-ids", usersLanguage, podcastIdsQuery.data],
    () =>
      cmsSvc.getPodcastCategoryIds(
        usersLanguage,
        podcastIdsQuery.data?.length > 0 ? podcastIdsQuery.data : undefined
      ),
    {
      enabled: !!podcastIdsQuery.data?.length,
    }
  );

  const categoriesToShow = useMemo(() => {
    if (!categories || !podcastCategoryIdsToShow) return [];
    return categories.filter(
      (category) =>
        podcastCategoryIdsToShow.includes(category.id) ||
        category.value === "all"
    );
  }, [categories, podcastCategoryIdsToShow]);

  const handleCategoryOnPress = (index) => {
    const selectedCategoryFromFiltered = categoriesToShow[index];
    if (!selectedCategoryFromFiltered) return;

    const categoriesCopy = [...categories];
    for (let i = 0; i < categoriesCopy.length; i++) {
      categoriesCopy[i].isSelected =
        categoriesCopy[i].id === selectedCategoryFromFiltered.id;
    }
    setCategories(categoriesCopy);
    setSelectedCategory(selectedCategoryFromFiltered);
  };

  const [searchValue, setSearchValue] = useState(initialSearchValue || "");
  const internalDebouncedSearchValue = useDebounce(searchValue, 500);

  const debouncedSearchValue =
    externalSearchValue !== undefined
      ? externalSearchValue
      : internalDebouncedSearchValue;

  useEffect(() => {
    setSearchValue(initialSearchValue || "");
  }, [initialSearchValue]);

  const handleInputChange = (value) => {
    setSearchValue(value);
  };

  const getNewestPodcast = async () => {
    const { data } = await cmsSvc.getPodcasts({
      limit: 1,
      sortBy: "createdAt",
      sortOrder: "desc",
      locale: usersLanguage,
      populate: true,
      ids: podcastIdsQuery.data,
    });
    if (!data?.data?.[0]) return null;
    return destructurePodcastData(data.data[0]);
  };

  const { data: newestPodcast, isLoading: isNewestPodcastLoading } = useQuery(
    ["newestPodcast", usersLanguage, podcastIdsQuery.data],
    getNewestPodcast,
    {
      enabled: !podcastIdsQuery.isLoading && podcastIdsQuery.data?.length > 0,
      refetchOnWindowFocus: false,
    }
  );

  const getPodcastsPage = async (startFrom) => {
    let categoryId = "";
    if (selectedCategory && selectedCategory.value !== "all") {
      categoryId = selectedCategory.id;
    }

    const { data } = await cmsSvc.getPodcasts({
      startFrom,
      limit: 6,
      contains: debouncedSearchValue,
      categoryId,
      sortBy: sort || undefined,
      sortOrder: sort ? "desc" : undefined,
      locale: usersLanguage,
      populate: true,
      ids: podcastIdsQuery.data,
    });

    const podcastsData = data.data || [];
    const total = data.meta?.pagination?.total || podcastsData.length;
    const processed = await Promise.all(
      podcastsData.map((p) => destructurePodcastData(p))
    );
    return { podcastsData: processed, total };
  };

  const {
    isLoading: isPodcastsLoading,
    isFetching: isPodcastsFetching,
    isFetched: isPodcastsFetched,
    data: firstPageResult,
  } = useQuery(
    [
      "podcasts",
      debouncedSearchValue,
      selectedCategory?.id,
      selectedCategory?.value,
      podcastIdsQuery.data,
      usersLanguage,
      sort,
    ],
    () => getPodcastsPage(0),
    {
      enabled:
        !podcastIdsQuery.isLoading &&
        !categoriesQuery.isLoading &&
        categoriesQuery.data?.length > 0 &&
        podcastIdsQuery.data?.length > 0 &&
        selectedCategory != null &&
        categoriesToShow?.length > 0,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (!firstPageResult) return;
    setPodcasts(firstPageResult.podcastsData);
    setHasMore(firstPageResult.podcastsData.length < firstPageResult.total);
  }, [firstPageResult]);

  const getMorePodcasts = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const { podcastsData, total } = await getPodcastsPage(podcasts.length);
      setPodcasts((prev) => {
        const next = [...prev, ...podcastsData];
        setHasMore(next.length < total);
        return next;
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const openPodcastModal = (spotifyId, title) => {
    if (!spotifyId) return;
    setPodcastToPlay({ spotifyId, title });
  };

  useEffect(() => {
    async function getPodcastsRatings() {
      const allItems = [...(podcasts || [])];
      if (newestPodcast && !allItems.find((p) => p.id === newestPodcast.id)) {
        allItems.push(newestPodcast);
      }

      const podcastIds = allItems.reduce((acc, podcast) => {
        const id = podcast.id;
        if (!podcastsLikes.has(id) && !podcastsDislikes.has(id)) {
          acc.push(id);
        }
        return acc;
      }, []);

      if (!podcastIds.length) return;

      const { likes, dislikes } = await getLikesAndDislikesForContent(
        podcastIds,
        "podcast"
      );

      setPodcastsLikes((prev) => new Map([...prev, ...likes]));
      setPodcastsDislikes((prev) => new Map([...prev, ...dislikes]));
    }

    if (podcasts?.length || newestPodcast) {
      getPodcastsRatings();
    }
  }, [podcasts, newestPodcast, usersLanguage]);

  const areCategoriesReady = categoriesToShow?.length > 1;

  const hasPodcastsDifferentThanNewest =
    selectedCategory?.value !== "all"
      ? true
      : newestPodcast &&
        podcasts?.length > 0 &&
        podcasts.some((p) => p.id !== newestPodcast?.id);

  const showCategoriesBlock =
    showCategories && areCategoriesReady && hasPodcastsDifferentThanNewest;

  const newestPodcastData = newestPodcast
    ? {
        ...newestPodcast,
        likes: podcastsLikes.get(newestPodcast.id) || 0,
        dislikes: podcastsDislikes.get(newestPodcast.id) || 0,
      }
    : null;

  const goToPodcast = (podcastData) => {
    navigation.push("PodcastInformation", {
      podcastId: podcastData.id,
    });
  };

  return (
    <>
      <PodcastModal
        isVisible={!!podcastToPlay}
        onClose={() => setPodcastToPlay(null)}
        spotifyId={podcastToPlay?.spotifyId}
        title={podcastToPlay?.title}
        t={t}
      />

      <Block style={[styles.podcastsBlock, { paddingTop: topPadding }]}>
        {showSearch && areCategoriesReady && (
          <View style={styles.searchContainer}>
            <InputSearch onChangeText={handleInputChange} value={searchValue} />
          </View>
        )}

        {(isNewestPodcastLoading || newestPodcastData) && (
          <View style={styles.featuredSection}>
            {isNewestPodcastLoading ? (
              <View style={styles.featuredLoading}>
                <Loading />
              </View>
            ) : newestPodcastData ? (
              <CardMedia
                contentType="podcasts"
                title={newestPodcastData.title}
                image={
                  newestPodcastData.imageMedium || newestPodcastData.imageSmall
                }
                description={newestPodcastData.description}
                labels={newestPodcastData.labels}
                categoryName={newestPodcastData.categoryName}
                creator={newestPodcastData.creator}
                likes={newestPodcastData.likes}
                dislikes={newestPodcastData.dislikes}
                isLikedByUser={
                  isLikedOrDislikedByUser({
                    contentType: "podcast",
                    contentData: newestPodcastData,
                    userEngagements: contentEngagements,
                  }).isLiked
                }
                isDislikedByUser={
                  isLikedOrDislikedByUser({
                    contentType: "podcast",
                    contentData: newestPodcastData,
                    userEngagements: contentEngagements,
                  }).isDisliked
                }
                t={t}
                onPress={() => goToPodcast(newestPodcastData)}
                handlePlay={() =>
                  openPodcastModal(
                    newestPodcastData.spotifyId,
                    newestPodcastData.title
                  )
                }
                style={styles.podcastCard}
              />
            ) : null}
          </View>
        )}

        {showCategoriesBlock && (
          <View style={styles.categoriesContainer}>
            <Tabs
              options={categoriesToShow}
              handleSelect={handleCategoryOnPress}
              t={t}
            />
          </View>
        )}

        {hasPodcastsDifferentThanNewest && (
          <View style={styles.listSection}>
            {isPodcastsFetching && podcasts?.length > 0 && (
              <View style={styles.listOverlay}>
                <Loading />
              </View>
            )}

            {podcasts?.length > 0 && !isPodcastsLoading && (
              <View style={styles.podcastsContainer}>
                {podcasts.map((podcast, index) => {
                  const { isLiked, isDisliked } = isLikedOrDislikedByUser({
                    contentType: "podcast",
                    contentData: podcast,
                    userEngagements: contentEngagements,
                  });
                  const podcastData = podcast;

                  return (
                    <CardMedia
                      key={podcastData.id ?? index}
                      title={podcastData.title}
                      image={
                        podcastData.imageMedium || podcastData.imageSmall
                      }
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
                      onPress={() => goToPodcast(podcastData)}
                      handlePlay={() =>
                        openPodcastModal(
                          podcastData.spotifyId,
                          podcastData.title
                        )
                      }
                      style={styles.podcastCard}
                    />
                  );
                })}

                {hasMore && (
                  <TouchableOpacity
                    style={styles.loadMoreBtn}
                    onPress={getMorePodcasts}
                    disabled={loadingMore}
                    accessibilityRole="button"
                  >
                    {loadingMore ? (
                      <ActivityIndicator />
                    ) : (
                      <AppText namedStyle="text" isSemibold>
                        {t("view_more")}
                      </AppText>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}

            {!podcasts?.length &&
              !isPodcastsLoading &&
              !isPodcastsFetching &&
              isPodcastsFetched && (
                <View style={styles.noResultsContainer}>
                  <AppText>{t("no_results")}</AppText>
                </View>
              )}
          </View>
        )}

        {(isPodcastsFetching ||
          podcastIdsQuery.isLoading ||
          podcastIdsQuery.isFetching) &&
        !podcasts?.length &&
        !newestPodcastData ? (
          <View style={styles.loadingContainer}>
            <Loading style={styles.loading} />
          </View>
        ) : null}

        {podcastIdsQuery.isFetched &&
          isPodcastsFetched &&
          !podcasts?.length &&
          !newestPodcast &&
          !isPodcastsFetching && (
            <View style={styles.noResultsContainer}>
              <AppText namedStyle="h3">{t("could_not_load_content")}</AppText>
            </View>
          )}
      </Block>
    </>
  );
};

const styles = StyleSheet.create({
  podcastsBlock: {
    flex: 1,
    paddingTop: 94,
    paddingHorizontal: 16,
  },
  searchContainer: {
    marginBottom: 24,
  },
  featuredSection: {
    marginBottom: 16,
  },
  featuredLoading: {
    minHeight: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  listSection: {
    position: "relative",
    minHeight: 120,
  },
  listOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  podcastsContainer: {
    alignItems: "center",
  },
  podcastCard: {
    marginBottom: 24,
  },
  loadMoreBtn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
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

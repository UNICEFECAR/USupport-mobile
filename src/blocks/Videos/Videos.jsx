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
  CardMediaSkeleton,
  InputSearch,
  Tabs,
  TabsSkeleton,
} from "#components";
import { VideoModal } from "#backdrops";

import {
  destructureVideoData,
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
 * Videos
 *
 * Behaviour aligned with client-ui Videos: featured newest video, category tabs
 * filtered to categories that have videos, list paginated in pages of 6, card /
 * play opens VideoModal (not the detail screen).
 *
 * @returns {JSX.Element}
 */
export const Videos = ({
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
  const [videosLikes, setVideosLikes] = useState(new Map());
  const [videosDislikes, setVideosDislikes] = useState(new Map());
  const [videoToPlay, setVideoToPlay] = useState(null);

  const [videos, setVideos] = useState([]);
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

  const getVideosIds = async () => {
    return await adminSvc.getVideos();
  };

  const videoIdsQuery = useQuery(["videoIds", currentCountry], getVideosIds);

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
    ["videos-categories", usersLanguage],
    getCategories,
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setCategories([...data]);
      },
    }
  );

  const {
    data: videoCategoryIdsToShow,
    isLoading: isVideoCategoryIdsLoading,
    isFetching: isVideoCategoryIdsFetching,
  } = useQuery(
    ["videos-category-ids", usersLanguage, videoIdsQuery.data],
    () =>
      cmsSvc.getVideoCategoryIds(
        usersLanguage,
        videoIdsQuery.data?.length > 0 ? videoIdsQuery.data : undefined
      ),
    {
      enabled: !!videoIdsQuery.data?.length,
    }
  );

  const categoriesToShow = useMemo(() => {
    if (!categories || !videoCategoryIdsToShow) return [];
    return categories.filter(
      (category) =>
        videoCategoryIdsToShow.includes(category.id) ||
        category.value === "all"
    );
  }, [categories, videoCategoryIdsToShow]);

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

  const getNewestVideo = async () => {
    const { data } = await cmsSvc.getVideos({
      limit: 1,
      sortBy: "createdAt",
      sortOrder: "desc",
      locale: usersLanguage,
      populate: true,
      ids: videoIdsQuery.data,
    });
    if (!data?.data?.[0]) return null;
    return destructureVideoData(data.data[0]);
  };

  const { data: newestVideo, isLoading: isNewestVideoLoading } = useQuery(
    ["newestVideo", usersLanguage, videoIdsQuery.data],
    getNewestVideo,
    {
      enabled: !videoIdsQuery.isLoading && videoIdsQuery.data?.length > 0,
      refetchOnWindowFocus: false,
    }
  );

  const getVideosPage = async (startFrom) => {
    let categoryId = "";
    if (selectedCategory && selectedCategory.value !== "all") {
      categoryId = selectedCategory.id;
    }

    const { data } = await cmsSvc.getVideos({
      startFrom,
      limit: 6,
      contains: debouncedSearchValue,
      categoryId,
      sortBy: sort || "title",
      sortOrder: sort ? "desc" : "asc",
      locale: usersLanguage,
      populate: true,
      ids: videoIdsQuery.data,
    });

    const videoData = data.data || [];
    const total = data.meta?.pagination?.total || videoData.length;
    return { videoData, total };
  };

  const {
    isLoading: isVideosLoading,
    isFetching: isVideosFetching,
    isFetched: isVideosFetched,
    data: firstPageResult,
  } = useQuery(
    [
      "videos",
      debouncedSearchValue,
      selectedCategory?.id,
      selectedCategory?.value,
      videoIdsQuery.data,
      usersLanguage,
      sort,
    ],
    () => getVideosPage(0),
    {
      enabled:
        !videoIdsQuery.isLoading &&
        !categoriesQuery.isLoading &&
        categoriesQuery.data?.length > 0 &&
        videoIdsQuery.data?.length > 0 &&
        selectedCategory != null &&
        categoriesToShow?.length > 0,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (!firstPageResult) return;
    setVideos(firstPageResult.videoData);
    setHasMore(firstPageResult.videoData.length < firstPageResult.total);
  }, [firstPageResult]);

  const getMoreVideos = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const { videoData, total } = await getVideosPage(videos.length);
      setVideos((prev) => {
        const next = [...prev, ...videoData];
        setHasMore(next.length < total);
        return next;
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const openVideo = (url, title) => {
    if (!url) return;
    setVideoToPlay({ url, title });
  };

  useEffect(() => {
    async function getVideosRatings() {
      const allItems = [...(videos || [])];
      if (newestVideo && !allItems.find((v) => v.id === newestVideo.id)) {
        allItems.push(newestVideo);
      }

      const videoIds = allItems.reduce((acc, video) => {
        const id = video.id;
        if (!videosLikes.has(id) && !videosDislikes.has(id)) {
          acc.push(id);
        }
        return acc;
      }, []);

      if (!videoIds.length) return;

      const { likes, dislikes } = await getLikesAndDislikesForContent(
        videoIds,
        "video"
      );

      setVideosLikes((prev) => new Map([...prev, ...likes]));
      setVideosDislikes((prev) => new Map([...prev, ...dislikes]));
    }

    if (videos?.length || newestVideo) {
      getVideosRatings();
    }
  }, [videos, newestVideo, usersLanguage]);

  const areCategoriesReady = categoriesToShow?.length > 1;

  const hasVideosDifferentThanNewest =
    selectedCategory?.value !== "all"
      ? true
      : newestVideo &&
        videos?.length > 0 &&
        videos.some((video) => video.id !== newestVideo?.id);

  const showCategoriesBlock =
    showCategories && areCategoriesReady && hasVideosDifferentThanNewest;

  const isCategoriesPending =
    categoriesQuery.isLoading ||
    categoriesQuery.isFetching ||
    !categories ||
    videoIdsQuery.isLoading ||
    videoIdsQuery.isFetching ||
    (videoIdsQuery.data?.length > 0 &&
      (isVideoCategoryIdsLoading ||
        isVideoCategoryIdsFetching ||
        videoCategoryIdsToShow === undefined));

  const showCategoriesSkeleton =
    showCategories && !showCategoriesBlock && isCategoriesPending;

  const newestVideoData = newestVideo
    ? {
        ...newestVideo,
        likes: videosLikes.get(newestVideo.id) || 0,
        dislikes: videosDislikes.get(newestVideo.id) || 0,
      }
    : null;

  const playUrl = (item) =>
    openVideo(item.originalUrl || item.awsUrl, item.title);

  return (
    <>
      <VideoModal
        isVisible={!!videoToPlay}
        onClose={() => setVideoToPlay(null)}
        videoUrl={videoToPlay?.url}
        title={videoToPlay?.title}
        t={t}
      />

      <Block style={[styles.videosBlock, { paddingTop: topPadding }]}>
        {showSearch && areCategoriesReady && (
          <View style={styles.searchContainer}>
            <InputSearch onChangeText={handleInputChange} value={searchValue} />
          </View>
        )}

        {(isNewestVideoLoading || newestVideoData) && (
          <View style={styles.featuredSection}>
            {isNewestVideoLoading ? (
              <CardMediaSkeleton style={styles.videoCard} />
            ) : newestVideoData ? (
              <CardMedia
                contentType="videos"
                title={newestVideoData.title}
                image={
                  newestVideoData.image ||
                  newestVideoData.imageMedium ||
                  newestVideoData.imageSmall
                }
                description={newestVideoData.description}
                labels={newestVideoData.labels}
                categoryName={newestVideoData.categoryName}
                creator={newestVideoData.creator}
                likes={newestVideoData.likes}
                dislikes={newestVideoData.dislikes}
                isLikedByUser={
                  isLikedOrDislikedByUser({
                    contentType: "video",
                    contentData: newestVideoData,
                    userEngagements: contentEngagements,
                  }).isLiked
                }
                isDislikedByUser={
                  isLikedOrDislikedByUser({
                    contentType: "video",
                    contentData: newestVideoData,
                    userEngagements: contentEngagements,
                  }).isDisliked
                }
                t={t}
                onPress={() => playUrl(newestVideoData)}
                handlePlay={() => playUrl(newestVideoData)}
                style={styles.videoCard}
              />
            ) : null}
          </View>
        )}

        {showCategoriesBlock ? (
          <View style={styles.categoriesContainer}>
            <Tabs
              options={categoriesToShow}
              handleSelect={handleCategoryOnPress}
              t={t}
            />
          </View>
        ) : showCategoriesSkeleton ? (
          <View style={styles.categoriesContainer}>
            <TabsSkeleton count={6} />
          </View>
        ) : null}

        {hasVideosDifferentThanNewest && (
          <View style={styles.listSection}>
            {isVideosFetching && videos?.length > 0 && (
              <View style={styles.listOverlay}>
                <Loading />
              </View>
            )}

            {videos?.length > 0 && !isVideosLoading && (
              <View style={styles.videosContainer}>
                {videos.map((video, index) => {
                  const { isLiked, isDisliked } = isLikedOrDislikedByUser({
                    contentType: "video",
                    contentData: video,
                    userEngagements: contentEngagements,
                  });
                  const videoData = destructureVideoData(video);

                  return (
                    <CardMedia
                      contentType="videos"
                      key={videoData.id ?? index}
                      title={videoData.title}
                      image={
                        videoData.image ||
                        videoData.imageMedium ||
                        videoData.imageSmall
                      }
                      description={videoData.description}
                      labels={videoData.labels}
                      categoryName={videoData.categoryName}
                      creator={videoData.creator}
                      isLikedByUser={isLiked}
                      isDislikedByUser={isDisliked}
                      likes={videosLikes.get(videoData.id) || 0}
                      dislikes={videosDislikes.get(videoData.id) || 0}
                      t={t}
                      onPress={() => playUrl(videoData)}
                      handlePlay={() => playUrl(videoData)}
                      style={styles.videoCard}
                    />
                  );
                })}

                {hasMore && (
                  <TouchableOpacity
                    style={styles.loadMoreBtn}
                    onPress={getMoreVideos}
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

            {!videos?.length &&
              !isVideosLoading &&
              !isVideosFetching &&
              isVideosFetched && (
                <View style={styles.noResultsContainer}>
                  <AppText>{t("no_results")}</AppText>
                </View>
              )}
          </View>
        )}

        {(isVideosFetching ||
          videoIdsQuery.isLoading ||
          videoIdsQuery.isFetching) &&
        !videos?.length &&
        !newestVideoData ? (
          <>
            <CardMediaSkeleton style={styles.videoCard} />
            <CardMediaSkeleton style={styles.videoCard} />
          </>
        ) : null}

        {videoIdsQuery.isFetched &&
          isVideosFetched &&
          !videos?.length &&
          !newestVideo &&
          !isVideosFetching && (
            <View style={styles.noResultsContainer}>
              <AppText namedStyle="h3">{t("could_not_load_content")}</AppText>
            </View>
          )}
      </Block>
    </>
  );
};

const styles = StyleSheet.create({
  videosBlock: {
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
  videosContainer: {
    alignItems: "center",
  },
  videoCard: {
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

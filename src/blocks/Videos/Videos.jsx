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
 * Videos block
 *
 * @returns {JSX.Element}
 */
export const Videos = ({
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
  const [videosLikes, setVideosLikes] = useState(new Map());
  const [videosDislikes, setVideosDislikes] = useState(new Map());

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

  //--------------------- Videos ----------------------//
  const getVideosIds = async () => {
    const videosIds = await adminSvc.getVideos();

    return videosIds;
  };

  const videoIdsQuery = useQuery(["videoIds", currentCountry], getVideosIds);

  const getCategories = async () => {
    try {
      // First get category IDs that have videos
      const categoryIdsWithVideos = await cmsSvc.getVideoCategoryIds(
        usersLanguage,
        videoIdsQuery.data
      );

      // If no categories have videos, return empty array with "all" option
      if (!categoryIdsWithVideos || categoryIdsWithVideos.length === 0) {
        const categoriesData = [
          { label: t("all"), value: "all", isSelected: true },
        ];
        setSelectedCategory(categoriesData[0]);
        return categoriesData;
      }

      // Get all categories
      const res = await cmsSvc.getCategories(usersLanguage);

      // Filter categories to only include those that have videos
      const filteredCategories = res.data.filter((category) =>
        categoryIdsWithVideos.includes(category.id)
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
    ["videos-categories", usersLanguage, videoIdsQuery.data],
    getCategories,
    {
      enabled: !!videoIdsQuery.data && videoIdsQuery.data.length > 0,
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

  //--------------------- Videos ----------------------//
  const getVideosData = async () => {
    let categoryId = "";
    if (selectedCategory && selectedCategory.value !== "all") {
      categoryId = selectedCategory.id;
    }

    let { data } = await cmsSvc.getVideos({
      limit: 50, // Get all videos instead of paginating
      contains: debouncedSearchValue,
      categoryId,
      sortBy: sort,
      sortOrder: sort ? "desc" : null,
      locale: usersLanguage,
      populate: true,
      ids: videoIdsQuery.data,
    });

    const videos = data.data || [];

    return videos;
  };

  const {
    data: videos,
    isLoading: isVideosLoading,
    isFetching: isVideosFetching,
    isFetched: isVideosFetched,
    fetchStatus: videosFetchStatus,
  } = useQuery(
    [
      "videos",
      debouncedSearchValue,
      selectedCategory,
      videoIdsQuery.data,
      usersLanguage,
      sort,
    ],
    getVideosData,
    {
      enabled:
        !videoIdsQuery.isLoading &&
        !categoriesQuery.isLoading &&
        categoriesQuery.data?.length > 0 &&
        videoIdsQuery.data?.length > 0 &&
        selectedCategory !== null,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    async function getVideosRatings() {
      const videoIds = videos.reduce((acc, video) => {
        if (!videosLikes.has(video.id) && !videosDislikes.has(video.id)) {
          acc.push(video.id);
        }
        return acc;
      }, []);

      if (!videoIds.length) return;

      const { likes, dislikes } = await getLikesAndDislikesForContent(
        videoIds,
        "video"
      );

      setVideosLikes((prevVideosLikes) => {
        return new Map([...prevVideosLikes, ...likes]);
      });
      setVideosDislikes((prevVideosDislikes) => {
        return new Map([...prevVideosDislikes, ...dislikes]);
      });
    }

    getVideosRatings();
  }, [videos, usersLanguage]);

  // Transform videos data to use state likes/dislikes
  const transformedVideos = videos?.map((video) => {
    const baseVideo = video.data ? video.data : video;
    return {
      ...baseVideo,
      likes: videosLikes.get(baseVideo.id) || 0,
      dislikes: videosDislikes.get(baseVideo.id) || 0,
    };
  });

  let areCategoriesReady = categoriesQuery?.data?.length > 1;

  return (
    <Block style={[styles.videosBlock, { paddingTop: topPadding }]}>
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

        {transformedVideos?.length > 0 &&
          areCategoriesReady &&
          !isVideosLoading &&
          !isVideosFetching && (
            <View style={styles.videosContainer}>
              {transformedVideos?.map((video, index) => {
                const { isLiked, isDisliked } = isLikedOrDislikedByUser({
                  contentType: "video",
                  contentData: video,
                  userEngagements: contentEngagements,
                });
                const videoData = destructureVideoData(video);

                return (
                  <CardMedia
                    contentType="videos"
                    key={index}
                    title={videoData.title}
                    image={
                      videoData.image ||
                      videoData.imageMedium ||
                      videoData.imageSmall
                    }
                    description={videoData.description}
                    labels={videoData.labels}
                    categoryName={videoData.categoryName}
                    isLikedByUser={isLiked}
                    isDislikedByUser={isDisliked}
                    likes={videoData.likes}
                    dislikes={videoData.dislikes}
                    t={t}
                    onPress={() => {
                      navigation.push("VideoInformation", {
                        videoId: videoData.id,
                      });
                    }}
                    style={styles.videoCard}
                  />
                );
              })}
            </View>
          )}

        {!transformedVideos?.length &&
          !isVideosLoading &&
          !isVideosFetching &&
          categoriesQuery?.data?.length > 0 && (
            <View style={styles.noResultsContainer}>
              <AppText>{t("no_results")}</AppText>
            </View>
          )}

        {(isVideosFetching ||
          videoIdsQuery.isLoading ||
          videoIdsQuery.isFetching) && (
          <View style={styles.loadingContainer}>
            <Loading style={styles.loading} />
          </View>
        )}

        {videoIdsQuery.isFetched &&
          (isVideosFetched || videosFetchStatus === "idle") &&
          !transformedVideos && (
            <View style={styles.noResultsContainer}>
              <AppText namedStyle="h3">{t("could_not_load_content")}</AppText>
            </View>
          )}
      </ScrollView>
    </Block>
  );
};

const styles = StyleSheet.create({
  videosBlock: {
    flex: 1,
    paddingTop: 94,
  },
  searchContainer: {
    marginBottom: 24,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  videosContainer: {
    alignItems: "center",
  },
  videoCard: {
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

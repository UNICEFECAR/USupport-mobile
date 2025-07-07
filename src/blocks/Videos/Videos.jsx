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

import { appStyles } from "#styles";

import { destructureVideoData } from "#utils";

import {
  useEventListener,
  useGetUserContentRatings,
  useDebounce,
} from "#hooks";

import { localStorage, adminSvc, cmsSvc } from "#services";

/**
 * Videos
 *
 * Videos block
 *
 * @returns {JSX.Element}
 */
export const Videos = ({ navigation, showSearch, showCategories, sort }) => {
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
    ["videos-categories", usersLanguage],
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

  //--------------------- Videos ----------------------//
  const getVideosIds = async () => {
    const videosIds = await adminSvc.getVideos();
    return videosIds;
  };

  const videoIdsQuery = useQuery(["videoIds", currentCountry], getVideosIds);

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

    return data.data || [];
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

  let areCategoriesReady = categoriesQuery?.data?.length > 1;

  return (
    <Block style={styles.videosBlock}>
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

        {videos?.length > 0 &&
          areCategoriesReady &&
          !isVideosLoading &&
          !isVideosFetching && (
            <View style={styles.videosContainer}>
              {videos?.map((video, index) => {
                const isLikedByUser = contentRatings?.some(
                  (rating) =>
                    rating.content_id === video.id &&
                    rating.content_type === "video" &&
                    rating.positive === true
                );
                const isDislikedByUser = contentRatings?.some(
                  (rating) =>
                    rating.content_id === video.id &&
                    rating.content_type === "video" &&
                    rating.positive === false
                );
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
                    isLikedByUser={isLikedByUser}
                    isDislikedByUser={isDislikedByUser}
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

        {!videos?.length &&
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
          !videos && (
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

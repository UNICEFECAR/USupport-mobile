import React, { useContext } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { CardMedia, Heading, Screen, AppText, Loading } from "#components";

import { VideoView } from "#blocks";

import { destructureVideoData } from "#utils";

import { useGetUserContentRatings } from "#hooks";

import { userSvc, cmsSvc, adminSvc, clientSvc, Context } from "#services";

/**
 * VideoInformation
 *
 * Video information screen
 *
 * @returns {JSX.Element}
 */
export const VideoInformation = ({ navigation, route }) => {
  const { videoId: id } = route.params;
  const { i18n, t } = useTranslation("blocks", {
    keyPrefix: "information-portal",
  });
  const { isTmpUser } = useContext(Context);

  const getVideosIds = async () => {
    // Request video ids from the master DB
    const videoIds = await adminSvc.getVideos();
    return videoIds;
  };

  const { data: contentRatings } = useGetUserContentRatings(!isTmpUser);
  const videoIdsQuery = useQuery(["videoIds"], getVideosIds);

  const getVideoData = async () => {
    const contentRatings = await userSvc.getRatingsForContent({
      contentType: "video",
      contentId: id,
      isTmpUser,
    });

    const { data } = await cmsSvc.getVideoById(id, i18n.language);
    const finalData = destructureVideoData(data);
    finalData.contentRating = contentRatings.data;
    return finalData;
  };

  const { data: videoData, isFetching: isFetchingVideoData } = useQuery(
    ["video", i18n.language, id],
    getVideoData,
    {
      enabled: !!id,
      onSuccess: (data) => {
        // Add category interaction when video is successfully fetched
        if (data && data.categoryId && !isTmpUser) {
          clientSvc
            .addClientCategoryInteraction({
              categoryId: data.categoryId,
              videoId: data.id,
              tagIds: data.labels?.map((label) => label.id) || [],
            })
            .catch((error) => {
              console.error("Failed to track category interaction:", error);
            });
        }
      },
    }
  );

  const getSimilarVideos = async () => {
    let { data } = await cmsSvc.getVideos({
      limit: 3,
      categoryId: videoData.categoryId,
      locale: i18n.language,
      excludeId: videoData.id,
      populate: true,
      ids: videoIdsQuery.data,
    });

    if (data.length === 0) {
      let { data: newest } = await cmsSvc.getVideos({
        limit: 3,
        sortBy: "createdAt",
        sortOrder: "desc",
        locale: i18n.language,
        excludeId: videoData.id,
        populate: true,
        ids: videoIdsQuery.data,
      });
      return newest.data;
    }
    return data.data;
  };

  const {
    data: moreVideos,
    isLoading: isMoreVideosLoading,
    isFetching: isMoreVideosFetching,
  } = useQuery(["more-videos", id, i18n.language], getSimilarVideos, {
    enabled:
      !isFetchingVideoData &&
      !videoIdsQuery.isLoading &&
      videoIdsQuery.data?.length > 0 &&
      videoData &&
      videoData.categoryId
        ? true
        : false,
  });

  return (
    <Screen>
      <ScrollView style={styles.container}>
        <Heading
          heading={videoData?.title}
          // subheading={subheading}
          handleGoBack={() => navigation.goBack()}
        />

        {videoData ? (
          <VideoView videoData={videoData} t={t} isTmpUser={isTmpUser} />
        ) : (
          <View style={styles.loadingContainer}>
            <Loading style={styles.loading} />
          </View>
        )}

        {!isMoreVideosLoading && moreVideos && moreVideos.length > 0 && (
          <View style={styles.moreVideosContainer}>
            <AppText namedStyle="h4" style={styles.moreVideosHeading}>
              {t("more_videos")}
            </AppText>
            <View style={styles.moreVideosGrid}>
              {moreVideos.map((video, index) => {
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
                  <View key={index} style={styles.moreVideoCard}>
                    <CardMedia
                      contentType="videos"
                      title={videoData.title}
                      image={
                        videoData.image ||
                        videoData.imageMedium ||
                        videoData.imageSmall
                      }
                      description={videoData.description}
                      labels={videoData.labels}
                      creator={videoData.creator}
                      categoryName={videoData.categoryName}
                      likes={videoData.likes}
                      dislikes={videoData.dislikes}
                      isLikedByUser={isLikedByUser}
                      isDislikedByUser={isDislikedByUser}
                      t={t}
                      onPress={() => {
                        navigation.push("VideoInformation", {
                          videoId: videoData.id,
                        });
                      }}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  moreVideosContainer: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  moreVideosHeading: {
    marginBottom: 16,
  },
  moreVideosGrid: {
    alignItems: "center",
  },
  moreVideoCard: {
    marginBottom: 24,
    width: "100%",
  },
});

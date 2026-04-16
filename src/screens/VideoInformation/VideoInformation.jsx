import React, { useContext } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { CardMedia, Screen, AppText, Loading, Icon } from "#components";

import { VideoView } from "#blocks";

import {
  destructureVideoData,
  getLikesAndDislikesForContent,
  isLikedOrDislikedByUser,
} from "#utils";

import { useGetUserContentEngagements, useGetTheme } from "#hooks";
import { appStyles } from "#styles";

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
  const { t: tScreen } = useTranslation("screens", { keyPrefix: "screen" });
  const { isHighContrast } = useGetTheme();
  const { isTmpUser } = useContext(Context);

  const getVideosIds = async () => {
    // Request video ids from the master DB
    const videoIds = await adminSvc.getVideos();
    return videoIds;
  };

  const { data: userContentEngagements } =
    useGetUserContentEngagements(!isTmpUser);
  const {
    data: videoContentEngagements,
    isLoading: isLoadingVideoContentEngagements,
  } = useQuery(["videoContentEngagements", id], async () => {
    const { data } = await userSvc.getContentEngagementsById({
      contentType: "video",
      ids: [id],
    });

    const { likes, dislikes } = data.reduce(
      (acc, engagement) => {
        if (engagement.action === "like") {
          acc.likes += 1;
        } else if (engagement.action === "dislike") {
          acc.dislikes += 1;
        }
        return acc;
      },
      { likes: 0, dislikes: 0 }
    );
    return { likes, dislikes };
  });
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

  const {
    data: videoData,
    isFetching: isFetchingVideoData,
    isFetched,
  } = useQuery(["video", i18n.language, id], getVideoData, {
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
  });

  const getSimilarVideos = async () => {
    let { data } = await cmsSvc.getVideos({
      limit: 3,
      categoryId: videoData.categoryId,
      locale: i18n.language,
      excludeId: videoData.id,
      populate: true,
      ids: videoIdsQuery.data,
    });

    let videos = data.data;

    if (videos.length === 0) {
      let { data: newest } = await cmsSvc.getVideos({
        limit: 3,
        sortBy: "createdAt",
        sortOrder: "desc",
        locale: i18n.language,
        excludeId: videoData.id,
        populate: true,
        ids: videoIdsQuery.data,
      });
      videos = newest.data;
    }

    const videoIds = videos.map((video) => video.id);
    const { likes, dislikes } = await getLikesAndDislikesForContent(
      videoIds,
      "video"
    );

    return videos.map((video) => ({
      ...video,
      likes: likes.get(video.id) || 0,
      dislikes: dislikes.get(video.id) || 0,
    }));
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

  const { isLiked, isDisliked } = isLikedOrDislikedByUser({
    contentType: "video",
    contentData: videoData,
    userEngagements: userContentEngagements,
  });

  const isLoading = isLoadingVideoContentEngagements || isFetchingVideoData;

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.goBackRow}
            hitSlop={appStyles.hitSlop}
          >
            <Icon
              style={styles.goBackIcon}
              name="arrow-chevron-back"
              color={isHighContrast ? "#fff" : appStyles.colorPrimary_20809e}
            />
            <AppText namedStyle="text" isBold style={styles.goBackText}>
              {tScreen("go_back")}
            </AppText>
          </TouchableOpacity>
        </View>

        {!isLoading && videoData ? (
          <VideoView
            videoData={{
              ...videoData,
              likes: videoContentEngagements?.likes || 0,
              dislikes: videoContentEngagements?.dislikes || 0,
              contentRating: {
                isLikedByUser: isLiked,
                isDislikedByUser: isDisliked,
              },
            }}
            t={t}
            isTmpUser={isTmpUser}
          />
        ) : isFetched && !isLoading ? (
          <AppText>{t("not_found")}</AppText>
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
                const { isLiked, isDisliked } = isLikedOrDislikedByUser({
                  contentType: "video",
                  contentData: video,
                  userEngagements: userContentEngagements,
                });
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
                      isLikedByUser={isLiked}
                      isDislikedByUser={isDisliked}
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  goBackRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  goBackIcon: {
    marginRight: 8,
  },
  goBackText: {
    textTransform: "none",
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
    paddingHorizontal: 0,
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

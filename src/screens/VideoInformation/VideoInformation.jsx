import React from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Share from "react-native-share";

import {
  CardMedia,
  Heading,
  Icon,
  Screen,
  AppText,
  Loading,
} from "#components";
import { VideoView } from "#blocks";
import { destructureVideoData, constructShareUrl } from "#utils";
import { useGetUserContentRatings, useGetTheme } from "#hooks";
import { userSvc, cmsSvc, adminSvc } from "#services";
import { appStyles } from "#styles";

/**
 * VideoInformation
 *
 * Video information screen
 *
 * @returns {JSX.Element}
 */
export const VideoInformation = ({ navigation, route }) => {
  const { videoId: id } = route.params;
  const { i18n, t } = useTranslation("information-portal");
  const { colors } = useGetTheme();

  const [isShared, setIsShared] = React.useState(false);

  const getVideosIds = async () => {
    // Request video ids from the master DB
    const videoIds = await adminSvc.getVideos();
    return videoIds;
  };

  const { data: contentRatings } = useGetUserContentRatings();
  const videoIdsQuery = useQuery(["videoIds"], getVideosIds);

  const getVideoData = async () => {
    const contentRatings = await userSvc.getRatingsForContent({
      contentType: "video",
      contentId: id,
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

  const handleShare = async () => {
    const url = await constructShareUrl({
      contentType: "video",
      id: videoData.id,
    });
    Share.open({
      title: videoData.title,
      message: `${t("check_video")}\n\n${url}`,
    });
    if (!isShared) {
      cmsSvc.addVideoShareCount(videoData.id).then(() => {
        setIsShared(true);
      });
    }
  };

  return (
    <Screen>
      <ScrollView style={styles.container}>
        <Heading
          heading={videoData?.title}
          // subheading={subheading}
          handleGoBack={() => navigation.goBack()}
          buttonComponent={
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Icon name="share" size="sm" color={colors.text} />
            </TouchableOpacity>
          }
        />

        {videoData ? (
          <VideoView videoData={videoData} t={t} />
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
  actionButton: {
    marginLeft: 16,
    borderWidth: 1,
    borderColor: appStyles.colorBlue_3d527b,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});

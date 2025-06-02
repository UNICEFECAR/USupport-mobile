import React from "react";
import { TouchableOpacity, StyleSheet, View, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Share from "react-native-share";

import {
  Icon,
  Heading,
  Screen,
  AppText,
  Loading,
  CardMedia,
} from "#components";
import { PodcastView } from "#blocks";
import { destructurePodcastData, constructShareUrl } from "#utils";
import { useGetUserContentRatings, useGetTheme } from "#hooks";
import { userSvc, cmsSvc, adminSvc } from "#services";
import { appStyles } from "#styles";

/**
 * PodcastInformation
 *
 * Podcast information screen
 *
 * @returns {JSX.Element}
 */
export const PodcastInformation = ({ navigation, route }) => {
  const { podcastId: id } = route.params;
  const { i18n, t } = useTranslation("information-portal");
  const { colors } = useGetTheme();

  const [isShared, setIsShared] = React.useState(false);

  const getPodcastsIds = async () => {
    // Request podcast ids from the master DB
    const podcastIds = await adminSvc.getPodcasts();
    return podcastIds;
  };

  const { data: contentRatings } = useGetUserContentRatings();
  const podcastIdsQuery = useQuery(["podcastIds"], getPodcastsIds);

  const getPodcastData = async () => {
    const contentRatings = await userSvc.getRatingsForContent({
      contentType: "podcast",
      contentId: id,
    });

    const { data } = await cmsSvc.getPodcastById(id, i18n.language);
    const finalData = destructurePodcastData(data);
    finalData.contentRating = contentRatings.data;
    return finalData;
  };

  const { data: podcastData, isFetching: isFetchingPodcastData } = useQuery(
    ["podcast", i18n.language, id],
    getPodcastData,
    {
      enabled: !!id,
    }
  );

  const getSimilarPodcasts = async () => {
    let { data } = await cmsSvc.getPodcasts({
      limit: 3,
      categoryId: podcastData.categoryId,
      locale: i18n.language,
      excludeId: podcastData.id,
      populate: true,
      ids: podcastIdsQuery.data,
    });

    if (data.length === 0) {
      let { data: newest } = await cmsSvc.getPodcasts({
        limit: 3,
        sortBy: "createdAt",
        sortOrder: "desc",
        locale: i18n.language,
        excludeId: podcastData.id,
        populate: true,
        ids: podcastIdsQuery.data,
      });
      return newest.data;
    }
    return data.data;
  };

  const {
    data: morePodcasts,
    isLoading: isMorePodcastsLoading,
    isFetching: isMorePodcastsFetching,
  } = useQuery(["more-podcasts", id, i18n.language], getSimilarPodcasts, {
    enabled:
      !isFetchingPodcastData &&
      !podcastIdsQuery.isLoading &&
      podcastIdsQuery.data?.length > 0 &&
      podcastData &&
      podcastData.categoryId
        ? true
        : false,
  });

  const handleShare = async () => {
    const url = await constructShareUrl({
      contentType: "podcast",
      id: podcastData.id,
    });
    Share.open({
      title: podcastData.title,
      message: `${t("check_podcast")}\n\n${url}`,
    });
    if (!isShared) {
      cmsSvc.addPodcastShareCount(podcastData.id).then(() => {
        setIsShared(true);
      });
    }
  };

  return (
    <Screen>
      <ScrollView style={styles.container}>
        <Heading
          heading={podcastData?.title}
          handleGoBack={() => navigation.goBack()}
          buttonComponent={
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Icon name="share" size="sm" color={colors.text} />
            </TouchableOpacity>
          }
        />

        {podcastData ? (
          <PodcastView podcastData={podcastData} t={t} />
        ) : (
          <View style={styles.loadingContainer}>
            <Loading style={styles.loading} />
          </View>
        )}

        {!isMorePodcastsLoading && morePodcasts && morePodcasts.length > 0 && (
          <View style={styles.morePodcastsContainer}>
            <AppText namedStyle="h4" style={styles.morePodcastsHeading}>
              {t("more_podcasts")}
            </AppText>
            <View style={styles.morePodcastsGrid}>
              {morePodcasts.map((podcast, index) => {
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
                  <View key={index} style={styles.morePodcastCard}>
                    <CardMedia
                      title={podcastData.title}
                      image={podcastData.imageMedium || podcastData.imageSmall}
                      description={podcastData.description}
                      labels={podcastData.labels}
                      creator={podcastData.creator}
                      categoryName={podcastData.categoryName}
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
  morePodcastsContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  morePodcastsHeading: {
    marginBottom: 16,
  },
  morePodcastsGrid: {
    alignItems: "center",
  },
  morePodcastCard: {
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

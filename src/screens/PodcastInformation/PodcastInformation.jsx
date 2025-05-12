import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Heading, Screen, AppText, Loading, CardMedia } from "#components";
import { PodcastView } from "#blocks";
import { destructurePodcastData } from "#utils";
import { useGetUserContentRatings } from "#hooks";
import { userSvc, cmsSvc, adminSvc } from "#services";

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

  return (
    <Screen>
      <ScrollView style={styles.container}>
        <Heading
          heading={podcastData?.title}
          handleGoBack={() => navigation.goBack()}
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
});

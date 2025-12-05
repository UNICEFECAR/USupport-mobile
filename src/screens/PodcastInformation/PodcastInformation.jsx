import React, { useContext } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Heading, Screen, AppText, Loading, CardMedia } from "#components";
import { PodcastView } from "#blocks";
import {
  destructurePodcastData,
  getLikesAndDislikesForContent,
  isLikedOrDislikedByUser,
} from "#utils";
import { useGetUserContentEngagements } from "#hooks";
import { userSvc, cmsSvc, adminSvc, clientSvc, Context } from "#services";

/**
 * PodcastInformation
 *
 * Podcast information screen
 *
 * @returns {JSX.Element}
 */
export const PodcastInformation = ({ navigation, route }) => {
  const { podcastId: id } = route.params;
  const { i18n, t } = useTranslation("blocks", {
    keyPrefix: "information-portal",
  });
  const { isTmpUser } = useContext(Context);

  const getPodcastsIds = async () => {
    // Request podcast ids from the master DB
    const podcastIds = await adminSvc.getPodcasts();
    return podcastIds;
  };

  const {
    data: userContentEngagements,
    isLoading: isLoadingUserContentEngagements,
  } = useGetUserContentEngagements(!isTmpUser);
  const {
    data: podcastContentEngagements,
    isLoading: isLoadingPodcastContentEngagements,
  } = useQuery(["podcastContentEngagements", id], async () => {
    const { data } = await userSvc.getContentEngagementsById({
      contentType: "podcast",
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

  const podcastIdsQuery = useQuery(["podcastIds"], getPodcastsIds);

  const getPodcastData = async () => {
    const { data } = await cmsSvc.getPodcastById(id, i18n.language);
    const finalData = await destructurePodcastData(data);
    return finalData;
  };

  const {
    data: podcastData,
    isFetching: isFetchingPodcastData,
    isFetched,
  } = useQuery(["podcast", i18n.language, id], getPodcastData, {
    enabled: !!id,
    onSuccess: (data) => {
      // Add category interaction when podcast is successfully fetched
      if (data && data.categoryId && !isTmpUser) {
        clientSvc
          .addClientCategoryInteraction({
            categoryId: data.categoryId,
            podcastId: data.id,
            tagIds: data.labels?.map((label) => label.id) || [],
          })
          .catch((error) => {
            console.error("Failed to track category interaction:", error);
          });
      }
    },
  });

  const getSimilarPodcasts = async () => {
    let { data } = await cmsSvc.getPodcasts({
      limit: 3,
      categoryId: podcastData.categoryId,
      locale: i18n.language,
      excludeId: podcastData.id,
      populate: true,
      ids: podcastIdsQuery.data,
    });

    let podcasts = [];
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
      podcasts = newest.data || [];
    } else {
      podcasts = data.data || [];
    }

    const podcastIds = podcasts.map((podcast) => podcast.id);
    const { likes, dislikes } = await getLikesAndDislikesForContent(
      podcastIds,
      "podcast"
    );

    // Destructure podcast data with async handling
    const destructuredPodcasts = await Promise.all(
      podcasts.map((podcast) => destructurePodcastData(podcast))
    );
    return destructuredPodcasts.map((x) => ({
      ...x,
      likes: likes.get(x.id) || 0,
      dislikes: dislikes.get(x.id) || 0,
    }));
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

  const { isLiked, isDisliked } = isLikedOrDislikedByUser({
    contentType: "podcast",
    contentData: podcastData,
    userEngagements: userContentEngagements,
  });

  const isLoading =
    isLoadingUserContentEngagements ||
    isLoadingPodcastContentEngagements ||
    isFetchingPodcastData;

  return (
    <Screen>
      <ScrollView style={styles.container}>
        <Heading
          heading={podcastData?.title}
          handleGoBack={() => navigation.goBack()}
        />

        {podcastData && !isLoading ? (
          <PodcastView
            podcastData={{
              ...podcastData,
              likes: podcastContentEngagements?.likes || 0,
              dislikes: podcastContentEngagements?.dislikes || 0,
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

        {!isMorePodcastsLoading && morePodcasts && morePodcasts.length > 0 && (
          <View style={styles.morePodcastsContainer}>
            <AppText namedStyle="h4" style={styles.morePodcastsHeading}>
              {t("more_podcasts")}
            </AppText>
            <View style={styles.morePodcastsGrid}>
              {morePodcasts.map((podcast, index) => {
                const { isLiked, isDisliked } = isLikedOrDislikedByUser({
                  contentType: "podcast",
                  contentData: podcast,
                  userEngagements: userContentEngagements,
                });
                const podcastData = podcast; // Already destructured in getSimilarPodcasts

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
                      isLikedByUser={isLiked}
                      isDislikedByUser={isDisliked}
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

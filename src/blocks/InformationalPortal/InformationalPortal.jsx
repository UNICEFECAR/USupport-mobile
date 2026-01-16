import React, { useCallback, useState, useEffect, useContext } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { Block, AppText, Loading, CardMedia } from "#components";

import { VideoModal, PodcastModal } from "#backdrops";

import { appStyles } from "#styles";

import {
  destructureArticleData,
  destructureVideoData,
  destructurePodcastData,
  getLikesAndDislikesForContent,
  isLikedOrDislikedByUser,
} from "#utils";

import {
  useEventListener,
  useGetUserContentEngagements,
  useGetTheme,
} from "#hooks";

import { localStorage, adminSvc, cmsSvc, Context } from "#services";

/**
 * InformationPortal
 *
 * Information Portal block with modal support
 *
 * @returns {JSX.Element}
 */
export const InformationalPortal = ({
  navigation,
  contentType = "articles",
}) => {
  const { t, i18n } = useTranslation("blocks", {
    keyPrefix: "information-portal",
  });
  const { isHighContrast, isTmpUser } = useGetTheme();

  const [videoToPlay, setVideoToPlay] = useState(null);
  const [podcastToPlay, setPodcastToPlay] = useState(null);

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

  //--------------------- Content IDs ----------------------//
  const getContentIds = async () => {
    if (contentType === "articles") {
      return await adminSvc.getArticles();
    } else if (contentType === "videos") {
      return await adminSvc.getVideos();
    } else if (contentType === "podcasts") {
      return await adminSvc.getPodcasts();
    }
    return [];
  };

  const contentIdsQuery = useQuery(
    [`${contentType}Ids`, currentCountry, contentType],
    getContentIds,
    {
      enabled: !!currentCountry,
    }
  );

  // Modal handlers
  const handleVideoPlay = (url, title) => {
    setVideoToPlay({ url, title });
  };

  const handlePodcastPlay = (spotifyId, title) => {
    setPodcastToPlay({ spotifyId, title });
  };

  const ContentList = ({ heading, sortBy, sortField }) => {
    const { data: userContentEngagements } =
      useGetUserContentEngagements(!isTmpUser);

    const getContent = async () => {
      let service;
      let destructureData;

      if (contentType === "articles") {
        service = cmsSvc.getArticles;
        destructureData = destructureArticleData;
      } else if (contentType === "videos") {
        service = cmsSvc.getVideos;
        destructureData = destructureVideoData;
      } else if (contentType === "podcasts") {
        service = cmsSvc.getPodcasts;
        destructureData = destructurePodcastData;
      }

      let { data } = await service({
        limit: 2,
        sortBy: sortField,
        sortOrder: "desc",
        locale: i18n.language,
        populate: true,
        ids: contentIdsQuery.data,
      });

      // Handle async destructurePodcastData for podcasts
      if (contentType === "podcasts") {
        const contentItems = data.data || [];
        return await Promise.all(
          contentItems.map((item) => destructureData(item))
        );
      }

      return data.data.map(destructureData);
    };

    const {
      data: contentItems,
      isLoading,
      isFetched,
    } = useQuery(
      [`${contentType}-${sortBy}`, i18n.language, contentIdsQuery.data],
      getContent,
      {
        enabled: !contentIdsQuery.isLoading && contentIdsQuery.data?.length > 0,
        refetchOnWindowFocus: false,
        retry: false,
      }
    );

    const handleRedirect = () => {
      let screenName;
      if (contentType === "articles") screenName = "Articles";
      else if (contentType === "videos") screenName = "Videos";
      else if (contentType === "podcasts") screenName = "Podcasts";

      navigation.push(screenName, {
        sort: sortField,
      });
    };

    // Get likes and dislikes for content items
    const { data: contentLikesAndDislikes } = useQuery(
      [
        `${contentType}-likes-dislikes-${sortBy}`,
        contentItems?.map((item) => item.id),
      ],
      async () => {
        if (!contentItems?.length)
          return { likes: new Map(), dislikes: new Map() };
        const ids = contentItems.map((item) => item.id);

        const contentTypeString =
          contentType === "articles"
            ? "article"
            : contentType === "videos"
              ? "video"
              : "podcast";

        return await getLikesAndDislikesForContent(ids, contentTypeString);
      },
      {
        enabled: !!contentItems?.length,
        refetchOnWindowFocus: false,
      }
    );

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Loading style={styles.loading} />
        </View>
      );
    }

    const hasNoData = isFetched && (!contentItems || contentItems.length === 0);

    return (
      <>
        <View style={styles.headingContainer}>
          <AppText namedStyle="h3">{heading}</AppText>
          <AppText
            style={[styles.viewAllText, isHighContrast && styles.viewAllTextHC]}
            onPress={handleRedirect}
          >
            {t("view_all")}
          </AppText>
        </View>

        {hasNoData ? (
          <AppText style={styles.noResults}>{t("no_results")}</AppText>
        ) : (
          <View style={styles.articlesContainer}>
            {contentItems?.map((item, index) => {
              const contentTypeString =
                contentType === "articles"
                  ? "article"
                  : contentType === "videos"
                    ? "video"
                    : "podcast";

              console.log("contentTypeString", contentTypeString);
              const { isLiked, isDisliked } = isLikedOrDislikedByUser({
                contentType: contentTypeString,
                contentData: item,
                userEngagements: userContentEngagements,
              });

              let screenName, idParam;
              if (contentType === "articles") {
                screenName = "ArticleInformation";
                idParam = "articleId";
              } else if (contentType === "videos") {
                screenName = "VideoInformation";
                idParam = "videoId";
              } else if (contentType === "podcasts") {
                screenName = "PodcastInformation";
                idParam = "podcastId";
              }
              console.log(idParam, "idParam");
              let handlePlayFunction;
              if (contentType === "videos") {
                handlePlayFunction = () =>
                  handleVideoPlay(item.originalUrl, item.title);
              } else if (contentType === "podcasts") {
                handlePlayFunction = () =>
                  handlePodcastPlay(item.spotifyId, item.title);
              }

              return (
                <CardMedia
                  title={item.title}
                  image={
                    contentType === "articles" || contentType === "podcasts"
                      ? item.imageMedium ||
                        item.imageSmall ||
                        item.imageThumbnail
                      : item.image
                  }
                  description={item.description}
                  labels={item.labels}
                  creator={item.creator}
                  readingTime={item.readingTime}
                  categoryName={item.categoryName}
                  likes={contentLikesAndDislikes?.likes.get(item.id) || 0}
                  dislikes={contentLikesAndDislikes?.dislikes.get(item.id) || 0}
                  isLikedByUser={isLiked}
                  isDislikedByUser={isDisliked}
                  contentType={contentType}
                  onPress={() => {
                    console.log("ITEM", item);
                    navigation.push(screenName, {
                      [idParam]: item.id,
                    });
                  }}
                  handlePlay={handlePlayFunction}
                  t={t}
                  key={index}
                  style={styles.article}
                />
              );
            })}
          </View>
        )}
      </>
    );
  };

  const noContentForLanguage =
    contentIdsQuery.isFetched && contentIdsQuery.data?.length === 0;

  const noContentForLanguageText =
    contentType === "articles"
      ? t("heading_no_language_results")
      : contentType === "videos"
        ? t("heading_no_language_results_videos")
        : t("heading_no_language_results_podcasts");

  return (
    <>
      <VideoModal
        isVisible={!!videoToPlay}
        onClose={() => setVideoToPlay(null)}
        videoUrl={videoToPlay?.url}
        title={videoToPlay?.title}
        t={t}
      />

      <PodcastModal
        isVisible={!!podcastToPlay}
        onClose={() => setPodcastToPlay(null)}
        spotifyId={podcastToPlay?.spotifyId}
        title={podcastToPlay?.title}
        t={t}
      />

      <Block style={styles.informationalPortalBlock}>
        {noContentForLanguage ? (
          <AppText style={styles.headingNoLanguageResults} namedStyle="h3">
            {noContentForLanguageText}
          </AppText>
        ) : null}

        {!noContentForLanguage && (
          <>
            <ContentList
              heading={
                contentType === "articles"
                  ? t("heading_newest")
                  : contentType === "videos"
                    ? t("heading_newest_videos")
                    : t("heading_newest_podcasts")
              }
              sortBy="createdAt"
              sortField="createdAt"
            />
            <ContentList
              heading={
                contentType === "articles"
                  ? t("heading_popular")
                  : contentType === "videos"
                    ? t("heading_popular_videos")
                    : t("heading_popular_podcasts")
              }
              sortBy="popular"
              sortField={
                contentType === "articles"
                  ? "read_count"
                  : contentType === "videos"
                    ? "view_count"
                    : "view_count"
              }
            />
          </>
        )}
      </Block>
    </>
  );
};

const styles = StyleSheet.create({
  informationalPortalBlock: { paddingTop: 40 },
  headingNoLanguageResults: {
    marginBottom: 40,
    textAlign: "center",
  },
  headingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewAllText: {
    color: appStyles.colorSecondary_9749fa,
    fontFamily: appStyles.fontSemiBold,
  },
  viewAllTextHC: {
    color: "#fff",
    textDecorationColor: "#fff",
    textDecorationLine: "underline",
  },
  loading: { alignSelf: "center" },
  articlesContainer: { alignItems: "center", paddingTop: 16 },
  article: { marginBottom: 24 },
  loadingContainer: {
    minHeight: 220,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  noResults: {
    textAlign: "center",
    paddingVertical: 30,
  },
});

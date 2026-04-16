import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { WebView } from "react-native-webview";
import Share from "react-native-share";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { AppText, Icon, Label, Like } from "#components";
import LinearGradient from "../../components/LinearGradient";
import { cmsSvc } from "#services";
import {
  useAddContentRating,
  useGetTheme,
  useAddContentEngagement,
  useRemoveContentEngagement,
} from "#hooks";
import { appStyles } from "#styles";
import { constructShareUrl, showToast } from "#utils";

const SCREEN_WIDTH = Dimensions.get("window").width;
/** Spotify compact embed height (matches client-ui iframe). */
const SPOTIFY_EMBED_HEIGHT = 232;

/**
 * PodcastView
 *
 * Layout and styling aligned with client-ui podcast-view (glass card, title + share,
 * creator + category pill, labels + likes, player, description).
 *
 * @returns {JSX.Element}
 */
export const PodcastView = ({ podcastData, t, isTmpUser }) => {
  const { colors, isHighContrast, isDarkMode } = useGetTheme();
  const queryClient = useQueryClient();
  const creator = podcastData.creator ? podcastData.creator : null;

  const [isShared, setIsShared] = useState(false);
  const [contentRating, setContentRating] = useState({
    likes: podcastData.likes,
    dislikes: podcastData.dislikes,
    isLikedByUser: podcastData.contentRating?.isLikedByUser || false,
    isDislikedByUser: podcastData.contentRating?.isDislikedByUser || false,
  });

  const isLightTheme = colors.background === appStyles.colorWhite_ff;

  const glassGradient = useMemo(
    () => ({
      degrees: 145,
      locations: [0, 100],
      colors:
        isLightTheme && !isHighContrast
          ? ["rgba(255, 255, 255, 0.99)", "rgba(245, 248, 255, 0.85)"]
          : colors.cardMediaGradient,
    }),
    [isLightTheme, isHighContrast, colors.cardMediaGradient]
  );

  const metaAccentColor = isHighContrast
    ? appStyles.colorOrangeArticleCreatorHC_ffc18c
    : colors.cardMediaMetaText;

  const actionIconColor =
    isLightTheme && !isHighContrast
      ? appStyles.colorGray_66768d
      : appStyles.colorWhite_ff;

  const categoryBadgeStyle = useMemo(() => {
    if (isDarkMode && !isHighContrast) {
      return {
        backgroundColor: appStyles.colorGray_66768d,
        borderColor: "transparent",
      };
    }
    return {
      backgroundColor: appStyles.colorBlue_20809E_0_3,
      borderColor: "transparent",
    };
  }, [isDarkMode, isHighContrast]);

  const categoryTextColor = useMemo(() => {
    if (isDarkMode && !isHighContrast) {
      return appStyles.color_blue_c1d7e0;
    }
    return appStyles.colorBlue_3d527b;
  }, [isDarkMode, isHighContrast]);

  const addContentEngagementMutation = useAddContentEngagement();
  const removeContentEngagementMutation = useRemoveContentEngagement();

  useQuery(
    ["podcast-view-tracking", podcastData.id],
    async () => {
      addContentEngagementMutation({
        contentId: podcastData.id,
        contentType: "podcast",
        action: "view",
      });
      return true;
    },
    {
      enabled: !!podcastData?.id && !isTmpUser,
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  const onMutate = (data) => {
    const prevData = JSON.parse(JSON.stringify(contentRating));

    const likes = prevData.likes;
    const dislikes = prevData.dislikes;
    const isLikedByUser = prevData.isLikedByUser;
    const isDislikedByUser = prevData.isDislikedByUser;

    const newData = { ...contentRating };

    if (isLikedByUser && data.positive === null) {
      newData.likes = likes - 1;
      newData.isLikedByUser = false;

      cmsSvc.addRating({
        id: podcastData.id,
        action: "remove-like",
        contentType: "podcast",
      });
    }
    if (isDislikedByUser && data.positive === null) {
      newData.dislikes = dislikes - 1;
      newData.isDislikedByUser = false;
      cmsSvc.addRating({
        id: podcastData.id,
        action: "remove-dislike",
        contentType: "podcast",
      });
    }

    if (data.positive === true) {
      newData.likes = likes + 1;
      newData.isLikedByUser = true;
      cmsSvc.addRating({
        id: podcastData.id,
        action: "add-like",
        contentType: "podcast",
      });
      if (isDislikedByUser) {
        newData.dislikes = dislikes - 1;
        newData.isDislikedByUser = false;
        cmsSvc.addRating({
          id: podcastData.id,
          action: "remove-dislike",
          contentType: "podcast",
        });
      }
    }

    if (data.positive === false) {
      newData.dislikes = dislikes + 1;
      newData.isDislikedByUser = true;
      cmsSvc.addRating({
        id: podcastData.id,
        action: "add-dislike",
        contentType: "podcast",
      });
      if (isLikedByUser) {
        newData.likes = likes - 1;
        newData.isLikedByUser = false;
        cmsSvc.addRating({
          id: podcastData.id,
          action: "remove-like",
          contentType: "podcast",
        });
      }
    }

    setContentRating(newData);

    return () => {
      setContentRating(prevData);
    };
  };

  const onError = (error, rollback) => {
    rollback();
    showToast({ message: error, type: "error" });
  };

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["userContentRatings"] });
    queryClient.invalidateQueries({ queryKey: ["userContentEngagements"] });
  };

  const addContentRatingMutation = useAddContentRating(
    onMutate,
    onError,
    onSuccess
  );

  const handleAddRating = (action) => {
    if (isTmpUser) return;

    const isRemovingReaction =
      action === "remove-like" || action === "remove-dislike";

    if (isRemovingReaction) {
      removeContentEngagementMutation({
        contentId: podcastData.id,
        contentType: "podcast",
      });
    } else {
      addContentEngagementMutation({
        contentId: podcastData.id,
        contentType: "podcast",
        action: action === "like" ? "like" : "dislike",
      });
    }

    addContentRatingMutation({
      contentId: podcastData.id,
      positive: action === "like" ? true : isRemovingReaction ? null : false,

      contentType: "podcast",
    });
  };

  const handleShare = async () => {
    try {
      const url = await constructShareUrl({
        contentType: "podcast",
        id: podcastData.id,
        name: podcastData.title,
      });
      await Share.open({
        title: podcastData.title,
        message: `${t("check_podcast")}\n\n${url}`,
      });
      showToast({ message: t("share_success"), type: "success" });
      if (!isShared) {
        cmsSvc.addPodcastShareCount(podcastData.id).then(() => {
          setIsShared(true);
        });
        if (!isTmpUser) {
          addContentEngagementMutation({
            contentId: podcastData.id,
            contentType: "podcast",
            action: "share",
          });
        }
      }
    } catch (error) {
      if (error?.message && !error.message.includes("User did not share")) {
        console.log("Share error:", error);
      }
    }
  };

  const embedUrl = `https://open.spotify.com/embed/${podcastData.spotifyId}`;

  return (
    <View style={styles.screen}>
      <LinearGradient
        gradient={glassGradient}
        style={[
          styles.glassCard,
          isLightTheme && !isHighContrast
            ? styles.liquidGlassShadowLight
            : appStyles.cardMediaShadowDark,
          { borderColor: colors.cardMediaGradientBorder },
        ]}
      >
        <View style={styles.titleRow}>
          <AppText namedStyle="h2" style={styles.title}>
            {podcastData.title}
          </AppText>
          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={handleShare}
            accessibilityRole="button"
          >
            <Icon name="share" size="sm" color={actionIconColor} />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsRow}>
          {creator ? (
            <AppText
              namedStyle="smallText"
              style={[styles.creatorText, { color: metaAccentColor }]}
              numberOfLines={1}
            >
              {t("by", { creator })}
            </AppText>
          ) : null}
          {podcastData.categoryName ? (
            <View
              style={[
                styles.categoryBadge,
                categoryBadgeStyle,
                !creator && styles.categoryBadgeFirst,
              ]}
            >
              <AppText
                namedStyle="smallText"
                style={[styles.categoryBadgeText, { color: categoryTextColor }]}
              >
                {podcastData.categoryName}
              </AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.labelsLikeRow}>
          <View style={styles.labelsWrap}>
            {podcastData.labels?.map((label, index) => (
              <Label style={styles.label} text={label.name} key={index} />
            ))}
          </View>
          <View style={styles.likeWrap}>
            <Like
              size={30}
              handleClick={handleAddRating}
              likes={contentRating?.likes || 0}
              isLiked={contentRating?.isLikedByUser || false}
              dislikes={contentRating?.dislikes || 0}
              isDisliked={contentRating?.isDislikedByUser || false}
              answerId={podcastData.id}
            />
          </View>
        </View>

        <View style={styles.playerOuter}>
          <View style={styles.playerContainer}>
            <WebView
              source={{ uri: embedUrl }}
              style={styles.webView}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
            />
          </View>
        </View>

        {podcastData.description ? (
          <AppText
            namedStyle="text"
            style={[styles.description, { color: colors.textSecondary }]}
          >
            {podcastData.description}
          </AppText>
        ) : null}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
    maxWidth: SCREEN_WIDTH,
  },
  glassCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    padding: 16,
  },
  liquidGlassShadowLight: {
    shadowColor: "rgb(95, 108, 145)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    width: "100%",
  },
  title: {
    flex: 1,
    marginRight: 12,
    textAlign: "left",
  },
  actionIconBtn: {
    alignItems: "center",
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  detailsRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    width: "100%",
  },
  creatorText: {
    flexShrink: 1,
    marginRight: 8,
    maxWidth: "55%",
  },
  categoryBadge: {
    alignItems: "center",
    borderRadius: 25,
    height: 24,
    justifyContent: "center",
    marginLeft: 16,
    paddingHorizontal: 12,
  },
  categoryBadgeFirst: {
    marginLeft: 0,
  },
  categoryBadgeText: {
    fontFamily: appStyles.fontBold,
  },
  labelsLikeRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingTop: 8,
    width: "100%",
  },
  labelsWrap: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginRight: 8,
    maxWidth: "72%",
  },
  label: {
    marginBottom: 4,
    marginRight: 0,
    marginTop: 4,
    paddingVertical: 0,
  },
  likeWrap: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 120,
  },
  playerOuter: {
    marginBottom: 24,
    marginTop: 8,
    width: "100%",
  },
  playerContainer: {
    backgroundColor: appStyles.colorGray_ea,
    borderRadius: 8,
    height: SPOTIFY_EMBED_HEIGHT,
    overflow: "hidden",
    width: "100%",
  },
  webView: {
    flex: 1,
    height: SPOTIFY_EMBED_HEIGHT,
    width: "100%",
  },
  description: {
    textAlign: "left",
    width: "100%",
  },
});

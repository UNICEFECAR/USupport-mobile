import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { WebView } from "react-native-webview";
import Share from "react-native-share";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { AppText, Icon, Label, Like } from "#components";
import LinearGradient from "../../components/LinearGradient";
import { appStyles } from "#styles";
import { cmsSvc } from "#services";
import {
  useAddContentRating,
  useGetTheme,
  useAddContentEngagement,
  useRemoveContentEngagement,
} from "#hooks";
import { constructShareUrl, showToast } from "#utils";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CONTENT_WIDTH = SCREEN_WIDTH - 32;
const VIDEO_HEIGHT = (CONTENT_WIDTH * 9) / 16;

/**
 * VideoView
 *
 * Layout and styling aligned with client-ui video-view (title + share, creator +
 * category, labels + likes, embed, description).
 *
 * @returns {JSX.Element}
 */
export const VideoView = ({ videoData, t, isTmpUser }) => {
  const { colors, isHighContrast, isDarkMode } = useGetTheme();

  const [playing, setPlaying] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const webViewRef = useRef(null);
  const queryClient = useQueryClient();

  const creator = videoData.creator ? videoData.creator : null;

  const [contentRating, setContentRating] = useState({
    likes: videoData.likes || 0,
    dislikes: videoData.dislikes || 0,
    isLikedByUser: videoData.contentRating?.isLikedByUser || false,
    isDislikedByUser: videoData.contentRating?.isDislikedByUser || false,
  });

  const getVideoInfo = (url) => {
    if (!url) return { platform: null };

    const isYoutube = url.includes("youtube") || url.includes("youtu.be");
    const isVimeo = url.includes("vimeo");

    if (isYoutube) {
      return { platform: "youtube" };
    }
    if (isVimeo) {
      return { platform: "vimeo" };
    }

    return { platform: null };
  };

  const { platform } = getVideoInfo(videoData.originalUrl);

  const onStateChange = useCallback((state) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

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
    ["video-view-tracking", videoData.id],
    async () => {
      addContentEngagementMutation({
        contentId: videoData.id,
        contentType: "video",
        action: "view",
      });
      return true;
    },
    {
      enabled: !!videoData?.id && !isTmpUser,
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
        id: videoData.id,
        action: "remove-like",
        contentType: "video",
      });
    }
    if (isDislikedByUser && data.positive === null) {
      newData.dislikes = dislikes - 1;
      newData.isDislikedByUser = false;
      cmsSvc.addRating({
        id: videoData.id,
        action: "remove-dislike",
        contentType: "video",
      });
    }

    if (data.positive === true) {
      newData.likes = likes + 1;
      newData.isLikedByUser = true;
      cmsSvc.addRating({
        id: videoData.id,
        action: "add-like",
        contentType: "video",
      });
      if (isDislikedByUser) {
        newData.dislikes = dislikes - 1;
        newData.isDislikedByUser = false;
        cmsSvc.addRating({
          id: videoData.id,
          action: "remove-dislike",
          contentType: "video",
        });
      }
    }

    if (data.positive === false) {
      newData.dislikes = dislikes + 1;
      newData.isDislikedByUser = true;
      cmsSvc.addRating({
        id: videoData.id,
        action: "add-dislike",
        contentType: "video",
      });
      if (isLikedByUser) {
        newData.likes = likes - 1;
        newData.isLikedByUser = false;
        cmsSvc.addRating({
          id: videoData.id,
          action: "remove-like",
          contentType: "video",
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
        contentId: videoData.id,
        contentType: "video",
      });
    } else {
      addContentEngagementMutation({
        contentId: videoData.id,
        contentType: "video",
        action: action === "like" ? "like" : "dislike",
      });
    }

    addContentRatingMutation({
      contentId: videoData.id,
      positive: action === "like" ? true : isRemovingReaction ? null : false,
      contentType: "video",
    });
  };

  const handleShare = async () => {
    try {
      const url = await constructShareUrl({
        contentType: "video",
        id: videoData.id,
        name: videoData.title,
      });
      await Share.open({
        title: videoData.title,
        message: `${t("check_video")}\n\n${url}`,
      });
      showToast({ message: t("share_success"), type: "success" });
      if (!isShared) {
        cmsSvc.addVideoShareCount(videoData.id).then(() => {
          setIsShared(true);
        });
        if (!isTmpUser) {
          addContentEngagementMutation({
            contentId: videoData.id,
            contentType: "video",
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

  const renderVideo = () => {
    if (!videoData?.videoId) {
      return null;
    }
    if (!platform) {
      return (
        <View style={styles.errorContainer}>
          <AppText style={styles.errorText}>{t("video_not_available")}</AppText>
        </View>
      );
    }
    if (platform === "youtube") {
      return (
        <YoutubePlayer
          height={VIDEO_HEIGHT}
          width={CONTENT_WIDTH}
          play={playing}
          videoId={videoData.videoId}
          onChangeState={onStateChange}
        />
      );
    }

    if (platform === "vimeo") {
      const embedUrl = `https://player.vimeo.com/video/${videoData.videoId}?title=0&byline=0&portrait=0`;
      return (
        <WebView
          ref={webViewRef}
          style={styles.webview}
          source={{ uri: embedUrl }}
          allowsFullscreenVideo
          onError={() => console.log("WebView error")}
        />
      );
    }

    return null;
  };

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
            {videoData.title}
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
          {videoData.categoryName ? (
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
                {videoData.categoryName}
              </AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.labelsLikeRow}>
          <View style={styles.labelsWrap}>
            {videoData.labels?.map((label, index) => (
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
              answerId={videoData.id}
            />
          </View>
        </View>

        <View style={styles.videoOuter}>
          <View style={styles.videoContainer}>{renderVideo()}</View>
        </View>

        {videoData.description ? (
          <AppText
            namedStyle="text"
            style={[styles.description, { color: colors.textSecondary }]}
          >
            {videoData.description}
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
  videoOuter: {
    marginBottom: 24,
    marginTop: 12,
    width: "100%",
  },
  videoContainer: {
    alignItems: "center",
    backgroundColor: appStyles.colorBlack_37,
    borderRadius: 10,
    justifyContent: "center",
    minHeight: VIDEO_HEIGHT,
    overflow: "hidden",
    width: "100%",
    ...appStyles.cardMediaShadowLight,
  },
  webview: {
    height: VIDEO_HEIGHT,
    width: "100%",
  },
  description: {
    textAlign: "left",
    width: "100%",
  },
  errorContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: VIDEO_HEIGHT,
    paddingHorizontal: 16,
    width: "100%",
  },
  errorText: {
    color: appStyles.colorDanger,
    textAlign: "center",
  },
});

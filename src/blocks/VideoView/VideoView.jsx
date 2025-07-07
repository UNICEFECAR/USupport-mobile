import React, { useState, useCallback, useRef, useEffect } from "react";
import { StyleSheet, View, Dimensions, Platform } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { WebView } from "react-native-webview";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Block, AppText, Loading, Label } from "#components";
import { appStyles } from "#styles";
import { Like } from "../../components/icons/Like";

import { userSvc, cmsSvc } from "#services";
import { useAddContentRating, useGetTheme } from "#hooks";

const SCREEN_WIDTH = Dimensions.get("window").width;
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16; // 16:9 aspect ratio

/**
 * VideoView
 *
 * Video view block component
 *
 * @returns {JSX.Element}
 */
export const VideoView = ({ videoData, t }) => {
  const { colors } = useGetTheme();

  const [playing, setPlaying] = useState(false);
  const webViewRef = useRef(null);
  const queryClient = useQueryClient();

  const [contentRating, setContentRating] = useState(videoData.contentRating);
  useEffect(() => {
    setContentRating(videoData.contentRating);
  }, [videoData.contentRating]);

  // Extract video ID and platform from URL
  const getVideoInfo = (url) => {
    if (!url) return { platform: null, videoId: null };

    const isYoutube = url.includes("youtube");
    const isVimeo = url.includes("vimeo");

    if (isYoutube) {
      return { platform: "youtube" };
    } else if (isVimeo) {
      return { platform: "vimeo" };
    }

    return { platform: null };
  };

  const { platform } = getVideoInfo(videoData.originalUrl);

  // Handle video state change (for YouTube)
  const onStateChange = useCallback((state) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  // // Update view count
  // const updateViewCount = async () => {
  //   try {
  //     await userSvc.rateContent({
  //       contentType: "video",
  //       contentId: videoData.id,
  //       action: "view",
  //     });
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  // useQuery(["update-view-count", videoData.id], updateViewCount, {
  //   enabled: !!videoData.id,
  // });

  // Like/Dislike functionality
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
    toast.error(error);
  };

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["userContentRatings"] });
  };

  const addContentRatingMutation = useAddContentRating(
    onMutate,
    onError,
    onSuccess
  );

  const handleAddRating = (action) => {
    addContentRatingMutation({
      contentId: videoData.id,
      positive:
        action === "like"
          ? true
          : action === "remove-like" || action === "remove-dislike"
            ? null
            : false,
      contentType: "video",
    });
  };

  const renderVideo = () => {
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
          play={playing}
          videoId={videoData.videoId}
          onStateChange={onStateChange}
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
  };

  return (
    <Block style={styles.videoViewBlock}>
      <View style={styles.categoryContainer}>
        <AppText
          namedStyle="smallText"
          style={[styles.categoryText, { color: colors.text }]}
        >
          {videoData.categoryName}
        </AppText>
      </View>
      <View style={styles.videoContainer}>{renderVideo()}</View>

      <View>
        {videoData.description && (
          <AppText style={styles.description}>{videoData.description}</AppText>
        )}

        {videoData.creator && (
          <AppText style={styles.creator}>{videoData.creator}</AppText>
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={styles.labelsContainer}>
            {videoData.labels &&
              videoData.labels.length > 0 &&
              videoData.labels.map((label, index) => (
                <Label style={styles.label} text={label.name} key={index} />
              ))}
          </View>
          <Like
            handleClick={handleAddRating}
            likes={contentRating?.likes || 0}
            isLiked={contentRating?.isLikedByUser || false}
            dislikes={contentRating?.dislikes || 0}
            isDisliked={contentRating?.isDislikedByUser || false}
            answerId={videoData.id}
          />
        </View>
      </View>
    </Block>
  );
};

const styles = StyleSheet.create({
  videoViewBlock: {
    flex: 1,
    paddingTop: 84,
  },
  videoContainer: {
    width: "100%",
    height: VIDEO_HEIGHT,
    backgroundColor: appStyles.colorBlack_37,
    marginBottom: 16,
  },
  webview: {
    width: "100%",
    height: "100%",
  },

  title: {
    marginBottom: 12,
  },
  description: {
    marginBottom: 16,
  },
  creator: {
    color: appStyles.colorGray_92,
    marginBottom: 16,
  },
  labelsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "70%",
  },
  label: {
    marginRight: 8,
    marginBottom: 8,
    paddingVertical: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: appStyles.colorDanger,
  },
  categoryContainer: {
    marginBottom: 5,
    backgroundColor: appStyles.colorBlue_20809E_0_3,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 25,
    justifyContent: "center",
    width: "auto",
    alignSelf: "flex-start",
  },
  categoryText: {
    fontFamily: appStyles.fontBold,
    color: appStyles.colorBlue_3d527b,
  },
});

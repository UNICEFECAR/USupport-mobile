import React, { useState, useCallback, useRef, useEffect } from "react";
import { StyleSheet, View, Dimensions, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Block, AppText, Label, Icon, Like } from "#components";
import { userSvc, cmsSvc } from "#services";
import { useAddContentRating, useGetTheme } from "#hooks";
import { appStyles } from "#styles";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PLAYER_HEIGHT = (SCREEN_WIDTH * 9) / 16; // 16:9 aspect ratio

/**
 * PodcastView
 *
 * Podcast view block component
 *
 * @returns {JSX.Element}
 */
export const PodcastView = ({ podcastData, t }) => {
  const { colors } = useGetTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const webViewRef = useRef(null);
  const queryClient = useQueryClient();

  const [contentRating, setContentRating] = useState(podcastData.contentRating);
  useEffect(() => {
    setContentRating(podcastData.contentRating);
  }, [podcastData.contentRating]);

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
    console.log(error);
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
      contentId: podcastData.id,
      positive:
        action === "like"
          ? true
          : action === "remove-like" || action === "remove-dislike"
            ? null
            : false,
      contentType: "podcast",
    });
  };

  // Detect message from WebView
  const onWebViewMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === "playStateChanged") {
        setIsPlaying(message.isPlaying);
      }
    } catch (error) {
      console.log("Error parsing WebView message:", error);
    }
  };

  // Inject JavaScript to get player status
  const INJECTED_JAVASCRIPT = `
    window.addEventListener('message', function(e) {
      if (e.data.type === 'player_status_update') {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'playStateChanged',
          isPlaying: e.data.playing
        }));
      }
    });
    true;
  `;

  const renderPodcastPlayer = () => {
    const embedUrl = `https://open.spotify.com/embed/${podcastData.spotifyId}`;
    return (
      <WebView
        ref={webViewRef}
        source={{ uri: embedUrl }}
        style={styles.webView}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        injectedJavaScript={INJECTED_JAVASCRIPT}
        onMessage={onWebViewMessage}
      />
    );
  };

  return (
    <Block style={styles.podcastViewBlock}>
      <View style={styles.categoryContainer}>
        <AppText
          namedStyle="smallText"
          style={[styles.categoryText, { color: colors.text }]}
        >
          {podcastData.categoryName}
        </AppText>
      </View>

      <View style={styles.playerContainer}>{renderPodcastPlayer()}</View>

      <View>
        {podcastData.description && (
          <AppText style={styles.description}>
            {podcastData.description}
          </AppText>
        )}

        {podcastData.creator && (
          <AppText style={styles.creator}>{podcastData.creator}</AppText>
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={styles.labelsContainer}>
            {podcastData.labels &&
              podcastData.labels.length > 0 &&
              podcastData.labels.map((label, index) => (
                <Label style={styles.label} text={label.name} key={index} />
              ))}
          </View>
          <Like
            handleClick={handleAddRating}
            likes={contentRating?.likes || 0}
            isLiked={contentRating?.isLikedByUser || false}
            dislikes={contentRating?.dislikes || 0}
            isDisliked={contentRating?.isDislikedByUser || false}
            answerId={podcastData.id}
          />
        </View>
      </View>
    </Block>
  );
};

const styles = StyleSheet.create({
  podcastViewBlock: {
    flex: 1,
    paddingTop: 84,
  },
  playerContainer: {
    width: "100%",
    height: PLAYER_HEIGHT,
    backgroundColor: appStyles.colorGray_ea,
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  webView: {
    width: "100%",
    height: "100%",
  },
  playButton: {
    marginRight: 16,
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
  errorText: {
    color: appStyles.colorDanger,
    textAlign: "center",
    marginTop: 16,
  },
});

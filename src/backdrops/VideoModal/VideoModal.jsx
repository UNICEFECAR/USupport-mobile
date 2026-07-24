import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  BackHandler,
  Dimensions,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { WebView } from "react-native-webview";
import { AppText } from "#components";
import { appStyles } from "#styles";

const { width, height } = Dimensions.get("window");
const VIDEO_HEIGHT = (width * 0.9 * 9) / 16;

/**
 * VideoModal for React Native
 *
 * Modal component for playing videos using YoutubePlayer and WebView
 *
 * @return {jsx}
 */
export const VideoModal = ({ isVisible, onClose, videoUrl, title, t }) => {
  const [playing, setPlaying] = useState(false);
  const webViewRef = useRef(null);

  useEffect(() => {
    const backAction = () => {
      if (isVisible) {
        onClose();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isVisible, onClose]);

  useEffect(() => {
    if (isVisible) {
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  }, [isVisible]);

  const onStateChange = useCallback((state) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  const getVideoInfo = useCallback((url) => {
    if (!url) return { platform: null, videoId: null };

    const isYoutube = url.includes("youtube") || url.includes("youtu.be");
    const isVimeo = url.includes("vimeo");

    if (isYoutube) {
      // Extract YouTube video ID
      const regex =
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(regex);
      const videoId = match ? match[1] : null;
      return { platform: "youtube", videoId };
    } else if (isVimeo) {
      // Extract Vimeo video ID
      const regex = /vimeo\.com\/(?:.*\/)?(\d+)/;
      const match = url.match(regex);
      const videoId = match ? match[1] : null;
      return { platform: "vimeo", videoId };
    }

    return { platform: null, videoId: null };
  }, []);

  if (!isVisible) return null;

  const { platform, videoId } = getVideoInfo(videoUrl);

  const handleOverlayPress = () => {
    onClose();
  };

  const renderVideo = () => {
    if (!platform) {
      return (
        <View style={styles.errorContainer}>
          <AppText style={styles.errorText}>
            {t ? t("video_not_available") : "Video not available"}
          </AppText>
        </View>
      );
    }

    if (platform === "youtube") {
      return (
        <YoutubePlayer
          height={VIDEO_HEIGHT}
          play={playing}
          videoId={videoId}
          onChangeState={onStateChange}
          webViewProps={{
            allowsFullscreenVideo: true,
          }}
        />
      );
    }

    if (platform === "vimeo") {
      const embedUrl = `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`;
      return (
        <WebView
          ref={webViewRef}
          style={styles.videoWebView}
          source={{ uri: embedUrl }}
          allowsFullscreenVideo
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          onError={() => console.log("WebView error")}
        />
      );
    }

    return null;
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContent}>
              <View style={styles.videoContainer}>{renderVideo()}</View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.9,
    maxWidth: 600,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    maxHeight: height * 0.8,
  },
  videoContainer: {
    width: "100%",
    height: VIDEO_HEIGHT,
    backgroundColor: appStyles.colorBlack_37 || "#000",
  },
  videoWebView: {
    width: "100%",
    height: "100%",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    fontSize: 16,
    color: appStyles.colorDanger || "#666",
    textAlign: "center",
  },
});

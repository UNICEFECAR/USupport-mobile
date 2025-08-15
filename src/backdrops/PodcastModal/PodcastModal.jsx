import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  BackHandler,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import { AppText } from "#components";
import { appStyles } from "#styles";

const { width } = Dimensions.get("window");
const PLAYER_HEIGHT = 352;

/**
 * PodcastModal for React Native
 *
 * Modal component for playing podcasts using Spotify WebView
 *
 * @return {jsx}
 */
export const PodcastModal = ({ isVisible, onClose, spotifyId, title, t }) => {
  const [isPlaying, setIsPlaying] = useState(false);
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

  if (!isVisible) return null;

  const handleOverlayPress = () => {
    onClose();
  };

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
    if (!spotifyId) {
      return (
        <View style={styles.errorContainer}>
          <AppText style={styles.errorText}>
            {t ? t("podcast_unavailable") : "Podcast unavailable"}
          </AppText>
        </View>
      );
    }

    const embedUrl = `https://open.spotify.com/embed/${spotifyId}`;
    return (
      <WebView
        ref={webViewRef}
        source={{ uri: embedUrl }}
        style={styles.webView}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        mixedContentMode="compatibility"
        injectedJavaScript={INJECTED_JAVASCRIPT}
        onMessage={onWebViewMessage}
        userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15"
      />
    );
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
              <View style={styles.playerContainer}>
                {renderPodcastPlayer()}
              </View>
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
  },
  playerContainer: {
    width: "100%",
    height: PLAYER_HEIGHT,
    backgroundColor: appStyles.colorGray_ea || "#f5f5f5",
  },
  webView: {
    width: "100%",
    height: "100%",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: appStyles.colorDanger || "#666",
    textAlign: "center",
  },
});

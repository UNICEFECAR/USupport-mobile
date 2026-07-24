import React, { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { CameraView } from "expo-camera";

import { Backdrop, Icon, AppText } from "#components";
import { Loading } from "../../components/loaders";
import { useMediaPreview } from "#hooks";
import { appStyles } from "#styles";

const MediaPreviewPanel = ({ t, preview, onRetry }) => {
  const {
    videoEnabled,
    audioEnabled,
    micLevel,
    isLoading,
    hasStream,
    error,
    toggleVideo,
    toggleAudio,
  } = preview;

  if (isLoading) {
    return (
      <View style={[styles.preview, styles.previewCentered]}>
        <Loading size="md" />
        <AppText namedStyle="smallText" style={styles.previewStatus}>
          {t("configuring_devices")}
        </AppText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.preview, styles.previewCentered]}>
        <Icon name="stop-camera" size="lg" color={appStyles.colorRed_eb5757} />
        <AppText namedStyle="smallText" style={styles.errorText}>
          {t("permissions_error")}
        </AppText>
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <AppText style={styles.retryButtonLabel}>{t("retry_permissions")}</AppText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.preview}>
      <View style={styles.videoContainer}>
        {hasStream && videoEnabled ? (
          <CameraView
            style={styles.video}
            facing="front"
            mirror
            ratio="4:3"
          />
        ) : (
          <View style={styles.videoPlaceholder}>
            <Icon name="person" size="lg" color="#ffffff" />
            {!videoEnabled ? (
              <AppText namedStyle="smallText" style={styles.videoPlaceholderText}>
                {t("camera_off_label")}
              </AppText>
            ) : null}
          </View>
        )}
      </View>

      <View style={styles.micMeter}>
        <Icon
          name={audioEnabled ? "microphone" : "stop-mic"}
          size="sm"
          color={stylesColors.purple}
        />
        <View style={styles.micMeterTrack}>
          <View
            style={[
              styles.micMeterFill,
              { width: `${audioEnabled ? micLevel : 0}%` },
            ]}
          />
        </View>
        <AppText namedStyle="smallText" style={styles.micMeterLabel}>
          {t("mic_level_label")}
        </AppText>
      </View>

      <View style={styles.controls}>
        <Pressable
          style={[
            styles.controlButton,
            !videoEnabled && styles.controlButtonOff,
          ]}
          onPress={toggleVideo}
        >
          <Icon
            name={videoEnabled ? "video" : "stop-camera"}
            size="md"
            color={stylesColors.purple}
          />
        </Pressable>

        <Pressable
          style={[
            styles.controlButton,
            !audioEnabled && styles.controlButtonOff,
          ]}
          onPress={toggleAudio}
        >
          <Icon
            name={audioEnabled ? "microphone" : "stop-mic"}
            size="md"
            color={stylesColors.purple}
          />
        </Pressable>
      </View>
    </View>
  );
};

export const DeviceTest = ({ isOpen, onClose, isInDashboard = false }) => {
  const { t } = useTranslation("backdrops", { keyPrefix: "device-test" });
  const preview = useMediaPreview(isOpen);

  useEffect(() => {
    if (isOpen) {
      preview.startPreview();
    }
  }, [isOpen, preview.startPreview]);

  const handleClose = async () => {
    await preview.stopStream();
    onClose();
  };

  return (
    <Backdrop
      title="DeviceTest"
      isOpen={isOpen}
      onClose={handleClose}
      heading={t("heading")}
      text={t("subheading")}
      ctaLabel={t("done")}
      ctaHandleClick={handleClose}
      ctaStyle={isInDashboard ? { marginBottom: 85 } : {}}
    >
      <MediaPreviewPanel t={t} preview={preview} onRetry={preview.startPreview} />
    </Backdrop>
  );
};

const stylesColors = {
  purple: "#6a4ffb",
  videoBg: "#1a1a2e",
};

const styles = StyleSheet.create({
  preview: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 16,
    width: "100%",
  },
  previewCentered: {
    minHeight: 280,
    justifyContent: "center",
  },
  previewStatus: {
    marginTop: 12,
    opacity: 0.8,
    textAlign: "center",
  },
  errorText: {
    opacity: 0.9,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: stylesColors.purple,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    overflow: "hidden",
  },
  retryButtonLabel: {
    color: stylesColors.purple,
    textAlign: "center",
  },
  videoContainer: {
    width: "100%",
    maxWidth: 420,
    aspectRatio: 4 / 3,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: stylesColors.videoBg,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  videoPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: stylesColors.videoBg,
  },
  videoPlaceholderText: {
    opacity: 0.7,
    color: "#ffffff",
    textAlign: "center",
  },
  micMeter: {
    width: "100%",
    maxWidth: 420,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  micMeterTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(106, 79, 251, 0.15)",
    overflow: "hidden",
  },
  micMeterFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: stylesColors.purple,
  },
  micMeterLabel: {
    minWidth: 90,
    textAlign: "right",
    opacity: 0.75,
  },
  controls: {
    flexDirection: "row",
    gap: 24,
    marginTop: 8,
  },
  controlButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2,
    borderColor: stylesColors.purple,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  controlButtonOff: {
    borderColor: appStyles.colorRed_eb5757,
    backgroundColor: "rgba(235, 87, 87, 0.08)",
  },
});


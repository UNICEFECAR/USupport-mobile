import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Slider } from "@react-native-assets/slider";
import { Audio } from "expo-av";

import { AppText } from "../../texts";
import { useGetTheme } from "#hooks";
import { appStyles } from "#styles";
import { Icon } from "../../icons";

const SEEK_STEP_MS = 15000;
const SEEK_STEP_SEC = SEEK_STEP_MS / 1000;
const PROGRESS_START = "#7FC6C9";
const PROGRESS_MID = "#6BB8C4";
const PROGRESS_END = "#5FA8B8";
const HEADER_SURFACE_LIGHT = "#E8F5F7";
const HEADER_SURFACE_DARK = "rgba(127, 198, 201, 0.18)";
const HELPER_STAR_LIGHT = "#9749fa";

const formatTime = (millis) => {
  const totalSeconds = Math.floor((millis || 0) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const hexToRgb = (hex) => {
  const normalized = hex.replace("#", "");
  const value = parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const rgbToHex = ({ r, g, b }) => {
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const blend = (a, b, factor) => {
  const clampFactor = Math.max(0, Math.min(1, factor));
  return Math.round(a + (b - a) * clampFactor);
};

const getProgressColor = (progress) => {
  const start = hexToRgb(PROGRESS_START);
  const mid = hexToRgb(PROGRESS_MID);
  const end = hexToRgb(PROGRESS_END);
  const p = Math.max(0, Math.min(1, progress));

  if (p <= 0.5) {
    const factor = p / 0.5;
    return rgbToHex({
      r: blend(start.r, mid.r, factor),
      g: blend(start.g, mid.g, factor),
      b: blend(start.b, mid.b, factor),
    });
  }

  const factor = (p - 0.5) / 0.5;
  return rgbToHex({
    r: blend(mid.r, end.r, factor),
    g: blend(mid.g, end.g, factor),
    b: blend(mid.b, end.b, factor),
  });
};

export const AudioPlayer = ({ sourceUrl, style }) => {
  const soundRef = useRef(null);
  const { t } = useTranslation("screens", {
    keyPrefix: "article-information",
  });
  const { colors, isDarkMode, isHighContrast } = useGetTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const progress =
    durationMillis > 0
      ? Math.max(0, Math.min(1, positionMillis / durationMillis))
      : 0;
  const progressColor = getProgressColor(progress);

  const listenMinutes =
    durationMillis > 0
      ? Math.max(1, Math.ceil(durationMillis / 60000))
      : 0;

  const headerIconColor = isHighContrast
    ? "#ffff00"
    : isDarkMode
      ? "#ededed"
      : appStyles.colorTextMain_0e202f;
  const helperStarColor = isHighContrast
    ? "#ffff00"
    : isDarkMode
      ? "#ededed"
      : HELPER_STAR_LIGHT;
  const headerSurface = isDarkMode ? HEADER_SURFACE_DARK : HEADER_SURFACE_LIGHT;

  const handlePlaybackStatusUpdate = (status) => {
    if (!status?.isLoaded) return;
    setPositionMillis(status.positionMillis || 0);
    setDurationMillis(status.durationMillis || 0);
    setIsPlaying(!!status.isPlaying);

    if (status.didJustFinish) {
      setIsPlaying(false);
      setPositionMillis(0);
    }
  };

  const unloadSound = async () => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.unloadAsync();
    } catch (error) {
      // Ignore unload cleanup errors.
    }
    soundRef.current = null;
  };

  const ensureSoundLoaded = async () => {
    if (soundRef.current) return soundRef.current;
    const { sound } = await Audio.Sound.createAsync(
      { uri: sourceUrl },
      { shouldPlay: false },
      handlePlaybackStatusUpdate
    );
    soundRef.current = sound;
    return sound;
  };

  const handlePlayPause = async () => {
    if (!sourceUrl || isLoading) return;
    try {
      setIsLoading(true);
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const sound = await ensureSoundLoaded();
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error("Audio player error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeekRelative = async (deltaMillis) => {
    if (!soundRef.current) return;
    const nextPosition = Math.max(
      0,
      Math.min(durationMillis, positionMillis + deltaMillis)
    );
    await soundRef.current.setPositionAsync(nextPosition);
  };

  const handleSliderComplete = async (value) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(value);
  };

  useEffect(() => {
    return () => {
      unloadSound();
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const preloadAudio = async () => {
      await unloadSound();
      if (isCancelled || !sourceUrl) {
        setIsLoading(false);
        setIsPlaying(false);
        setPositionMillis(0);
        setDurationMillis(0);
        return;
      }

      try {
        setIsLoading(true);
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const sound = await ensureSoundLoaded();
        const status = await sound.getStatusAsync();
        if (!isCancelled && status?.isLoaded) {
          setDurationMillis(status.durationMillis || 0);
          setPositionMillis(status.positionMillis || 0);
        }
      } catch (error) {
        console.error("Audio preload error:", error);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
          setIsPlaying(false);
        }
      }
    };

    preloadAudio();

    return () => {
      isCancelled = true;
    };
  }, [sourceUrl]);

  if (!sourceUrl) return null;

  return (
    <View
      style={[
        styles.container,
        style,
        {
          backgroundColor: isDarkMode
            ? appStyles.colorBlack_1e
            : appStyles.colorWhite_ff,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIconWrap, { backgroundColor: headerSurface }]}>
            <Icon name="sound-playing" size="md" color={headerIconColor} />
          </View>
          <View style={styles.headerCopy}>
            <AppText
              style={[styles.headerTitle, { color: colors.text }]}
              isSemibold
            >
              {t("audio_player_title")}
            </AppText>
            <AppText
              namedStyle="smallText"
              style={[styles.headerSubtitle, { color: colors.textSecondary }]}
            >
              {t("audio_player_subtitle")}
            </AppText>
          </View>
        </View>
        <View style={[styles.durationBadge, { backgroundColor: headerSurface }]}>
          <Icon name="time" size="sm" color={headerIconColor} />
          <AppText namedStyle="smallText" style={styles.durationBadgeText}>
            {t("audio_player_badge_listen_time", { minutes: listenMinutes })}
          </AppText>
        </View>
      </View>

      <View style={styles.timeRow}>
        <AppText namedStyle="smallText">{formatTime(positionMillis)}</AppText>
        <AppText namedStyle="smallText">{formatTime(durationMillis)}</AppText>
      </View>
      <Slider
        value={positionMillis}
        minimumValue={0}
        maximumValue={Math.max(durationMillis, 1)}
        minimumTrackTintColor={progressColor}
        maximumTrackTintColor={
          colors.separator || appStyles.colorBlue_20809E_0_3
        }
        onSlidingComplete={handleSliderComplete}
        trackHeight={4}
        thumbStyle={styles.thumb}
      />
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.smallControl}
          onPress={() => handleSeekRelative(-SEEK_STEP_MS)}
          accessibilityRole="button"
          accessibilityLabel={t("audio_player_seek_back_label", {
            seconds: SEEK_STEP_SEC,
          })}
        >
          <Icon name="seek-back" size="xxl" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.playControl}
          onPress={handlePlayPause}
          accessibilityRole="button"
          accessibilityLabel={
            isPlaying
              ? t("audio_player_pause_label")
              : t("audio_player_play_label")
          }
        >
          <Icon name={isPlaying ? "pause" : "play-gradient"} size="xxl" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.smallControl}
          onPress={() => handleSeekRelative(SEEK_STEP_MS)}
          accessibilityRole="button"
          accessibilityLabel={t("audio_player_seek_forward_label", {
            seconds: SEEK_STEP_SEC,
          })}
        >
          <Icon name="seek-forward" size="xxl" />
        </TouchableOpacity>
      </View>

      <View style={styles.helper}>
        <Icon name="star-full" size="sm" color={helperStarColor} />
        <AppText
          namedStyle="smallText"
          style={[styles.helperText, { color: colors.textSecondary }]}
        >
          {t("audio_player_helper")}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    ...appStyles.shadow2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 10,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  headerSubtitle: {
    marginTop: 2,
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    flexShrink: 0,
  },
  durationBadgeText: {
    flexShrink: 0,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: appStyles.colorWhite_ff,
    backgroundColor: "#7FC6C9",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  smallControl: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  playControl: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  helper: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 14,
    gap: 8,
  },
  helperText: {
    flex: 1,
  },
});

AudioPlayer.propTypes = {
  sourceUrl: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

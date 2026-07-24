import React, { useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";

import { useGetTheme } from "#hooks";
import { appStyles } from "#styles";

const SHIMMER_DURATION = 1200;

const ShimmerBlock = ({ style, shimmerProgress, colors }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(shimmerProgress.value, [0, 1], [-200, 200]),
      },
    ],
  }));

  return (
    <View style={[styles.shimmerWrapper, style]}>
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.base, borderRadius: style?.borderRadius },
        ]}
      />
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <ExpoLinearGradient
          colors={[colors.base, colors.highlight, colors.base]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

export const AnswerSkeleton = ({ style }) => {
  const { colors } = useGetTheme();
  const isLightTheme = colors.background === appStyles.colorWhite_ff;

  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    shimmerProgress.value = withRepeat(
      withTiming(1, { duration: SHIMMER_DURATION, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const neutralColors = useMemo(
    () =>
      isLightTheme
        ? { base: "#e4e9f2", highlight: "#f0f3f8" }
        : { base: "rgba(40, 56, 96, 0.5)", highlight: "rgba(55, 72, 115, 0.5)" },
    [isLightTheme]
  );

  const dateColors = useMemo(
    () =>
      isLightTheme
        ? { base: "#d8dde6", highlight: "#e8ecf2" }
        : { base: "rgba(55, 72, 115, 0.45)", highlight: "rgba(70, 88, 130, 0.55)" },
    [isLightTheme]
  );

  const tagColors = useMemo(
    () =>
      isLightTheme
        ? { base: "#ffdce5", highlight: "#ffedf2" }
        : { base: "rgba(143, 58, 84, 0.3)", highlight: "rgba(143, 58, 84, 0.45)" },
    [isLightTheme]
  );

  const titleColors = useMemo(
    () =>
      isLightTheme
        ? { base: "#c8d0de", highlight: "#d8dee8" }
        : { base: "rgba(55, 72, 115, 0.7)", highlight: "rgba(70, 88, 130, 0.7)" },
    [isLightTheme]
  );

  const buttonColors = useMemo(
    () =>
      isLightTheme
        ? { base: "#c4b8f0", highlight: "#d5cbf5" }
        : { base: "rgba(104, 77, 253, 0.4)", highlight: "rgba(119, 95, 243, 0.5)" },
    [isLightTheme]
  );

  const scheduleColors = useMemo(
    () =>
      isLightTheme
        ? { base: "#d6cdf5", highlight: "#e8e2fa" }
        : { base: "rgba(138, 75, 243, 0.3)", highlight: "rgba(138, 75, 243, 0.45)" },
    [isLightTheme]
  );

  const likeColors = useMemo(
    () =>
      isLightTheme
        ? { base: "#cde8ec", highlight: "#dff0f3" }
        : { base: "rgba(84, 207, 217, 0.2)", highlight: "rgba(84, 207, 217, 0.32)" },
    [isLightTheme]
  );

  const cardContainerStyle = [
    styles.answerOuter,
    isLightTheme
      ? appStyles.cardMediaShadowLight
      : appStyles.cardMediaShadowDark,
    style,
  ];

  const surfaceBg = isLightTheme ? colors.cardMedia : "rgba(30, 46, 86, 0.78)";

  return (
    <View style={cardContainerStyle}>
      <View
        style={[
          styles.answerSurface,
          {
            backgroundColor: surfaceBg,
            borderColor: colors.cardMediaBorder || "transparent",
          },
        ]}
      >
        <View style={styles.dateRow}>
          <ShimmerBlock
            style={styles.dateIcon}
            shimmerProgress={shimmerProgress}
            colors={dateColors}
          />
          <ShimmerBlock
            style={styles.dateText}
            shimmerProgress={shimmerProgress}
            colors={dateColors}
          />
        </View>

        <ShimmerBlock
          style={styles.tagPlaceholder}
          shimmerProgress={shimmerProgress}
          colors={tagColors}
        />

        <ShimmerBlock
          style={styles.titlePlaceholder}
          shimmerProgress={shimmerProgress}
          colors={titleColors}
        />
        <ShimmerBlock
          style={styles.titlePlaceholderShort}
          shimmerProgress={shimmerProgress}
          colors={titleColors}
        />

        <ShimmerBlock
          style={styles.answerLine}
          shimmerProgress={shimmerProgress}
          colors={neutralColors}
        />
        <ShimmerBlock
          style={styles.answerLineShort}
          shimmerProgress={shimmerProgress}
          colors={neutralColors}
        />

        <ShimmerBlock
          style={styles.readMorePlaceholder}
          shimmerProgress={shimmerProgress}
          colors={buttonColors}
        />

        <View style={styles.authorRow}>
          <ShimmerBlock
            style={styles.authorPrefix}
            shimmerProgress={shimmerProgress}
            colors={neutralColors}
          />
          <ShimmerBlock
            style={styles.avatarPlaceholder}
            shimmerProgress={shimmerProgress}
            colors={neutralColors}
          />
          <ShimmerBlock
            style={styles.authorName}
            shimmerProgress={shimmerProgress}
            colors={neutralColors}
          />
          <ShimmerBlock
            style={styles.answeredDate}
            shimmerProgress={shimmerProgress}
            colors={neutralColors}
          />
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.scheduleRow}>
            <ShimmerBlock
              style={styles.scheduleIcon}
              shimmerProgress={shimmerProgress}
              colors={scheduleColors}
            />
            <ShimmerBlock
              style={styles.scheduleText}
              shimmerProgress={shimmerProgress}
              colors={scheduleColors}
            />
          </View>
          <View style={styles.likeRow}>
            <ShimmerBlock
              style={styles.likeIcon}
              shimmerProgress={shimmerProgress}
              colors={likeColors}
            />
            <ShimmerBlock
              style={styles.likeIcon}
              shimmerProgress={shimmerProgress}
              colors={likeColors}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  answerOuter: {
    width: "96%",
    maxWidth: 420,
    alignSelf: "center",
    borderRadius: 24,
    overflow: "visible",
  },
  answerSurface: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  shimmerWrapper: {
    overflow: "hidden",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  dateText: {
    width: 88,
    height: 14,
    borderRadius: 7,
    marginLeft: 4,
  },
  tagPlaceholder: {
    width: 56,
    height: 20,
    borderRadius: 4,
    marginTop: 12,
  },
  titlePlaceholder: {
    width: "92%",
    height: 16,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  titlePlaceholderShort: {
    width: "65%",
    height: 16,
    borderRadius: 8,
  },
  answerLine: {
    width: "100%",
    height: 12,
    borderRadius: 6,
    marginTop: 12,
  },
  answerLineShort: {
    width: "78%",
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  readMorePlaceholder: {
    width: 110,
    height: 32,
    borderRadius: 8,
    marginTop: 12,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    flexWrap: "wrap",
  },
  authorPrefix: {
    width: 72,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  avatarPlaceholder: {
    width: 26,
    height: 26,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  authorName: {
    width: 100,
    height: 12,
    borderRadius: 6,
    marginLeft: 4,
  },
  answeredDate: {
    width: 80,
    height: 12,
    borderRadius: 6,
    marginLeft: 6,
  },
  bottomRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  scheduleIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  scheduleText: {
    width: 140,
    height: 14,
    borderRadius: 7,
    marginLeft: 8,
  },
  likeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  likeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

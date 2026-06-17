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

const LABEL_PALETTES_LIGHT = [
  { base: "#ffe4cc", highlight: "#fff2e6" },
  { base: "#d6f3e2", highlight: "#eafaf1" },
  { base: "#e5ddff", highlight: "#f2eeff" },
  { base: "#d6edf9", highlight: "#ebf6fc" },
  { base: "#fff2c9", highlight: "#fff9e6" },
  { base: "#ffdce5", highlight: "#ffedf2" },
];

const LABEL_PALETTES_DARK = [
  { base: "rgba(146, 85, 34, 0.3)", highlight: "rgba(146, 85, 34, 0.45)" },
  { base: "rgba(47, 110, 74, 0.3)", highlight: "rgba(47, 110, 74, 0.45)" },
  { base: "rgba(89, 70, 160, 0.3)", highlight: "rgba(89, 70, 160, 0.45)" },
  { base: "rgba(45, 99, 130, 0.3)", highlight: "rgba(45, 99, 130, 0.45)" },
  { base: "rgba(138, 107, 31, 0.3)", highlight: "rgba(138, 107, 31, 0.45)" },
  { base: "rgba(143, 58, 84, 0.3)", highlight: "rgba(143, 58, 84, 0.45)" },
];

export const CardMediaSkeleton = ({ style }) => {
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

  const imageColors = useMemo(
    () =>
      isLightTheme
        ? { base: "#dce3ef", highlight: "#eaeff6" }
        : { base: "rgba(35, 50, 88, 0.6)", highlight: "rgba(50, 66, 108, 0.6)" },
    [isLightTheme]
  );

  const categoryColors = useMemo(
    () =>
      isLightTheme
        ? { base: "rgba(209, 231, 250, 0.9)", highlight: "#e4f0fb" }
        : { base: "rgba(60, 109, 159, 0.4)", highlight: "rgba(75, 125, 175, 0.45)" },
    [isLightTheme]
  );

  const labelPalettes = isLightTheme ? LABEL_PALETTES_LIGHT : LABEL_PALETTES_DARK;

  const titleColors = useMemo(
    () =>
      isLightTheme
        ? { base: "#c8d0de", highlight: "#d8dee8" }
        : { base: "rgba(55, 72, 115, 0.7)", highlight: "rgba(70, 88, 130, 0.7)" },
    [isLightTheme]
  );

  const creatorColors = useMemo(
    () =>
      isLightTheme
        ? { base: "#edddd0", highlight: "#f5ebe2" }
        : { base: "rgba(186, 116, 70, 0.25)", highlight: "rgba(186, 116, 70, 0.38)" },
    [isLightTheme]
  );

  const buttonColors = useMemo(
    () =>
      isLightTheme
        ? { base: "#c4b8f0", highlight: "#d5cbf5" }
        : { base: "rgba(104, 77, 253, 0.4)", highlight: "rgba(119, 95, 243, 0.5)" },
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
    styles.cardMediaOuter,
    isLightTheme
      ? appStyles.cardMediaShadowLight
      : appStyles.cardMediaShadowDark,
    style,
  ];

  const surfaceBg = isLightTheme
    ? colors.cardMedia
    : "rgba(30, 46, 86, 0.78)";

  const separatorColor = colors.cardMediaSeparator;

  return (
    <View style={cardContainerStyle}>
      <View
        style={[
          styles.cardMediaSurface,
          {
            backgroundColor: surfaceBg,
            borderColor: colors.cardMediaBorder || "transparent",
          },
        ]}
      >
        <ShimmerBlock
          style={styles.imagePlaceholder}
          shimmerProgress={shimmerProgress}
          colors={imageColors}
        />

        <ShimmerBlock
          style={styles.categoryPlaceholder}
          shimmerProgress={shimmerProgress}
          colors={categoryColors}
        />

        <View style={styles.textContainer}>
          <View style={styles.labelsContainer}>
            <ShimmerBlock
              style={styles.labelPlaceholder}
              shimmerProgress={shimmerProgress}
              colors={labelPalettes[0]}
            />
            <ShimmerBlock
              style={styles.labelPlaceholderShort}
              shimmerProgress={shimmerProgress}
              colors={labelPalettes[1]}
            />
            <ShimmerBlock
              style={styles.labelPlaceholderMed}
              shimmerProgress={shimmerProgress}
              colors={labelPalettes[2]}
            />
          </View>

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

          <View style={styles.metaRow}>
            <ShimmerBlock
              style={styles.creatorPlaceholder}
              shimmerProgress={shimmerProgress}
              colors={creatorColors}
            />
            <ShimmerBlock
              style={styles.readingTimePlaceholder}
              shimmerProgress={shimmerProgress}
              colors={neutralColors}
            />
          </View>

          <ShimmerBlock
            style={styles.descriptionPlaceholder}
            shimmerProgress={shimmerProgress}
            colors={neutralColors}
          />
          <ShimmerBlock
            style={styles.descriptionPlaceholderShort}
            shimmerProgress={shimmerProgress}
            colors={neutralColors}
          />

          <View
            style={[styles.bottomContainer, { borderTopColor: separatorColor }]}
          >
            <ShimmerBlock
              style={styles.readMorePlaceholder}
              shimmerProgress={shimmerProgress}
              colors={buttonColors}
            />
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
    </View>
  );
};

const styles = StyleSheet.create({
  cardMediaOuter: {
    width: "96%",
    maxWidth: 420,
    alignSelf: "center",
    borderRadius: 24,
    overflow: "visible",
  },
  cardMediaSurface: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },

  shimmerWrapper: {
    overflow: "hidden",
  },

  imagePlaceholder: {
    width: "100%",
    height: 160,
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
  },

  categoryPlaceholder: {
    position: "absolute",
    top: 20,
    left: 24,
    width: 80,
    height: 22,
    borderRadius: 10,
    zIndex: 4,
  },

  textContainer: {
    padding: 16,
  },

  labelsContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  labelPlaceholder: {
    width: 72,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
  },
  labelPlaceholderShort: {
    width: 48,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
  },
  labelPlaceholderMed: {
    width: 60,
    height: 20,
    borderRadius: 4,
  },

  titlePlaceholder: {
    width: "90%",
    height: 14,
    borderRadius: 7,
    marginBottom: 8,
  },
  titlePlaceholderShort: {
    width: "60%",
    height: 14,
    borderRadius: 7,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  creatorPlaceholder: {
    width: 100,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  readingTimePlaceholder: {
    width: 60,
    height: 12,
    borderRadius: 6,
  },

  descriptionPlaceholder: {
    width: "100%",
    height: 12,
    borderRadius: 6,
    marginTop: 12,
  },
  descriptionPlaceholderShort: {
    width: "75%",
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },

  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
  },
  readMorePlaceholder: {
    width: 110,
    height: 32,
    borderRadius: 8,
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

import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView, Platform } from "react-native";
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
const PILL_WIDTHS = [56, 88, 72, 96, 68, 80];

const ShimmerPill = ({ width, shimmerProgress, colors, borderColor, style }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(shimmerProgress.value, [0, 1], [-width, width]),
      },
    ],
  }));

  return (
    <View
      style={[
        styles.pill,
        { width, borderColor, backgroundColor: colors.base },
        style,
      ]}
    >
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

export const TabsSkeleton = ({ style, count = 6 }) => {
  const { colors, isHighContrast } = useGetTheme();
  const isLightTheme = colors.background === appStyles.colorWhite_ff;

  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    shimmerProgress.value = withRepeat(
      withTiming(1, { duration: SHIMMER_DURATION, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const unselectedColors = useMemo(
    () =>
      isLightTheme
        ? {
            base:
              Platform.OS === "android"
                ? "#e1e9fc"
                : (colors.cardMediaGradient?.[0] ?? "rgba(225, 233, 252, 0.9)"),
            highlight:
              Platform.OS === "android"
                ? "#edf5ff"
                : (colors.tabSelectedGradient?.[0] ?? "rgba(237, 245, 255, 0.7)"),
          }
        : {
            base: colors.cardMediaGradient?.[0] ?? "rgba(30, 46, 86, 0.82)",
            highlight:
              colors.tabSelectedGradient?.[0] ?? "rgba(38, 58, 105, 0.86)",
          },
    [isLightTheme, colors]
  );

  const selectedColors = useMemo(
    () =>
      isLightTheme
        ? {
            base:
              Platform.OS === "android" && !isHighContrast
                ? "#edf5ff"
                : (colors.tabSelectedGradient?.[0] ?? "rgba(237, 245, 255, 0.34)"),
            highlight: "#f5f9ff",
          }
        : {
            base: colors.tabSelectedGradient?.[0] ?? "rgba(38, 58, 105, 0.86)",
            highlight: "rgba(50, 70, 120, 0.9)",
          },
    [isLightTheme, isHighContrast, colors]
  );

  const borderColor = colors.cardMediaGradientBorder || "rgba(224, 233, 255, 0.72)";

  return (
    <View style={[styles.wrapper, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={styles.scrollContent}
      >
        {Array.from({ length: count }).map((_, i) => (
          <ShimmerPill
            key={i}
            width={PILL_WIDTHS[i % PILL_WIDTHS.length]}
            shimmerProgress={shimmerProgress}
            colors={i === 0 ? selectedColors : unselectedColors}
            borderColor={borderColor}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    overflow: "hidden",
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  scrollContent: {
    alignItems: "center",
    paddingRight: 8,
    paddingVertical: 2,
  },
  pill: {
    height: 32,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1.5,
    overflow: "hidden",
  },
});

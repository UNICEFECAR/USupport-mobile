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
const TAB_WIDTHS = [72, 88, 64];

const ShimmerPill = ({ width, shimmerProgress, colors, isSelected, accentColor }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(shimmerProgress.value, [0, 1], [-width, width]),
      },
    ],
  }));

  return (
    <View style={styles.tab}>
      <View
        style={[
          styles.pill,
          { width, backgroundColor: colors.base },
          isSelected && { borderBottomColor: accentColor },
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
    </View>
  );
};

export const TabsUnderlinedSkeleton = ({ style, count = 3 }) => {
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

  const shimmerColors = useMemo(
    () =>
      isLightTheme
        ? { base: "#d4e4f2", highlight: "#e8f2fa" }
        : {
            base: "rgba(55, 72, 115, 0.55)",
            highlight: "rgba(70, 88, 130, 0.65)",
          },
    [isLightTheme]
  );

  const accentColor = colors.tabUnderlinedBorder;

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: count }).map((_, i) => (
        <ShimmerPill
          key={i}
          width={TAB_WIDTHS[i % TAB_WIDTHS.length]}
          shimmerProgress={shimmerProgress}
          colors={shimmerColors}
          isSelected={i === 0}
          accentColor={accentColor}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  pill: {
    height: 22,
    borderRadius: 6,
    overflow: "hidden",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
});

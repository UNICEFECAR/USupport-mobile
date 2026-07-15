import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

import { appStyles } from "#styles";

const TRACK_WIDTH = 51;
const TRACK_HEIGHT = 31;
const THUMB_SIZE = 27;
const THUMB_PADDING = 2;

/**
 * Pure RN switch — avoids UISwitch on iOS 26+ where custom thumb/track colors
 * and Liquid Glass rendering break after app backgrounding or view recycling.
 */
export function CustomSwitch({
  value = false,
  onValueChange,
  disabled = false,
  style,
}) {
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [progress, value]);

  const thumbTranslate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [THUMB_PADDING, TRACK_WIDTH - THUMB_SIZE - THUMB_PADDING],
  });

  const handlePress = () => {
    if (disabled) return;
    onValueChange?.(!value);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
      style={[styles.container, disabled && styles.disabled, style]}
      hitSlop={4}
    >
      <Animated.View
        style={[styles.track, { backgroundColor: appStyles.colorGray_ea }]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.trackOverlay,
            {
              backgroundColor: appStyles.colorSecondary_9749fa,
              opacity: progress,
            },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumb,
            { transform: [{ translateX: thumbTranslate }] },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
  },
  disabled: {
    opacity: 0.5,
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: "center",
    overflow: "hidden",
  },
  trackOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumb: {
    position: "absolute",
    top: THUMB_PADDING,
    left: 0,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: appStyles.colorWhite_ff,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});

import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { StyleSheet, View, Text, Animated } from "react-native";

import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

/**
 * ProgressBar
 *
 * Animated progress bar component for React Native
 *
 * @return {jsx}
 */
export const ProgressBar = ({
  progress = 0,
  classes,
  style,
  showPercentage = false,
  height = "md",
  animated = true,
}) => {
  const { isDarkMode } = useGetTheme();
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const animatedTranslateX = useRef(new Animated.Value(-100)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  const progressPercentage = Math.min(100, Math.max(0, progress));

  useEffect(() => {
    if (animated) {
      // Animate the fill width
      Animated.timing(animatedWidth, {
        toValue: progressPercentage,
        duration: 300,
        useNativeDriver: false,
      }).start();

      // Animate the initial slide-in effect (similar to progress-fill animation)
      if (progressPercentage > 0) {
        Animated.timing(animatedTranslateX, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false, // Changed from true to false
        }).start();
      } else {
        animatedTranslateX.setValue(-100);
      }
    } else {
      animatedWidth.setValue(progressPercentage);
      animatedTranslateX.setValue(0);
    }
  }, [progressPercentage, animated]);

  const animatedWidthStyle = {
    width: animatedWidth.interpolate({
      inputRange: [0, 100],
      outputRange: ["0%", "100%"],
      extrapolate: "clamp",
    }),
  };

  const animatedTransformStyle =
    animated && trackWidth > 0
      ? {
          transform: [
            {
              translateX: animatedTranslateX.interpolate({
                inputRange: [-100, 0],
                outputRange: [-trackWidth, 0],
                extrapolate: "clamp",
              }),
            },
          ],
        }
      : {};

  const handleTrackLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setTrackWidth(width);
  };

  return (
    <View style={[styles.progressBar, classes, style]}>
      <View
        style={[
          styles.progressBar__track,
          styles[`track--${height}`],
          {
            backgroundColor: isDarkMode ? "#eaeaea" : "#eaeaea", // color_gray_ea equivalent
          },
        ]}
        onLayout={handleTrackLayout}
      >
        <Animated.View
          style={[
            styles.progressBar__fill,
            animated && styles.progressBar__fill__animated,
            animatedWidthStyle,
            animatedTransformStyle,
          ]}
        />
      </View>
      {showPercentage && (
        <Text
          style={[
            styles.progressBar__percentage,
            {
              color: isDarkMode ? "#ffffff" : "#3d527b", // color_3d527b_white equivalent
            },
          ]}
        >
          {Math.round(progressPercentage)}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  progressBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12, // spacing_1_2 equivalent (assuming 12px)
    width: "100%",
  },
  progressBar__track: {
    flex: 1,
    borderRadius: 4, // border_radius_2_4 equivalent
    overflow: "hidden",
  },
  progressBar__fill: {
    height: "100%",
    backgroundColor: "#7ec680", // color_green_7ec680
    borderRadius: 4,
  },
  progressBar__fill__animated: {
    // Animation styling is handled by Animated.View
  },
  progressBar__percentage: {
    fontSize: 16, // font_size_1_6 equivalent
    fontFamily: appStyles.fontMedium, // font_medium equivalent
    minWidth: 48, // 3rem equivalent (assuming 16px base)
    textAlign: "right",
  },
  // Height variants for track
  "track--sm": {
    height: 4, // spacing_0_4 equivalent
  },
  "track--md": {
    height: 8, // spacing_0_8 equivalent
  },
  "track--lg": {
    height: 12, // spacing_1_2 equivalent
  },
});

ProgressBar.propTypes = {
  progress: PropTypes.number,
  classes: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  showPercentage: PropTypes.bool,
  height: PropTypes.oneOf(["sm", "md", "lg"]),
  animated: PropTypes.bool,
};

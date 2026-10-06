import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";

import { AppText } from "../../texts/AppText";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

const DOT_COUNT = 3;
const DOT_DURATION = 350;

/**
 * TypingIndicator
 *
 * Shown in the chat while the other participant is typing. Styled like a received message
 *
 * @param {string} text - the translated "typing" label
 *
 * @return {jsx}
 */
export const TypingIndicator = ({ text }) => {
  const { isDarkMode } = useGetTheme();
  const dots = useRef(
    Array.from({ length: DOT_COUNT }, () => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    // The dots light up one after another
    const animation = Animated.loop(
      Animated.stagger(
        DOT_DURATION / 2,
        dots.map((dot) =>
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: DOT_DURATION,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0.3,
              duration: DOT_DURATION,
              useNativeDriver: true,
            }),
          ])
        )
      )
    );
    animation.start();
    return () => animation.stop();
  }, []);

  // Same colors as the received message bubbles
  const textColor = isDarkMode
    ? "rgba(255, 255, 255, 0.92)"
    : appStyles.colorBlack_37;

  return (
    <View
      style={[
        styles.container,
        isDarkMode ? styles.containerDark : styles.containerLight,
      ]}
      accessibilityLiveRegion="polite"
    >
      <AppText namedStyle="smallText" style={{ color: textColor }}>
        {text}
      </AppText>
      <View style={styles.dots}>
        {dots.map((opacity, index) => (
          <Animated.View
            key={index}
            style={[styles.dot, { backgroundColor: textColor, opacity }]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderBottomLeftRadius: 4,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 10,
    marginRight: "auto",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  containerLight: {
    backgroundColor: "rgba(245, 243, 255, 0.9)",
    borderColor: "rgba(196, 181, 253, 0.4)",
  },
  containerDark: {
    backgroundColor: "rgba(76, 61, 102, 0.7)",
    borderColor: "rgba(139, 92, 246, 0.25)",
  },
  dots: {
    flexDirection: "row",
    gap: 4,
    marginLeft: 8,
  },
  dot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
});

export default TypingIndicator;

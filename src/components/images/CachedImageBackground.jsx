import React from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";

const RESIZE_MODE_MAP = {
  cover: "cover",
  contain: "contain",
  stretch: "fill",
  center: "none",
};

/**
 * Drop-in replacement for React Native's <ImageBackground> backed by
 * expo-image so remote images are cached to disk + memory.
 */
export const CachedImageBackground = React.memo(
  React.forwardRef(
    ({ source, resizeMode, style, imageStyle, children, ...rest }, ref) => {
      const contentFit = resizeMode
        ? RESIZE_MODE_MAP[resizeMode] || resizeMode
        : "cover";

      const { width, height, ...containerStyle } = StyleSheet.flatten(
        style || {}
      );

      return (
        <View ref={ref} style={[containerStyle, { width, height }]} {...rest}>
          <Image
            source={source}
            contentFit={contentFit}
            cachePolicy="memory-disk"
            style={[StyleSheet.absoluteFill, imageStyle]}
          />
          {children}
        </View>
      );
    }
  )
);

CachedImageBackground.displayName = "CachedImageBackground";

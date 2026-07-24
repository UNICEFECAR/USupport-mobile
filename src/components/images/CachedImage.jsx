import React from "react";
import { Image } from "expo-image";

const RESIZE_MODE_MAP = {
  cover: "cover",
  contain: "contain",
  stretch: "fill",
  center: "none",
};

/**
 * Drop-in replacement for React Native's <Image> that uses expo-image
 * for aggressive disk + memory caching. Accepts the same props as RN Image
 * (source, resizeMode, style, etc.) and transparently maps them.
 */
export const CachedImage = React.memo(
  React.forwardRef(({ resizeMode, ...rest }, ref) => {
    const contentFit = resizeMode
      ? RESIZE_MODE_MAP[resizeMode] || resizeMode
      : undefined;

    return (
      <Image
        ref={ref}
        cachePolicy="memory-disk"
        contentFit={contentFit}
        {...rest}
      />
    );
  })
);

CachedImage.displayName = "CachedImage";

CachedImage.prefetch = Image.prefetch;

import React, { useRef, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Carousel from "react-native-reanimated-carousel";

import { appStyles } from "#styles";

/**
 * CustomCarousel
 *
 * Custom carousel component with clickable pagination dots
 *
 * @return {jsx}
 */
export const CustomCarousel = ({ data, style, ...props }) => {
  const [curPage, setCurPage] = useState(0);
  const carouselRef = useRef(null);

  const handleDotPress = (index) => {
    carouselRef.current?.scrollTo({ index, animated: true });
  };

  return (
    <View style={[styles.container, style]}>
      <Carousel
        ref={carouselRef}
        height={180}
        width={appStyles.screenWidth}
        autoPlay={true}
        autoPlayInterval={3500}
        scrollAnimationDuration={2000}
        onProgressChange={(_, progress) => {
          setCurPage(Math.round(progress));
        }}
        data={data}
        {...props}
      />
      <View style={styles.paginationContainer}>
        {data.map((_, index) => (
          <Pressable
            key={index}
            onPress={() => handleDotPress(index)}
            hitSlop={8}
            style={styles.dotPressable}
          >
            <View
              style={[
                styles.dot,
                index === curPage ? styles.dotActive : styles.dotInactive,
              ]}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  paginationContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dotPressable: {
    padding: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: appStyles.colorSecondary_9749fa,
  },
  dotInactive: {
    backgroundColor: appStyles.colorGray_a6b4b8,
  },
});

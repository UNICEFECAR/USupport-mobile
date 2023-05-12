import React from "react";
import { View, StyleSheet } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import PaginationDot from "react-native-animated-pagination-dot";

import { appStyles } from "#styles";

/**
 * CustomCarousel
 *
 * Custom carousel component
 *
 *
 * @return {jsx}
 */
export const CustomCarousel = ({ data, style, ...props }) => {
  const [curPage, setCurPage] = React.useState(0);

  return (
    <View style={[styles.container, style]}>
      <Carousel
        height={140}
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
      <PaginationDot
        curPage={curPage}
        maxPage={data.length}
        activeDotColor={appStyles.colorSecondary_9749fa}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
});

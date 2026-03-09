import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";

import { AppText } from "../../texts/AppText/AppText";
import { Icon } from "../../icons"; // Assuming you have an Icon component

import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

const { width: screenWidth } = Dimensions.get("window");

/**
 * Tabs
 *
 * Tabs component with horizontal scroll and navigation arrows
 *
 * @return {jsx}
 */
export const Tabs = ({
  options,
  handleSelect,
  style,
  tabsStyle,
  t = () => {},
}) => {
  const { colors, isDarkMode } = useGetTheme();
  const scrollViewRef = useRef(null);
  const tabRefs = useRef({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);
  const [scrollViewWidth, setScrollViewWidth] = useState(0);
  const [currentScrollX, setCurrentScrollX] = useState(0);

  const scrollToTab = (index) => {
    if (!scrollViewRef.current || !tabRefs.current[index]) {
      return;
    }

    tabRefs.current[index].measureLayout(
      scrollViewRef.current,
      (x, y, width, height) => {
        // Calculate the position to center the tab in the visible area
        const tabCenter = x + width / 2;
        const scrollViewCenter = scrollViewWidth / 2;
        const targetScrollX = Math.max(
          0,
          Math.min(contentWidth - scrollViewWidth, tabCenter - scrollViewCenter)
        );

        scrollViewRef.current.scrollTo({
          x: targetScrollX,
          animated: true,
        });

        // Update state after a short delay to account for animation
        setTimeout(() => {
          setCurrentScrollX(targetScrollX);
          checkScrollability(targetScrollX);
        }, 100);
      },
      () => {
        // Fallback: if measureLayout fails, try to scroll based on estimated position
        // Average tab width is approximately 100px (padding + text + margins)
        const estimatedTabWidth = 100;
        const estimatedPosition = index * estimatedTabWidth;
        const targetScrollX = Math.max(
          0,
          Math.min(
            contentWidth - scrollViewWidth,
            estimatedPosition - scrollViewWidth / 2 + estimatedTabWidth / 2
          )
        );

        scrollViewRef.current.scrollTo({
          x: targetScrollX,
          animated: true,
        });

        setTimeout(() => {
          setCurrentScrollX(targetScrollX);
          checkScrollability(targetScrollX);
        }, 100);
      }
    );
  };

  const handleOnSelect = (index) => {
    // Scroll to the selected tab
    scrollToTab(index);

    if (handleSelect) {
      handleSelect(index);
    }
  };

  const checkScrollability = (scrollX) => {
    const tolerance = 1;
    setCanScrollLeft(scrollX > tolerance);
    setCanScrollRight(scrollX < contentWidth - scrollViewWidth - tolerance);
  };

  const scrollTabs = (direction) => {
    if (scrollViewRef.current && scrollViewWidth > 0) {
      const scrollAmount = Math.max(scrollViewWidth / 2.5, 100); // Minimum scroll amount
      const newOffset =
        direction === "left"
          ? Math.max(0, currentScrollX - scrollAmount)
          : Math.min(
              Math.max(0, contentWidth - scrollViewWidth),
              currentScrollX + scrollAmount
            );

      // Only scroll if there's actually a change
      if (Math.abs(newOffset - currentScrollX) > 1) {
        scrollViewRef.current.scrollTo({
          x: newOffset,
          animated: true,
        });

        // Update current scroll position immediately for better UX
        setCurrentScrollX(newOffset);
        checkScrollability(newOffset);
      }
    }
  };

  const handleScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    setCurrentScrollX(scrollX);
    checkScrollability(scrollX);
  };

  const handleContentSizeChange = (contentWidth) => {
    setContentWidth(contentWidth);
  };

  const handleLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setScrollViewWidth(width);
  };

  useEffect(() => {
    // Check scrollability when content or container size changes
    if (contentWidth && scrollViewWidth) {
      checkScrollability(currentScrollX);
    }
  }, [contentWidth, scrollViewWidth, currentScrollX]);

  // Scroll to selected tab when options change
  useEffect(() => {
    if (
      options &&
      options.length > 0 &&
      scrollViewWidth > 0 &&
      contentWidth > 0
    ) {
      const selectedIndex = options.findIndex((opt) => opt.isSelected);
      if (selectedIndex >= 0 && tabRefs.current[selectedIndex]) {
        // Small delay to ensure layout is complete
        setTimeout(() => {
          scrollToTab(selectedIndex);
        }, 100);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, scrollViewWidth, contentWidth]);

  const renderOptions = () => {
    if (!options || !Array.isArray(options)) {
      return null;
    }

    return options.map((option, index) => (
      <TouchableOpacity
        onPress={option.isInactive ? undefined : () => handleOnSelect(index)}
        key={index}
        disabled={option.isInactive}
        activeOpacity={0.7}
      >
        <View
          ref={(ref) => {
            if (ref) {
              tabRefs.current[index] = ref;
            }
          }}
          style={[
            styles.tab,
            {
              backgroundColor: !isDarkMode
                ? appStyles.colorGreen_f4f7fe
                : appStyles.colorBlack_1e,
            },
            option.isSelected && styles.tabSelected,
            option.isSelected && {
              backgroundColor: colors.background,
            },
            option.isInactive && styles.tabInactive,
          ]}
        >
          <AppText black numberOfLines={1} ellipsizeMode="tail">
            {option.label}
          </AppText>
        </View>
      </TouchableOpacity>
    ));
  };

  const showArrows = contentWidth > scrollViewWidth;

  return (
    <View style={[styles.tabsWrapper, style]}>
      <View style={[styles.tabs, tabsStyle]}>
        {showArrows && (
          <TouchableOpacity
            style={[
              styles.tabArrow,
              styles.tabArrowLeft,
              !canScrollLeft && styles.tabArrowDisabled,
            ]}
            onPress={() => canScrollLeft && scrollTabs("left")}
            disabled={!canScrollLeft}
            activeOpacity={0.7}
          >
            <Icon
              name="arrow-chevron-back"
              size="md"
              color={appStyles.colorBlack_1e}
            />
          </TouchableOpacity>
        )}

        <View style={styles.tabsContainer} onLayout={handleLayout}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onContentSizeChange={handleContentSizeChange}
            contentContainerStyle={styles.scrollContent}
          >
            {renderOptions()}
          </ScrollView>
        </View>

        {showArrows && (
          <TouchableOpacity
            style={[
              styles.tabArrow,
              styles.tabArrowRight,
              !canScrollRight && styles.tabArrowDisabled,
            ]}
            onPress={() => canScrollRight && scrollTabs("right")}
            disabled={!canScrollRight}
            activeOpacity={0.7}
          >
            <Icon
              name="arrow-chevron-forward"
              size="md"
              color={appStyles.colorBlack_1e}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabsWrapper: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  tabsContainer: {
    flex: 1,
    minWidth: 0,
  },
  scrollContent: {
    alignItems: "center",
    paddingRight: 8,
  },
  tab: {
    paddingVertical: 4,
    paddingHorizontal: 24,
    borderRadius: 40,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "transparent",
    minWidth: 60,
    maxWidth: 260,
    alignItems: "center",
    justifyContent: "center",
  },
  tabSelected: {
    borderColor: appStyles.colorSecondary_9749fa,
  },
  tabInactive: {
    opacity: 0.2,
  },
  tabArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  tabArrowLeft: {
    marginRight: 8,
  },
  tabArrowRight: {
    marginLeft: 8,
  },
  tabArrowDisabled: {
    opacity: 0.3,
  },
});

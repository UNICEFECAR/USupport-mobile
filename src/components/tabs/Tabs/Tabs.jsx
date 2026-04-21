import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
} from "react-native";

import { AppText } from "../../texts/AppText/AppText";
import { Icon } from "../../icons"; // Assuming you have an Icon component

import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

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
  ...rest
}) => {
  const { colors, isDarkMode, isHighContrast } = useGetTheme();
  const isLightTheme = colors.background === appStyles.colorWhite_ff;

  const tabBackgrounds = useMemo(() => {
    const unselected =
      colors.cardMediaGradient?.[0] ?? "rgba(225, 233, 252, 1)";
    const selected =
      Platform.OS === "android" && isLightTheme && !isHighContrast
        ? "#edf5ff"
        : (colors.tabSelectedGradient?.[0] ?? "rgba(255,255,255,0.5)");
    return { unselected, selected };
  }, [
    colors.cardMediaGradient,
    colors.tabSelectedGradient,
    isHighContrast,
    isLightTheme,
  ]);
  const scrollViewRef = useRef(null);
  const tabLayoutsRef = useRef(new Map());
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollability = useCallback(
    (nextScrollX) => {
      const tolerance = 1;
      const maxX = Math.max(0, contentWidth - containerWidth);
      setCanScrollLeft(nextScrollX > tolerance);
      setCanScrollRight(nextScrollX < maxX - tolerance);
    },
    [contentWidth, containerWidth]
  );

  useEffect(() => {
    updateScrollability(scrollX);
  }, [scrollX, updateScrollability]);

  const scrollToX = useCallback(
    (x, animated = true) => {
      const maxX = Math.max(0, contentWidth - containerWidth);
      const clamped = Math.max(0, Math.min(maxX, x));
      if (!scrollViewRef.current) return;
      scrollViewRef.current.scrollTo({ x: clamped, animated });
      setScrollX(clamped);
      updateScrollability(clamped);
    },
    [contentWidth, containerWidth, updateScrollability]
  );

  const scrollToTab = useCallback(
    (index) => {
      const layout = tabLayoutsRef.current.get(index);
      if (!layout || containerWidth <= 0) return;

      const tabCenter = layout.x + layout.width / 2;
      const targetX = tabCenter - containerWidth / 2;
      scrollToX(targetX, true);
    },
    [containerWidth, scrollToX]
  );

  const handleOnSelect = useCallback(
    (index) => {
      scrollToTab(index);
      handleSelect?.(index);
    },
    [handleSelect, scrollToTab]
  );

  const handleScroll = useCallback(
    (event) => {
      const next = event.nativeEvent.contentOffset.x ?? 0;
      setScrollX(next);
      updateScrollability(next);
    },
    [updateScrollability]
  );

  const handleContainerLayout = useCallback((event) => {
    setContainerWidth(event.nativeEvent.layout.width ?? 0);
  }, []);

  const handleContentSizeChange = useCallback((w) => {
    setContentWidth(w ?? 0);
  }, []);

  const selectedIndex = useMemo(() => {
    if (!Array.isArray(options)) return -1;
    return options.findIndex((opt) => opt?.isSelected);
  }, [options]);

  useEffect(() => {
    if (selectedIndex < 0) return;

    // Wait a tick for onLayout measurements to populate.
    const id = setTimeout(() => {
      scrollToTab(selectedIndex);
    }, 0);
    return () => clearTimeout(id);
  }, [selectedIndex, scrollToTab, options]);

  const scrollTabs = useCallback(
    (direction) => {
      const amount = Math.max(containerWidth / 2.5, 96);
      const next = direction === "left" ? scrollX - amount : scrollX + amount;
      scrollToX(next, true);
    },
    [containerWidth, scrollToX, scrollX]
  );

  const renderOptions = () => {
    if (!options || !Array.isArray(options)) {
      return null;
    }

    return options.map((option, index) => {
      const isSelected = option.isSelected;
      const labelColor = isSelected ? colors.text : colors.inputText;
      const backgroundColor = isSelected
        ? tabBackgrounds.selected
        : tabBackgrounds.unselected;

      return (
        <Pressable
          key={index}
          onPress={option.isInactive ? undefined : () => handleOnSelect(index)}
          disabled={option.isInactive}
          android_ripple={
            option.isInactive
              ? undefined
              : { color: "rgba(255,255,255,0.18)", borderless: false }
          }
          accessibilityRole="button"
          accessibilityState={{
            selected: !!isSelected,
            disabled: !!option.isInactive,
          }}
          onLayout={(e) => {
            const { x, width } = e.nativeEvent.layout;
            tabLayoutsRef.current.set(index, { x, width });
          }}
          style={styles.tabPressable}
        >
          <View
            style={[
              styles.tab,
              isLightTheme && !isHighContrast
                ? appStyles.cardMediaShadowLight
                : appStyles.cardMediaShadowDark,
              {
                borderColor: colors.cardMediaGradientBorder,
                backgroundColor,
              },
              option.isInactive && styles.tabInactive,
            ]}
          >
            <AppText
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.tabLabel, { color: labelColor }]}
            >
              {option.label}
            </AppText>
          </View>
        </Pressable>
      );
    });
  };

  const showArrows = contentWidth > containerWidth + 1;
  const arrowBg = isLightTheme
    ? "rgba(255, 255, 255, 0.82)"
    : "rgba(20, 25, 31, 0.75)";
  const arrowBorder = isLightTheme
    ? "rgba(0, 0, 0, 0.12)"
    : "rgba(255, 255, 255, 0.12)";

  return (
    <View style={[styles.tabsWrapper, style]} {...rest}>
      <View style={[styles.tabs, tabsStyle]}>
        {showArrows && (
          <Pressable
            style={({ pressed }) => [
              styles.tabArrow,
              styles.tabArrowLeft,
              { backgroundColor: arrowBg, borderColor: arrowBorder },
              !canScrollLeft && styles.tabArrowDisabled,
              pressed && canScrollLeft && styles.tabArrowPressed,
            ]}
            onPress={() => canScrollLeft && scrollTabs("left")}
            disabled={!canScrollLeft}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t?.("scroll_left") || "Scroll left"}
          >
            <Icon name="arrow-chevron-back" size="md" color={colors.text} />
          </Pressable>
        )}

        <View style={styles.tabsContainer} onLayout={handleContainerLayout}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onContentSizeChange={handleContentSizeChange}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {renderOptions()}
          </ScrollView>
        </View>

        {showArrows && (
          <Pressable
            style={({ pressed }) => [
              styles.tabArrow,
              styles.tabArrowRight,
              { backgroundColor: arrowBg, borderColor: arrowBorder },
              !canScrollRight && styles.tabArrowDisabled,
              pressed && canScrollRight && styles.tabArrowPressed,
            ]}
            onPress={() => canScrollRight && scrollTabs("right")}
            disabled={!canScrollRight}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t?.("scroll_right") || "Scroll right"}
          >
            <Icon name="arrow-chevron-forward" size="md" color={colors.text} />
          </Pressable>
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
    paddingVertical: 2,
  },
  tabPressable: {
    borderRadius: 12,
  },
  tab: {
    paddingVertical: 4,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1.5,
    minWidth: 60,
    maxWidth: 260,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  tabLabel: {
    textAlign: "center",
    includeFontPadding: false,
  },
  tabInactive: {
    opacity: 0.2,
  },
  tabArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
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
  tabArrowPressed: {
    opacity: Platform.OS === "android" ? 1 : 0.9,
    transform: [{ scale: 0.98 }],
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

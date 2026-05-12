import React, { useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { LineChart } from "react-native-gifted-charts";

import { useGetTheme } from "#hooks";
import { appStyles } from "#styles";

const PLOT_RATIO = 0.74;
const PADDING_X = 20;
const PADDING_TOP = 24;
const SEGMENTS = 4;
const Y_DOMAIN = 4;
/** Hit target: half of 44×44 (same as legacy chart overlays). */
const HIT_R = 22;
/** Must match `overflowTop` passed to LineChart. */
const CHART_OVERFLOW_TOP = 8;
/** gifted-charts `getExtendedContainerHeightWithPadding` adds this after overflowTop. */
const GIFTED_HEIGHT_PAD = 10;

export const CHART_SVG_HEIGHT = 256;
export const CHART_SEGMENTS = SEGMENTS;
export const CHART_LEADING_PLACEHOLDERS = 0;

export const CHART_PLOT_RANGE = CHART_SVG_HEIGHT * PLOT_RATIO;
export const CHART_GRIDLINE_SPACING = CHART_PLOT_RANGE / SEGMENTS;
/** Kept for compatibility; chart uses the same vertical scale. */
export const CHART_PADDING_TOP = PADDING_TOP;
export const CHART_TOP_OFFSET_Y = 0;
export const CHART_BOTTOM_GRIDLINE_Y = PADDING_TOP + CHART_PLOT_RANGE;
export const CHART_X_OFFSET = PADDING_X;

export const getDotXPositions = (count, chartWidth) => {
  const positions = [];
  if (!count || count <= 0) return positions;
  const inner = chartWidth - 2 * PADDING_X;
  if (count === 1) {
    positions.push(PADDING_X + inner / 2);
    return positions;
  }
  for (let j = 0; j < count; j += 1) {
    positions.push(PADDING_X + (j / (count - 1)) * inner);
  }
  return positions;
};

export const getMoodChartHorizontalLineY = (rowIndex) =>
  PADDING_TOP + (CHART_PLOT_RANGE / SEGMENTS) * rowIndex;

function getMoodValue(mood) {
  switch (mood) {
    case "happy":
      return 3.88;
    case "good":
      return 3;
    case "sad":
      return 2;
    case "depressed":
      return 1;
    case "worried":
      return 0.12;
    default:
      return 0;
  }
}

function moodDot({ fill, borderColor, borderWidth, size }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: fill,
        borderWidth,
        borderColor,
      }}
    />
  );
}

export const MoodTrackLineChart = ({
  data,
  selectedItemId,
  handleSelectItem,
  width: widthProp,
}) => {
  const chartWidth =
    typeof widthProp === "number" ? widthProp : appStyles.screenWidth * 0.85;
  const { colors, isDarkMode, isHighContrast } = useGetTheme();
  const primary = colors.primary || "#684dfd";

  const dotFill = isDarkMode ? colors.card : "#ffffff";
  /** Softer halo when a point is selected (reference uses crisp purple rings). */
  const selectedRing = isDarkMode
    ? "rgba(200,210,255,0.65)"
    : "rgba(104,77,253,0.45)";

  const gridColor = isHighContrast
    ? colors.textSecondary
    : isDarkMode
      ? "rgba(255,255,255,0.14)"
      : "rgba(15,32,47,0.1)";

  const vGuideColor = isHighContrast
    ? colors.textSecondary
    : isDarkMode
      ? "rgba(255,255,255,0.09)"
      : "rgba(120,125,150,0.22)";

  const chartData = useMemo(() => {
    if (!data.length) return [];
    return data.map((entry, entryIndex) => {
      const isSelected = entry.mood_tracker_id === selectedItemId;
      const isCritical =
        entry?.is_critical === true || entry?.isCritical === true;
      const r = isSelected ? 8 : isCritical ? 6.5 : 5.5;
      const size = Math.ceil(r * 2);
      const borderColor = isCritical
        ? "#e53935"
        : isSelected
          ? selectedRing
          : primary;
      const borderWidth = isCritical ? 2 : isSelected ? 2 : 1.25;
      return {
        value: getMoodValue(entry.mood),
        label: "",
        showVerticalLine: true,
        verticalLineUptoDataPoint: true,
        verticalLineColor: vGuideColor,
        verticalLineThickness: StyleSheet.hairlineWidth * 2,
        dataPointWidth: size,
        dataPointHeight: size,
        customDataPoint: () =>
          moodDot({
            fill: dotFill,
            borderColor,
            borderWidth,
            size,
          }),
      };
    });
  }, [data, selectedItemId, selectedRing, dotFill, primary, vGuideColor]);

  const plotHeight = Math.round(CHART_PLOT_RANGE);
  const n = data.length;
  const inner = chartWidth - 2 * PADDING_X;
  const segmentSpacing = n <= 1 ? 0 : inner / (n - 1);
  const chartInitialSpacing = n === 1 ? PADDING_X + inner / 2 : PADDING_X;

  const areaTop = isDarkMode
    ? "rgba(139,115,255,0.42)"
    : "rgba(104,77,253,0.2)";
  const areaBottom = isDarkMode ? "rgba(91,76,224,0.02)" : "rgba(104,77,253,0)";

  if (data.length === 0) {
    return <View style={{ width: chartWidth, height: CHART_SVG_HEIGHT }} />;
  }

  const dotXList = getDotXPositions(n, chartWidth);

  return (
    <View style={[styles.wrap, { width: chartWidth }]}>
      <View style={styles.chartSlot}>
        <LineChart
          data={chartData}
          width={chartWidth}
          height={plotHeight}
          maxValue={Y_DOMAIN}
          noOfSections={SEGMENTS}
          stepValue={1}
          yAxisOffset={0}
          yAxisLabelWidth={0}
          yAxisThickness={0}
          hideYAxisText
          yAxisExtraHeight={0}
          xAxisThickness={0}
          xAxisLabelsHeight={0}
          hideRules={!isHighContrast}
          rulesColor={gridColor}
          rulesThickness={StyleSheet.hairlineWidth * 2}
          rulesType="dashed"
          dashWidth={5}
          dashGap={9}
          backgroundColor="transparent"
          adjustToWidth={false}
          spacing={segmentSpacing}
          disableScroll
          initialSpacing={chartInitialSpacing}
          endSpacing={PADDING_X}
          nestedScrollEnabled
          curved
          curvature={0.22}
          areaChart
          gradientDirection="vertical"
          startFillColor={areaTop}
          endFillColor={areaBottom}
          startOpacity={1}
          endOpacity={isDarkMode ? 0.28 : 0.18}
          color={primary}
          thickness={isHighContrast ? 3 : 2.5}
          strokeLinecap="round"
          isAnimated
          animateOnDataChange
          animationDuration={550}
          overflowTop={CHART_OVERFLOW_TOP}
        />
        {data.map((entry, idx) => {
          const x = dotXList[idx] ?? chartWidth / 2;
          const v = getMoodValue(entry.mood);
          const extendedH = plotHeight + CHART_OVERFLOW_TOP + GIFTED_HEIGHT_PAD;
          const yCenter = PADDING_TOP + extendedH - (v * plotHeight) / Y_DOMAIN;
          return (
            <TouchableOpacity
              key={entry.mood_tracker_id ?? `mood-${idx}`}
              accessibilityRole="button"
              accessibilityLabel={`Mood entry ${idx + 1}`}
              activeOpacity={0.7}
              onPress={() => handleSelectItem(idx)}
              style={[
                styles.hit,
                {
                  left: x - HIT_R,
                  top: yCenter - HIT_R,
                },
              ]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "flex-start",
  },
  chartSlot: {
    position: "relative",
    paddingTop: PADDING_TOP,
  },
  hit: {
    position: "absolute",
    width: HIT_R * 2,
    height: HIT_R * 2,
    borderRadius: HIT_R,
    zIndex: 20,
    backgroundColor: "transparent",
  },
});

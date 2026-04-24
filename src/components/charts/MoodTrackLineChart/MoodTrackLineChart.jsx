import React, { useState, useEffect, useMemo } from "react";
import { LineChart } from "react-native-chart-kit";
import { StyleSheet, View } from "react-native";

import { appStyles } from "#styles";

const CHART_KIT_PLOT_HEIGHT_RATIO = 0.75;

// Vertical layout (shared with consumers so external labels align with gridlines)
// Needs to be at least half of the external emoticon rail item height (40px)
// so the first emoticon label doesn't get clipped at the top.
export const CHART_PADDING_TOP = 20;
export const CHART_SEGMENTS = 4;
const CHART_SVG_HEIGHT = 268;
export const CHART_PLOT_RANGE = CHART_SVG_HEIGHT * CHART_KIT_PLOT_HEIGHT_RATIO;
export const CHART_GRIDLINE_SPACING = CHART_PLOT_RANGE / CHART_SEGMENTS;
export const CHART_EDGE_STEP_FRACTION = 0.5;
export const CHART_TOP_OFFSET_Y =
  CHART_GRIDLINE_SPACING * CHART_EDGE_STEP_FRACTION;
export const CHART_BOTTOM_GRIDLINE_Y =
  CHART_PADDING_TOP + CHART_TOP_OFFSET_Y + CHART_PLOT_RANGE;

const PLOT_HEIGHT = Math.ceil(CHART_BOTTOM_GRIDLINE_Y + 4);

export const CHART_X_OFFSET = 28;
export const CHART_EDGE_X_FRACTION = 0.5;
export const CHART_LEADING_PLACEHOLDERS = 1;

export const getDotXPositions = (count, chartWidth) => {
  const positions = [];
  if (!count || count <= 0) return positions;

  const totalPoints = count + CHART_LEADING_PLACEHOLDERS;

  const paddingLeft = CHART_X_OFFSET;
  const paddingRight = CHART_X_OFFSET;
  const drawable = chartWidth - paddingLeft - paddingRight;

  if (totalPoints === 1) {
    positions.push(chartWidth / 2);
    return positions;
  }

  for (let i = 0; i < count; i++) {
    const chartIndex = CHART_LEADING_PLACEHOLDERS + i;
    const x = paddingLeft + (chartIndex / (totalPoints - 1)) * drawable;
    positions.push(x);
  }
  return positions;
};

export const MoodTrackLineChart = ({
  data,
  selectedItemId,
  handleSelectItem,
  width: widthProp,
}) => {
  const chartWidth =
    typeof widthProp === "number" ? widthProp : appStyles.screenWidth * 0.85;

  const getMoodValue = (mood) => {
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
  };

  const [selectedItemIndex, setSelectedItemIndex] = useState("");

  useEffect(() => {
    const index = data.indexOf(
      data.find((x) => {
        return x.mood_tracker_id === selectedItemId;
      })
    );
    setSelectedItemIndex(index);
  }, [data, selectedItemId]);

  const chartDataWithLeadingPlaceholder = useMemo(() => {
    const moodValues = data.map((mood) => getMoodValue(mood.mood));
    const leadingPlaceholderValue = moodValues.length > 0 ? moodValues[0] : 2;
    return [leadingPlaceholderValue, ...moodValues];
  }, [data]);

  const lineData = {
    datasets: [
      {
        data: chartDataWithLeadingPlaceholder,
        color: () => "#684DFD",
        strokeWidth: 3,
      },
      { data: [4], withDots: false },
      { data: [0], withDots: false },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: appStyles.colorTransparent,
    backgroundGradientTo: appStyles.colorTransparent,
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: () => "#E1E7ED",
    paddingRight: CHART_X_OFFSET,
    paddingTop: CHART_PADDING_TOP + CHART_TOP_OFFSET_Y,
    propsForDots: {
      r: "6",
      strokeWidth: "1",
      stroke: "#C1EAEA",
    },
    propsForBackgroundLines: {
      strokeDasharray: "4 4",
      stroke: "#C5CDD6",
      strokeWidth: 1,
    },
  };

  return (
    <View style={[styles.chartClip, { width: chartWidth }]}>
      <LineChart
        data={lineData}
        width={chartWidth}
        height={CHART_SVG_HEIGHT}
        chartConfig={chartConfig}
        paddingLeft={CHART_X_OFFSET}
        widthDots={false}
        withVerticalLabels={false}
        getDotColor={() => "#684DFD"}
        getDotProps={(dataPoint, dataPointIndex) => {
          if (dataPointIndex === 0) {
            return {
              r: "0",
              strokeWidth: "0",
              stroke: "transparent",
            };
          }

          const index = dataPointIndex - 1;
          const currentEntry = data[index];
          const isCritical =
            currentEntry?.is_critical === true ||
            currentEntry?.isCritical === true;

          if (index === selectedItemIndex) {
            return {
              r: "8",
              strokeWidth: "2",
              stroke: isCritical ? "#FF0000" : "#C1EAEA",
            };
          }

          if (isCritical) {
            return {
              r: "6",
              strokeWidth: "2",
              stroke: "#FF0000",
            };
          }

          return {
            r: "6",
            strokeWidth: "1",
            stroke: "#C1EAEA",
          };
        }}
        bezier
        withShadow={false}
        withVerticalLines={true}
        withHorizontalLines={true}
        withHorizontalLabels={false}
        segments={4}
        fromZero={true}
        onDataPointClick={(value) => {
          if (value.index === 0) return;
          handleSelectItem(value.index - 1);
        }}
        style={styles.chartSvg}
      />
    </View>
  );
};

export const styles = StyleSheet.create({
  chartSvg: {
    alignSelf: "flex-start",
    margin: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
  },
  chartClip: {
    alignSelf: "flex-start",
    height: PLOT_HEIGHT,
    overflow: "hidden",
  },
});

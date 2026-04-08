import React, { useState, useEffect } from "react";
import { LineChart } from "react-native-chart-kit";
import { StyleSheet, View } from "react-native";

import { appStyles } from "#styles";

const PLOT_HEIGHT = 220;
const DEFAULT_X_LABELS_HEIGHT_RATIO = 0.75;
const svgHeight = Math.ceil(PLOT_HEIGHT / DEFAULT_X_LABELS_HEIGHT_RATIO);

/**
 * MoodTrackLineChart
 *
 * MoodTrackLineChart chart component
 *
 * @return {jsx}
 */
export const MoodTrackLineChart = ({
  data,
  selectedItemId,
  handleSelectItem,
  width: widthProp,
  paddingLeft = 0,
  paddingRight = 0,
}) => {
  const chartWidth =
    typeof widthProp === "number"
      ? widthProp
      : appStyles.screenWidth * 0.85;

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

  const lineData = {
    datasets: [
      {
        data: data.map((mood) => getMoodValue(mood.mood)),
        color: () => "#684DFD",
        strokeWidth: 3,
      },
      { data: [4], withDots: false },
      { data: [0], withDots: false },
    ],
  };

  const chartConfig = {
    // Match client-ui feel: no solid white chart backdrop
    backgroundGradientFrom: appStyles.colorTransparent,
    backgroundGradientTo: appStyles.colorTransparent,
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: () => "#E1E7ED",
    propsForDots: {
      r: "6",
      strokeWidth: "1",
      stroke: "#C1EAEA",
    },
    propsForBackgroundLines: {
      strokeDasharray: "4 4",
      stroke: "#E1E7ED",
      strokeWidth: 1,
    },
  };

  return (
    <View style={styles.chartClip}>
    <LineChart
      data={lineData}
      width={chartWidth}
      height={svgHeight}
      chartConfig={chartConfig}
      paddingLeft={paddingLeft}
      paddingRight={paddingRight}
      widthDots={false}
      withVerticalLabels={false}
      getDotColor={(dataPoint, dataPointIndex) => {
        return "#684DFD";
      }}
      getDotProps={(dataPoint, dataPointIndex) => {
        const index = dataPointIndex;
        const currentEntry = data[index];
        const isCritical =
          currentEntry?.is_critical === true || currentEntry?.isCritical === true;

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
        handleSelectItem(value.index);
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

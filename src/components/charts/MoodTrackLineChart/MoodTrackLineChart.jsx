import React, { useState, useEffect } from "react";
import { LineChart } from "react-native-chart-kit";
import { StyleSheet } from "react-native";

import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

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
}) => {
  const { colors } = useGetTheme();

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
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
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
    <LineChart
      data={lineData}
      width={appStyles.screenWidth * 0.85}
      height={220}
      chartConfig={chartConfig}
      widthDots={false}
      getDotColor={(dataPoint, dataPointIndex) => {
        return "#684DFD";
      }}
      getDotProps={(dataPoint, dataPointIndex) => {
        const index = dataPointIndex;
        const currentEntry = data[index];

        if (index === selectedItemIndex) {
          return {
            r: "8",
            strokeWidth: "2",
            stroke: currentEntry?.isCritical ? "#FF0000" : "#C1EAEA",
          };
        }

        if (currentEntry?.isCritical) {
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
      style={styles.paddingRight20}
    />
  );
};

export const styles = StyleSheet.create({
  paddingRight20: {
    paddingRight: 20,
  },
});

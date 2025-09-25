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
        return 3.9;
      case "good":
        return 3;
      case "sad":
        return 2;
      case "depressed":
        return 1;
      case "worried":
        return 0.1;
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
        color: () => appStyles.colorPrimary_20809e,
        strokeWidth: 1,
      },
      { data: [4], withDots: false },
      { data: [0], withDots: false },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    color: () => appStyles.colorGray_a6b4b8,
    propsForDots: {
      r: "8",
      strokeWidth: "2",
      stroke: appStyles.colorPrimary_20809e,
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
        const index = dataPointIndex;
        const currentEntry = data[index];

        if (index === selectedItemIndex) {
          return appStyles.colorGreen_54cfd9;
        } else {
          return appStyles.colorGreen_c1eaea;
        }
      }}
      getDotProps={(dataPoint, dataPointIndex) => {
        const index = dataPointIndex;
        const currentEntry = data[index];

        if (currentEntry?.isCritical) {
          return {
            r: "8",
            strokeWidth: "3",
            stroke: appStyles.colorRed_eb5757, // Red border for critical entries
          };
        }

        return {
          r: "8",
          strokeWidth: "2",
          stroke: appStyles.colorPrimary_20809e,
        };
      }}
      withShadow={false}
      withVerticalLines={false}
      withHorizontalLabels={false}
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

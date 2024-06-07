import React from "react";
import { View, StyleSheet } from "react-native";
import { Slider } from "@react-native-assets/slider";

import { AppText } from "../../texts";
import { appStyles } from "#styles";

/**
 * InputSlider
 *
 * InputSlider component
 */
export const InputSlider = ({
  minValue = 1,
  maxValue = 10,
  value,
  setValue,
  disabled = false,
  style,
}) => {
  return (
    <View style={[styles.component, style]}>
      <AppText>{minValue}</AppText>
      <View style={styles.slider}>
        <Slider
          value={value}
          minimumTrackTintColor={"#f2f2f2"}
          maximumTrackTintColor={"#f2f2f2"}
          minimumValue={minValue}
          maximumValue={maxValue}
          step={1}
          slideOnTap
          onValueChange={(value) => {
            setValue(value);
          }}
          CustomThumb={({ value: number }) => (
            <View style={styles.customThumb}>
              <AppText style={styles.valueText}>{number}</AppText>
            </View>
          )}
          trackStyle={styles.trackStyle}
          trackHeight={4}
          enabled={!disabled}
        />
      </View>
      <AppText>{maxValue}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  component: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  slider: {
    flexGrow: 1,
    marginHorizontal: 20,
    zIndex: 2,
    paddingHorizontal: 6,
  },
  customThumb: {
    width: 33,
    height: 33,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appStyles.colorPrimary_20809e,
  },
  valueText: { color: appStyles.colorWhite_ff },
  trackStyle: { height: 1 },
});

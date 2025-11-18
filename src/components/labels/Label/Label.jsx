import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { AppText } from "../../texts/AppText/AppText";

import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

/**
 * Label
 *
 * Label component
 *
 * @return {jsx}
 */
export const Label = ({ text, onPress, style, textStyle }) => {
  const { isHighContrast } = useGetTheme();

  return (
    <Pressable onPress={onPress}>
      <View style={[styles.label, style]}>
        <AppText
          namedStyle="textSmall"
          style={[styles.text, isHighContrast && styles.textHC, textStyle]}
        >
          {text}
        </AppText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  label: {
    alignSelf: "flex-start",
    borderColor: appStyles.colorPrimary_20809e,
    borderRadius: 16,
    borderWidth: 1,
    display: "flex",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 4,
    textAlign: "center",
    width: "auto",
  },
  text: { color: appStyles.colorPrimary_20809e },
  textHC: { color: "#fff" },
});

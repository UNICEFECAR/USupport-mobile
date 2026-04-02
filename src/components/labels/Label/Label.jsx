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
export const Label = ({
  text,
  onPress,
  style,
  textStyle,
  paletteIndex,
}) => {
  const { isHighContrast } = useGetTheme();
  const PALETTES = [
    { bg: "#ffe4cc", border: "#f2b77f", text: "#925522" },
    { bg: "#d6f3e2", border: "#95d3af", text: "#2f6e4a" },
    { bg: "#e5ddff", border: "#b8a9f4", text: "#5946a0" },
    { bg: "#d6edf9", border: "#97c9e6", text: "#2d6382" },
    { bg: "#fff2c9", border: "#e8ce7c", text: "#8a6b1f" },
    { bg: "#ffdce5", border: "#eda3b5", text: "#8f3a54" },
  ];

  // Only apply colorful palette when paletteIndex is explicitly provided.
  // This keeps existing monochrome labels unchanged elsewhere in the app.
  const usePalette =
    typeof paletteIndex === "number" && !Number.isNaN(paletteIndex);

  const effectiveIndex = usePalette
    ? Math.abs(Math.floor(paletteIndex)) % PALETTES.length
    : null;
  const palette = effectiveIndex !== null ? PALETTES[effectiveIndex] : null;

  const containerStyle = [
    styles.label,
    usePalette && {
      backgroundColor: palette.bg,
      borderColor: palette.border,
    },
    style,
  ];

  const textColorStyle = usePalette
    ? { color: isHighContrast ? "#fff" : palette.text }
    : isHighContrast && styles.textHC;

  return (
    <Pressable onPress={onPress}>
      <View style={containerStyle}>
        <AppText
          namedStyle="smallText"
          style={[styles.text, textColorStyle, textStyle]}
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

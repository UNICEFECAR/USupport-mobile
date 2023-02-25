import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { AppText } from "../../texts/AppText/AppText";

import { appStyles } from "#styles";

/**
 * Label
 *
 * Label component
 *
 * @return {jsx}
 */
export const Label = ({ text, onPress, style }) => {
  return (
    <Pressable onPress={onPress}>
      <View style={[styles.label, style]}>
        <AppText namedStyle="textSmall" style={styles.text}>
          {text}
        </AppText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  label: {
    borderWidth: 1,
    borderColor: appStyles.colorPrimary_20809e,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 16,
    display: "flex",
    width: "auto",
    textAlign: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  text: { color: appStyles.colorPrimary_20809e },
});

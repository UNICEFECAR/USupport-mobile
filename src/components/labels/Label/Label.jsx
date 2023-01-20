import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";

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
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.label, style]}>
        <AppText namedStyle="textSmall" style={styles.text}>
          {text}
        </AppText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  label: {
    borderWidth: 1,
    borderColor: appStyles.colorPrimary_20809e,
    paddingVertical: 4,
    paddingHorizontal: 16,
    width: "fit-content",
    textAlign: "center",
    justifyContent: "center",
  },
  text: { color: appStyles.colorPrimary_20809e },
});

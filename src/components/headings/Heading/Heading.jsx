import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import { Icon } from "../../icons";
import { AppText } from "../../texts";
import { appStyles } from "#styles";

export const Heading = ({
  heading,
  subheading,
  handleGoBack,
  buttonComponent,
}) => {
  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon
            style={styles.backArrow}
            name="arrow-chevron-back"
            color={appStyles.colorPrimary_20809e}
          />
        </TouchableOpacity>
        <AppText namedStyle="h3">{heading}</AppText>
        <View style={styles.button}>{buttonComponent}</View>
      </View>
      <AppText style={styles.subheading} namedStyle="text">
        {subheading}
      </AppText>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingBottom: 16,
    width: "100%",
  },
  backArrow: {
    marginRight: 16,
  },
  button: {
    marginLeft: "auto",
  },
  subheading: {
    textAlign: "left",
    width: "100%",
  },
});

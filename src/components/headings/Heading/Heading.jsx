import React from "react";
import { View, StyleSheet } from "react-native";

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
        <Icon
          style={styles.backArrow}
          name="arrow-chevron-back"
          color={appStyles.colorPrimary_20809e}
          onPress={handleGoBack}
        />
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
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
  },
  backArrow: {
    marginLeft: 8,
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
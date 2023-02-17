import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet, Image } from "react-native";
import LinearGradient from "../../components/LinearGradient";

import { appStyles } from "#styles";

export const MascotHeadingBlock = ({ image, children, style }) => {
  return (
    <LinearGradient
      gradient={appStyles.gradientSecondary}
      style={styles.mascotHeadingBlock}
    >
      <View style={[styles.contentContainer, style]}>
        <Image
          source={image}
          style={appStyles.screenWidth < 350 && styles.image}
        />
        <View style={styles.childrenContainer}>{children}</View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  mascotHeadingBlock: {
    borderBottomLeftRadius: 80,
    width: appStyles.screenWidth,
  },

  image: { width: 95, resizeMode: "contain" },

  contentContainer: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingRight: 16,
    borderBottomLeftRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    flexGrow: 1,
  },

  childrenContainer: {
    marginLeft: 20,
    flex: 1,
  },
});

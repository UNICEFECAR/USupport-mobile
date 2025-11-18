import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View, TouchableOpacity } from "react-native";

import { AppText } from "../../";

import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

export const Block = ({ heading, btnLabel, btnOnPress, children, style }) => {
  const { isHighContrast } = useGetTheme();

  return (
    <View style={[styles.block, style]}>
      <View style={styles.heading}>
        <AppText style={{ marginRight: 12 }} namedStyle="h3">
          {heading}
        </AppText>
        <TouchableOpacity onPress={btnOnPress}>
          <AppText style={[styles.button, isHighContrast && styles.buttonHC]}>
            {btnLabel}
          </AppText>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    paddingHorizontal: 16,
  },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  button: {
    color: appStyles.colorSecondary_9749fa,
    fontFamily: appStyles.fontSemiBold,
  },
  buttonHC: {
    color: "#fff",
    textDecorationColor: "#fff",
    textDecorationLine: "underline",
  },
});

Block.propTypes = {
  /**
   * The content of the component.
   * */
  children: PropTypes.node,

  /**
   * Additional styles for the block
   * */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet } from "react-native";

import { AppText } from "../../texts/AppText/AppText";
import { Icon } from "../../icons/Icon";

import { appStyles } from "#styles";

/**
 * PeerSupportBadge
 *
 * U-FRIEND badge for peer support providers
 *
 * @return {jsx}
 */
export const PeerSupportBadge = ({ label = "U-FRIEND", style }) => {
  const resolvedLabel =
    !label || label === "peer_support" || label.endsWith(".peer_support")
      ? "U-FRIEND"
      : label;

  return (
    <View style={[styles.badge, style]}>
      <Icon name="heart" size="sm" color="#ffffff" />
      <AppText namedStyle="smallText" style={styles.text}>
        {resolvedLabel}
      </AppText>
    </View>
  );
};

PeerSupportBadge.propTypes = {
  label: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    backgroundColor: "#e35738",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    padding: 0,
    color: "#ffffff",
    fontFamily: appStyles.fontSemiBold,
    textTransform: "uppercase",
  },
});

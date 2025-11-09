import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet } from "react-native";

import { AppText } from "../../texts";

import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

/**
 * StatusBadge
 *
 * Active/Inactive status badge
 *
 * @return {jsx}
 */
export const StatusBadge = ({ label, status }) => {
  const { isDarkMode } = useGetTheme();

  const getStatusStyle = () => {
    switch (status) {
      case "active":
        return styles.colorGreen_7ec680;
      case "inactive":
        return styles.statusBadge__inactive;
      case "in-progress":
        return styles.statusBadge__inProgress;
      default:
        return styles.statusBadge__active;
    }
  };

  return (
    <View style={[styles.statusBadge, getStatusStyle()]}>
      <AppText style={styles.statusBadge__label}>{label}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBadge: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    marginTop: 4,
    marginRight: "auto",
    paddingVertical: 2,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  statusBadge__label: {
    color: appStyles.colorWhite_ff,
    fontSize: 12,
    textAlign: "center",
  },
  statusBadge__active: {
    backgroundColor: appStyles.colorGreen_7ec680,
  },
  statusBadge__inactive: {
    backgroundColor: appStyles.colorRed_eb5757,
  },
  statusBadge__inProgress: {
    backgroundColor: appStyles.colorGreen_7ec680, // Using gray for in-progress since yellow is commented out
  },
});

StatusBadge.propTypes = {
  label: PropTypes.string.isRequired,
  status: PropTypes.oneOf(["active", "inactive", "in-progress"]).isRequired,
};

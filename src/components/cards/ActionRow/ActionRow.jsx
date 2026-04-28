import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import { AppText } from "../../texts";
import { Icon } from "../../icons";

import { appStyles } from "#styles";

/**
 * ActionRow
 *
 * A card-style action row with icon, label, optional subtitle, and chevron
 *
 * @return {jsx}
 */
export const ActionRow = ({
  iconName,
  label,
  onPress,
  colors,
  isDanger,
  subtitle,
}) => {
  const iconColor = isDanger
    ? appStyles.colorRed_eb5757
    : appStyles.colorSecondary_9749fa;
  const textColor = isDanger ? appStyles.colorRed_eb5757 : colors.text;

  return (
    <TouchableOpacity
      style={styles.actionRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.actionRowLeft}>
        <View style={styles.actionIconContainer}>
          <Icon name={iconName} size="md" color={iconColor} />
        </View>
        <View style={styles.actionTextContainer}>
          <AppText style={{ color: textColor }}>{label}</AppText>
          {subtitle && (
            <AppText style={styles.actionSubtitle}>{subtitle}</AppText>
          )}
        </View>
      </View>
      <View>
        <Icon
          name="arrow-chevron-forward"
          size="sm"
          color={
            isDanger ? appStyles.colorRed_eb5757 : appStyles.colorGray_92989b
          }
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  actionRowLeft: {
    alignItems: "center",
    flexDirection: "row",
  },
  actionSubtitle: {
    color: appStyles.colorGray_92989b,
    fontSize: 12,
    marginTop: 2,
  },
  actionTextContainer: {
    marginLeft: 12,
  },
});

ActionRow.propTypes = {
  iconName: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  colors: PropTypes.object.isRequired,
  isDanger: PropTypes.bool,
  subtitle: PropTypes.string,
};

ActionRow.defaultProps = {
  isDanger: false,
  subtitle: null,
};

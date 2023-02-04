import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet } from "react-native";

import { AppText } from "../../texts";
import { Icon } from "../../icons";
import { appStyles } from "#styles";
import { getTimeAsString, getDateView } from "#utils";

export const SystemMessage = ({
  iconName = "consultation",
  title,
  date,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Icon name={iconName} size="md" color={appStyles.colorPrimary_20809e} />
      <View style={styles.textContainer}>
        <AppText namedStyle="smallText" style={styles.title}>
          {title}
        </AppText>
        <AppText namedStyle="smallText">{getTimeAsString(date)}</AppText>
        <AppText namedStyle="smallText">{getDateView(date)}</AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: appStyles.colorPrimary_20809e,
    borderRadius: 24,
    textAlign: "left",
    width: "85%",
    maxWidth: 280,
    alignSelf: "center",
  },
  title: {
    color: appStyles.colorPrimary_20809e,
    fontFamily: appStyles.fontBold,
  },
  textContainer: { marginLeft: 16 },
});

SystemMessage.propTypes = {
  /**
   * Icon name
   * @default "consultation"
   */
  iconName: PropTypes.string,

  /**
   * Title
   */
  title: PropTypes.string,

  /**
   * Date of the message
   */
  date: PropTypes.instanceOf(Date),

  /**
   * Style
   */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

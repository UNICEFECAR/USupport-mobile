import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import { AppText } from "../../texts";
import { Icon, Emoticon } from "../../icons";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

/**
 * MoodTrackDetails
 *
 * MoodTrackDetails card used in MoodTrackHistoryNew block
 *
 * @return {jsx}
 */
export const MoodTrackDetails = ({ mood, handleClose, t = { t } }) => {
  const { colors, isHighContrast } = useGetTheme();
  const dateText = `${
    mood.time.getDate() > 9 ? mood.time.getDate() : `0${mood.time.getDate()}`
  }.${
    mood.time.getMonth() + 1 > 9
      ? mood.time.getMonth() + 1
      : `0${mood.time.getMonth() + 1}`
  }.${mood.time.getFullYear()}`;
  const timeText = `${mood.time.getHours()}:${
    mood.time.getMinutes() > 9
      ? mood.time.getMinutes()
      : `0${mood.time.getMinutes()}`
  }`;

  return (
    <View
      style={[
        styles.moodTrackDetails,
        { backgroundColor: colors.card },
        { ...appStyles.shadow2 },
      ]}
    >
      <TouchableOpacity onPress={() => handleClose()} style={styles.closeIcon}>
        <Icon name="close-x" size="sm" color={appStyles.colorBlack_37} />
      </TouchableOpacity>
      <AppText namedStyle="h3">
        {dateText}, {timeText}
      </AppText>
      <View style={styles.subheadingContainer}>
        <AppText
          numberOfLines={1}
          style={{ color: colors.textSecondary }}
          adjustsFontSizeToFit={true}
        >
          {t("you_felt")}
        </AppText>
        <Emoticon name={mood.mood} size="sm" style={styles.emoticon} />
        <AppText
          numberOfLines={1}
          style={{ color: colors.textSecondary }}
          adjustsFontSizeToFit={true}
        >
          {t(mood.mood)} {t("comment_text")}
        </AppText>
      </View>
      <AppText
        style={[styles.commentText, isHighContrast && styles.commentTextHC]}
      >
        {mood.comment}
      </AppText>
      {mood.isCritical && (
        <AppText style={styles.criticalText}>{t("critical_text")}</AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  closeIcon: {
    position: "absolute",
    right: 20,
    top: 20,
  },
  commentText: {
    alignSelf: "flex-start",
    color: appStyles.colorPrimary_20809e,
    marginTop: 12,
  },
  criticalText: {
    alignSelf: "flex-start",
    color: appStyles.colorRed_eb5757,
    marginTop: 12,
  },
  emoticon: {
    marginHorizontal: 6,
  },
  moodTrackDetails: {
    alignItems: "center",
    borderRadius: 20,
    flexDirection: "column",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  subheadingContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 12,
    width: "100%",
  },
  commentTextHC: {
    color: "#fff",
  },
  closeIcon: {
    position: "absolute",
    right: 20,
    top: 20,
  },
});

MoodTrackDetails.propTypes = {
  /*
   * Mood object
   */
  mood: PropTypes.object.isRequired,

  /*
   * Function to close the details
   */
  handleClose: PropTypes.func.isRequired,
};

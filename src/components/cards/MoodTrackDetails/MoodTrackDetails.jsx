import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import { AppText } from "../../texts";
import { Icon, Emoticon } from "../../icons";

import { appStyles } from "#styles";

/**
 * MoodTrackDetails
 *
 * MoodTrackDetails card used in MoodTrackHistoryNew block
 *
 * @return {jsx}
 */
export const MoodTrackDetails = ({ mood, handleClose, t = { t } }) => {
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
    <View style={[styles.moodTrackDetails, { ...appStyles.shadow2 }]}>
      <TouchableOpacity onPress={() => handleClose()} style={styles.closeIcon}>
        <Icon name="close-x" size="sm" color={appStyles.colorBlack_37} />
      </TouchableOpacity>
      <AppText namedStyle="h3">
        {dateText}, {timeText}
      </AppText>
      <View style={styles.subheadingContainer}>
        <AppText numberOfLines={1} adjustsFontSizeToFit={true}>
          {t("you_felt")}
        </AppText>
        <Emoticon name={mood.mood} size="sm" style={styles.emoticon} />
        <AppText numberOfLines={1} adjustsFontSizeToFit={true}>
          {t(mood.mood)} {t("comment_text")}
        </AppText>
      </View>
      <AppText style={styles.commentText}>{mood.comment}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  moodTrackDetails: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: appStyles.colorWhite_ff,
    borderRadius: 20,
    flexDirection: "column",
    alignItems: "center",
  },
  subheadingContainer: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  emoticon: {
    marginHorizontal: 6,
  },
  commentText: {
    marginTop: 12,
    marginLeft: 14,
    color: appStyles.colorPrimary_20809e,
    alignSelf: "flex-start",
  },
  closeIcon: {
    position: "absolute",
    top: 20,
    right: 20,
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

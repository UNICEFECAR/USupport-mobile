import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet } from "react-native";

import { AppText } from "../../texts";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";
import { Emoticon } from "../../icons";

/**
 * MoodTrackDetails
 *
 * MoodTrackDetails card used in MoodTrackHistoryNew block
 *
 * @return {jsx}
 */
export const MoodTrackDetails = ({ mood, t }) => {
  const { colors, isHighContrast } = useGetTheme();
  const dateText = `${
    mood.time.getDate() > 9 ? mood.time.getDate() : `0${mood.time.getDate()}`
  }.${
    mood.time.getMonth() + 1 > 9
      ? mood.time.getMonth() + 1
      : `0${mood.time.getMonth() + 1}`
  }.${mood.time.getFullYear()}`;

  return (
    <View style={styles.moodTrackDetails}>
      <View style={styles.subheadingContainer}>
        <AppText
          numberOfLines={1}
          style={{ color: colors.textSecondary }}
          adjustsFontSizeToFit={true}
        >
          {t("you_felt")}
        </AppText>
        <Emoticon name={mood.mood} size="xs" style={styles.emoticon} />
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
  commentText: {
    alignSelf: "flex-start",
    color: appStyles.colorPrimary_20809e,
    marginTop: 16,
  },
  criticalText: {
    alignSelf: "flex-start",
    color: appStyles.colorRed_eb5757,
    marginTop: 16,
  },
  emoticon: {
    marginHorizontal: 4,
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
    marginTop: 16,
    width: "100%",
  },
  commentTextHC: {
    color: "#fff",
  },
});

MoodTrackDetails.propTypes = {
  /*
   * Mood object
   */
  mood: PropTypes.object.isRequired,

  /*
   * Translation function
   */
  t: PropTypes.func.isRequired,
};

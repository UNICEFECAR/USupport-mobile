import React from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";

import { AppText, Emoticon } from "#components";

import { appStyles } from "#styles";

import { getOrdinal, getMonthName } from "#utils";

import { TransparentModal } from "#components";

/**
 * MoodTrackerMoreInformation
 *
 * The MoodTrackerMoreInformation modal
 *
 * @return {jsx}
 */
export const MoodTrackerMoreInformation = ({
  isOpen,
  onClose,
  emoticons,
  moodTrack,
}) => {
  const { t } = useTranslation("mood-tracker-more-information");

  const date = moodTrack.time;
  const day = date?.getDate();
  const ordinal = getOrdinal(day);
  const heading = `${day}${t(ordinal)} ${getMonthName(
    date
  )} ${date.getFullYear()}`;
  const emoticonLabel = emoticons.find(
    (x) => x.value === moodTrack.mood
  )?.label;

  return (
    <TransparentModal heading={heading} isOpen={isOpen} handleClose={onClose}>
      <View style={styles.feelingContainer}>
        <AppText>{t("you_felt")}</AppText>
        <Emoticon
          name={`${moodTrack.mood}`}
          size="xs"
          style={styles.emoticon}
        />
        <AppText style={styles.emoticonLabel}>{emoticonLabel}</AppText>
        {moodTrack.comment && <AppText> {t("comment_text")}</AppText>}
      </View>

      {moodTrack.comment && (
        <AppText style={styles.comment}>“{moodTrack.comment}”</AppText>
      )}
    </TransparentModal>
  );
};

const styles = StyleSheet.create({
  feelingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  emoticon: { marginHorizontal: 4 },
  emoticonLabel: { fontFamily: appStyles.fontBold },
  comment: {
    textAlign: "center",
    marginTop: 36,
    marginBottom: 12,
    color: appStyles.colorPrimary_20809e,
  },
});

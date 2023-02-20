import React, { useState, useCallback, useContext } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

import {
  Block,
  Emoticon,
  AppText,
  Loading,
  Textarea,
  AppButton,
} from "#components";

import { useAddMoodTrack, useGetMoodTrackForToday } from "#hooks";

import { showToast } from "#utils";

import { appStyles } from "#styles";

import { Context } from "#services";

/**
 * MoodTracker
 *
 * MoodTracker component used in Dashboard
 *
 * @return {jsx}
 */
export const MoodTracker = ({ navigation }) => {
  const { t } = useTranslation("mood-tracker");
  const { isTmpUser, handleRegistrationModalOpen } = useContext(Context);

  const emoticonsInitialState = [
    { value: "happy", label: t("happy"), isSelected: false },
    { value: "good", label: t("good"), isSelected: false },
    { value: "sad", label: t("sad"), isSelected: false },
    { value: "depressed", label: t("depressed"), isSelected: false },
    { value: "worried", label: t("worried"), isSelected: false },
  ];

  const [isMoodTrackCompleted, setIsMoodTrackCompleted] = useState(false);
  const [comment, setComment] = useState("");
  const [emoticons, setEmoticons] = useState([...emoticonsInitialState]);

  const onGetMoodTrackSuccess = (data) => {
    if (data) {
      console.log(data, "mood track data");
      handleEmoticonClick(data.mood);
      setComment(data.comment);
      setIsMoodTrackCompleted(true);
    } else {
      setIsMoodTrackCompleted(false);
      setComment("");
      setEmoticons([...emoticonsInitialState]);
    }
  };
  const useGetMoodTrackForTodayQuery = useGetMoodTrackForToday({
    onSuccess: onGetMoodTrackSuccess,
    enabled: !!isTmpUser,
  });

  const hasSelectedMoodtracker = useCallback(() => {
    return emoticons.some((emoticon) => emoticon.isSelected);
  }, [emoticons]);

  const onSuccess = () => {
    setIsMoodTrackCompleted(true);
    showToast({ message: t("add_mood_tracker_success") });
  };
  const onError = (error) => {
    showToast({ message: error, type: "error" });
  };

  const renderEmoticons = () => {
    return emoticons.map((emoticon, index) => {
      return (
        <TouchableOpacity
          onPress={() => handleEmoticonClick(emoticon.value)}
          key={index}
        >
          <View
            style={[
              styles.emoticonContainer,
              !emoticon.isSelected && styles.emoticonContainerNotSelected,
            ]}
          >
            <Emoticon
              name={`${emoticon.value}`}
              size={emoticon.isSelected ? "lg" : "sm"}
            />
            <AppText namedStyle="smallText" style={styles.textSelected}>
              {emoticon.label}
            </AppText>
          </View>
        </TouchableOpacity>
      );
    });
  };

  const addMoodTrackMutation = useAddMoodTrack(onSuccess, onError);

  const handleEmoticonClick = (value) => {
    if (isMoodTrackCompleted) return;
    const newEmoticons = [...emoticons];
    for (let i = 0; i < newEmoticons.length; i++) {
      const currentMood = newEmoticons[i];
      if (currentMood.value === value) {
        newEmoticons[i].isSelected = true;
      } else {
        newEmoticons[i].isSelected = false;
      }
    }
    setEmoticons(newEmoticons);
  };

  const handleSubmit = () => {
    if (isTmpUser) {
      handleRegistrationModalOpen();
      return;
    }
    const selectedMood = emoticons.find((x) => x.isSelected);
    addMoodTrackMutation.mutate({
      comment,
      mood: selectedMood.value,
    });
  };

  const handleMoodtrackClick = () => {
    if (isTmpUser) {
      handleRegistrationModalOpen();
      return;
    }
    navigation.push("MoodTracker");
  };

  return (
    <Block style={styles.block}>
      <View style={styles.heading}>
        <AppText namedStyle="h3">{t("heading")}</AppText>
        <TouchableOpacity onPress={handleMoodtrackClick}>
          <AppText style={styles.moodTrackerButton}>
            {t("mood_tracker")}
          </AppText>
        </TouchableOpacity>
      </View>
      {!useGetMoodTrackForTodayQuery.isLoading || isTmpUser ? (
        <>
          <View style={styles.rating}>{renderEmoticons()}</View>
          {hasSelectedMoodtracker() && (
            <View style={styles.additionalCommentContainer}>
              <Textarea
                value={comment}
                onChange={(value) => setComment(value)}
                placeholder={t("additional_comment_placeholder")}
                size="md"
                disabled={isMoodTrackCompleted}
              />
              {!isMoodTrackCompleted && (
                <View className="mood-tracker__additional-comment__button-container">
                  <AppButton
                    label={t("submit_mood_track")}
                    size="lg"
                    onPress={handleSubmit}
                    loading={addMoodTrackMutation.isLoading}
                    style={styles.submitButton}
                  />
                </View>
              )}
            </View>
          )}
        </>
      ) : (
        <View style={styles.loadingContianer}>
          <Loading size="md" />
        </View>
      )}
    </Block>
  );
};

const styles = StyleSheet.create({
  block: { paddingTop: 40 },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  moodTrackerButton: { color: appStyles.colorSecondary_9749fa },
  rating: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    paddingTop: 16,
  },
  emoticonContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 62,
  },
  emoticonContainerNotSelected: { opacity: 0.5 },
  loadingContianer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
  },
  additionalCommentContainer: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 16,
  },
  submitButton: { marginTop: 16 },
  textSelected: { color: appStyles.colorBlack_37 },
});

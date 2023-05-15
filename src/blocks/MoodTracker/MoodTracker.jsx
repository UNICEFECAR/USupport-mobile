import React, { useState, useCallback, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

import { Block, Emoticon, AppText, Textarea, AppButton } from "#components";

import { useAddMoodTrack } from "#hooks";

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
  const queryClient = useQueryClient();

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

  const hasSelectedMoodtracker = useCallback(() => {
    return emoticons.some((emoticon) => emoticon.isSelected);
  }, [emoticons]);

  const onSuccess = () => {
    setIsMoodTrackCompleted(true);
    queryClient.refetchQueries({
      queryKey: ["getMoodTrackEntries", 5, 0],
      refetchType: "all",
    });
    showToast({ message: t("add_mood_tracker_success") });
  };
  const onError = (error) => {
    showToast({ message: error, type: "error" });
  };

  const renderEmoticons = () => {
    return emoticons.map((emoticon, index) => {
      const emoticonView = (
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
          <AppText
            numberOfLines={1}
            namedStyle="smallText"
            style={styles.textSelected}
          >
            {emoticon.label}
          </AppText>
        </View>
      );
      return isMoodTrackCompleted ? (
        <View key={index}>{emoticonView}</View>
      ) : (
        <TouchableOpacity
          onPress={() => handleEmoticonClick(emoticon.value)}
          key={index}
        >
          {emoticonView}
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
    navigation.navigate("MoodTrackHistory");
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
  moodTrackerButton: {
    color: appStyles.colorSecondary_9749fa,
    fontFamily: appStyles.fontSemiBold,
  },
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

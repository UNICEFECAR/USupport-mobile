import React, { useState, useCallback, useContext, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

import {
  Block,
  Emoticon,
  Toggle,
  AppText,
  Textarea,
  AppButton,
} from "#components";
import { useAddMoodTrack, useGetTheme } from "#hooks";
import { showToast } from "#utils";
import { appStyles } from "#styles";
import { localStorage, Context } from "#services";

/**
 * MoodTracker
 *
 * MoodTracker component used in Dashboard
 *
 * @return {jsx}
 */
export const MoodTracker = ({
  navigation,
  clientData,
  openRequireDataAgreement,
}) => {
  const { colors } = useGetTheme();
  const { t, i18n } = useTranslation("blocks", { keyPrefix: "mood-tracker" });
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
  const [isEmergency, setIsEmergency] = useState(false);

  const [showEmergency, setShowEmergency] = useState(false);
  useEffect(() => {
    localStorage.getItem("country").then((country) => {
      setShowEmergency(country === "RO");
    });
  }, []);

  useEffect(() => {
    const emoticonsCopy = [...emoticonsInitialState];
    emoticonsCopy.forEach((emoticon, i) => {
      emoticonsCopy[i].label = t(emoticon.value);
    });
    setEmoticons(emoticonsCopy);
  }, [i18n.language]);

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
            numberOfLines={2}
            namedStyle="smallText"
            style={[
              styles.textSelected,
              {
                textAlign: "center",
                color: colors.textTertiary,
              },
            ]}
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
    if (!clientData.dataProcessing) {
      openRequireDataAgreement(false);
      return;
    }
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
      emergency: showEmergency ? isEmergency : false,
    });
  };

  const handleMoodtrackClick = () => {
    if (isTmpUser) {
      handleRegistrationModalOpen();
      return;
    } else if (!clientData.dataProcessing) {
      openRequireDataAgreement(false);
      return;
    }
    navigation.navigate("MoodTrackHistory");
  };

  return (
    <Block
      style={styles.block}
      heading={t("heading")}
      btnLabel={t("mood_tracker")}
      btnOnPress={handleMoodtrackClick}
    >
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
          {showEmergency && (
            <Toggle
              label={t("emergency_label")}
              isToggled={isEmergency}
              handleToggle={(checked) => setIsEmergency(checked)}
            />
          )}
          {!isMoodTrackCompleted && (
            <View>
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
  additionalCommentContainer: {
    alignItems: "center",
    flexDirection: "column",
    paddingVertical: 16,
  },
  block: { paddingTop: 40 },
  emoticonContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 62,
  },
  emoticonContainerNotSelected: { opacity: 0.5 },
  heading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  moodTrackerButton: {
    color: appStyles.colorSecondary_9749fa,
    fontFamily: appStyles.fontSemiBold,
  },
  rating: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    width: "100%",
  },
  submitButton: { marginTop: 16 },
  textSelected: { color: appStyles.colorBlack_37 },
});

import React, {
  useState,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

import {
  AppText,
  AppButton,
  Block,
  Emoticon,
  Toggle,
  Textarea,
  TransparentModal,
} from "#components";
import {
  useAddMoodTrack,
  useGetTheme,
  useGetHasCompletedMoodTrackerEver,
} from "#hooks";
import { showToast } from "#utils";
import { appStyles } from "#styles";
import { localStorage, Context } from "#services";
import { HowItWorksMoodTrack } from "#modals";

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
  onTextareaFocus,
}) => {
  const { colors } = useGetTheme();

  const { t, i18n } = useTranslation("blocks", { keyPrefix: "mood-tracker" });
  const { country, isTmpUser, handleRegistrationModalOpen } =
    useContext(Context);
  const queryClient = useQueryClient();

  const IS_RO = country === "RO";

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
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isHowItWorksMoodTrackOpen, setIsHowItWorksMoodTrackOpen] =
    useState(false);

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

  const { data: hasCompletedMoodTrackerEver } =
    useGetHasCompletedMoodTrackerEver(IS_RO);

  const textDynamicStyle = useMemo(
    () => ({ textAlign: "center", color: colors.textTertiary }),
    [colors.textTertiary]
  );

  const hasSelectedMoodtracker = useCallback(() => {
    return emoticons.some((emoticon) => emoticon.isSelected);
  }, [emoticons]);

  const onSuccess = () => {
    setComment("");
    setEmoticons(emoticonsInitialState);
    setIsEmergency(false);
    queryClient.refetchQueries({
      queryKey: ["getMoodTrackEntries", 5, 0],
      refetchType: "all",
    });
    showToast({ message: t("add_mood_tracker_success") });

    if (IS_RO) {
      setIsSuccessModalOpen(true);
    }
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
            style={[styles.textSelected, textDynamicStyle]}
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
    <React.Fragment>
      <TransparentModal
        isOpen={isSuccessModalOpen}
        handleClose={() => setIsSuccessModalOpen(false)}
        heading={t("recommendations")}
        text={t("recommendations_text")}
        ctaLabel={t("check_out")}
        ctaHandleClick={() => {
          setIsSuccessModalOpen(false);
          navigation.navigate("MoodTrackHistory");
        }}
      />
      <HowItWorksMoodTrack
        isOpen={isHowItWorksMoodTrackOpen}
        onClose={() => setIsHowItWorksMoodTrackOpen(false)}
      />
      <Block style={styles.block}>
        <View style={styles.heading}>
          <AppText style={styles.headingText} namedStyle="h3">
            {t("heading")}
          </AppText>
          {!(IS_RO && !hasCompletedMoodTrackerEver) ? (
            <TouchableOpacity onPress={handleMoodtrackClick}>
              <AppText style={styles.moodTrackerButton}>
                {t("mood_tracker")}
              </AppText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setIsHowItWorksMoodTrackOpen(true)}
            >
              <AppText style={styles.moodTrackerButton}>
                {t("how_it_works")}
              </AppText>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.rating}>{renderEmoticons()}</View>
        {hasSelectedMoodtracker() && (
          <View style={styles.additionalCommentContainer}>
            <Textarea
              value={comment}
              onChange={(value) => setComment(value)}
              placeholder={t("additional_comment_placeholder")}
              disabled={isMoodTrackCompleted}
              style={{ width: "100%" }}
              onFocus={onTextareaFocus}
            />
            {showEmergency && (
              <View style={styles.emergencyContainer}>
                <AppText namedStyle="text" style={styles.emergencyLabel}>
                  {t("emergency_label")}
                </AppText>
                <Toggle
                  isToggled={isEmergency}
                  handleToggle={(checked) => setIsEmergency(checked)}
                />
              </View>
            )}
            {!isMoodTrackCompleted && (
              <View>
                <AppButton
                  label={t("submit_mood_track")}
                  onPress={handleSubmit}
                  loading={addMoodTrackMutation.isLoading}
                  style={styles.submitButton}
                />
              </View>
            )}
          </View>
        )}
      </Block>
    </React.Fragment>
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
  emergencyContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "97%",
    marginTop: 16,
    marginHorizontal: "auto",
  },
  emergencyLabel: {
    marginRight: 12,
  },
  heading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  headingText: { marginRight: 12 },
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

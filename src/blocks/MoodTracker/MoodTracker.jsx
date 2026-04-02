import React, {
  useState,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from "react-native";
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
import { mascotHappyPurple } from "#assets";
import LinearGradient from "../../components/LinearGradient";

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
  const { width: windowWidth } = useWindowDimensions();
  const isMobileLayout = windowWidth < 768;

  const { t, i18n } = useTranslation("blocks", { keyPrefix: "mood-tracker" });
  const { country, isTmpUser, handleRegistrationModalOpen } =
    useContext(Context);
  const queryClient = useQueryClient();

  const IS_RO = country === "RO";

  const emoticonsInitialState = [
    { value: "happy", label: t("happy"), isSelected: false },
    { value: "good", label: t("good"), isSelected: false },
    { value: "sad", label: t("sad"), isSelected: false },
    {
      value: "depressed",
      label: t("depressed"),
      isSelected: false,
    },
    { value: "worried", label: t("worried"), isSelected: false },
  ];

  const [comment, setComment] = useState("");
  const [emoticons, setEmoticons] = useState([...emoticonsInitialState]);
  const [isEmergency, setIsEmergency] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isHowItWorksMoodTrackOpen, setIsHowItWorksMoodTrackOpen] =
    useState(false);
  const [isMoodTrackModalOpen, setIsMoodTrackModalOpen] = useState(false);

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

  const clientName = useMemo(() => {
    if (!clientData) return "";
    if (clientData.name && clientData.surname) {
      return `${clientData.name} ${clientData.surname}`;
    }
    return clientData.nickname || clientData.name || "";
  }, [clientData]);

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
    setIsMoodTrackModalOpen(false);
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
      const isAnySelected = emoticons.some((x) => x.isSelected);
      const isNotSelected = isAnySelected && !emoticon.isSelected;

      return (
        <TouchableOpacity
          onPress={() => handleEmoticonClick(emoticon.value)}
          key={index}
          style={[
            styles.tileTouchable,
            isNotSelected && styles.tileNotSelected,
          ]}
        >
          <LinearGradient
            gradient={appStyles.gradientSecondary3}
            style={[
              styles.emoticonBubble,
              appStyles.shadow2,
              emoticon.isSelected && styles.emoticonBubbleSelected,
            ]}
          >
            <Emoticon
              name={`${emoticon.value}`}
              size={emoticon.isSelected ? "lg" : "sm"}
            />
          </LinearGradient>
          <AppText
            numberOfLines={2}
            namedStyle="smallText"
            style={[styles.tileLabel, textDynamicStyle]}
          >
            {emoticon.label}
          </AppText>
        </TouchableOpacity>
      );
    });
  };

  const addMoodTrackMutation = useAddMoodTrack(onSuccess, onError);

  const handleEmoticonClick = (value) => {
    if (isTmpUser) {
      handleRegistrationModalOpen();
      return;
    }
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
    setIsMoodTrackModalOpen(true);
  };

  const handleSubmit = () => {
    const selectedMood = emoticons.find((x) => x.isSelected);
    if (!selectedMood) return;
    addMoodTrackMutation.mutate({
      comment,
      mood: selectedMood.value,
      emergency: showEmergency ? isEmergency : false,
    });
  };

  const handleMoreTilePress = () => {
    if (isTmpUser) {
      handleRegistrationModalOpen();
      return;
    }
    if (!clientData.dataProcessing) {
      openRequireDataAgreement(false);
      return;
    }
    if (hasCompletedMoodTrackerEver) {
      navigation.navigate("MoodTrackHistory");
      return;
    }
    setIsHowItWorksMoodTrackOpen(true);
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
        <View style={[styles.topRow, isMobileLayout && styles.topRowMobile]}>
          <View style={styles.headingContainer}>
            <AppText namedStyle="h2" style={styles.welcomeHeading}>
              {t("welcome-heading")}
              {clientName ? (
                <AppText namedStyle="h2" style={styles.welcomeHeadingName}>
                  {" "}
                  {clientName}
                </AppText>
              ) : null}
            </AppText>
            <AppText namedStyle="text" style={styles.subheading}>
              {t("heading")}
            </AppText>
          </View>

          {!isMobileLayout ? (
            <Image source={mascotHappyPurple} style={styles.mascot} />
          ) : null}
        </View>

        <View style={styles.rating}>
          {renderEmoticons()}
          <TouchableOpacity
            onPress={handleMoreTilePress}
            style={styles.tileTouchable}
          >
            <View style={[styles.moreTile, appStyles.shadow1]}>
              <Emoticon
                name={hasCompletedMoodTrackerEver ? "happy" : "good"}
                size="sm"
              />
            </View>
            <AppText
              numberOfLines={2}
              namedStyle="smallText"
              style={[styles.tileLabel, textDynamicStyle]}
            >
              {hasCompletedMoodTrackerEver ? t("history") : t("how_it_works")}
            </AppText>
          </TouchableOpacity>
        </View>

        {isMobileLayout ? (
          <View style={styles.mascotRowMobile}>
            <Image source={mascotHappyPurple} style={styles.mascotMobile} />
          </View>
        ) : null}
      </Block>

      <TransparentModal
        heading={t("heading")}
        isOpen={isMoodTrackModalOpen}
        handleClose={() => setIsMoodTrackModalOpen(false)}
        ctaLabel={t("submit_mood_track")}
        ctaHandleClick={handleSubmit}
        isCtaDisabled={
          !hasSelectedMoodtracker() || addMoodTrackMutation.isLoading
        }
        isCtaLoading={addMoodTrackMutation.isLoading}
      >
        <View style={styles.modalEmoticonsRow}>{renderEmoticons()}</View>
        {hasSelectedMoodtracker() ? (
          <View style={styles.modalContent}>
            <Textarea
              value={comment}
              onChange={(value) => setComment(value)}
              placeholder={t("additional_comment_placeholder")}
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
          </View>
        ) : null}
      </TransparentModal>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  block: { paddingTop: 120, paddingBottom: 8 },
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
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  topRowMobile: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  headingContainer: { flex: 1, paddingRight: 12 },
  welcomeHeading: { flexWrap: "wrap" },
  welcomeHeadingName: { color: appStyles.colorSecondary_9749fa },
  subheading: { marginTop: 8, color: appStyles.colorGray_66768d },
  mascot: { width: 92, height: 92, resizeMode: "contain" },
  rating: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingTop: 20,
    width: "100%",
  },
  tileTouchable: {
    width: "30%",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 16,
  },
  tileNotSelected: { opacity: 0.5 },
  emoticonBubble: {
    width: 62,
    height: 62,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.62)",
  },
  emoticonBubbleSelected: {
    transform: [{ scale: 1.02 }],
  },
  tileLabel: {
    marginTop: 6,
    paddingHorizontal: 2,
  },
  moreTile: {
    width: 62,
    height: 62,
    borderRadius: 999,
    backgroundColor: appStyles.colorWhite_ff,
    alignItems: "center",
    justifyContent: "center",
  },
  mascotRowMobile: {
    width: "100%",
    alignItems: "flex-end",
    paddingTop: 4,
  },
  mascotMobile: { width: 110, height: 110, resizeMode: "contain" },
  modalEmoticonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 8,
    paddingTop: 8,
  },
  modalContent: {
    paddingTop: 16,
    alignItems: "center",
  },
});

import React, {
  useState,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  AccessibilityInfo,
} from "react-native";
import { useTranslation } from "react-i18next";

import {
  AppText,
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
import { mascotHappyPurpleFull, mascotHappyPurpleLight } from "#assets";

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
  const { colors, isDarkMode, isHighContrast } = useGetTheme();

  const { t, i18n } = useTranslation("blocks", { keyPrefix: "mood-tracker" });
  const { country, isTmpUser, handleRegistrationModalOpen } =
    useContext(Context);
  const queryClient = useQueryClient();

  const IS_RO = country === "RO";

  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);
  const attentionTranslateY = useRef(new Animated.Value(0)).current;
  const attentionScale = useRef(new Animated.Value(1)).current;

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
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (!isMounted) return;
        setIsReduceMotionEnabled(Boolean(enabled));
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => {
        setIsReduceMotionEnabled(Boolean(enabled));
      }
    );

    return () => {
      isMounted = false;
      if (subscription?.remove) subscription.remove();
      else if (AccessibilityInfo.removeEventListener) {
        AccessibilityInfo.removeEventListener(
          "reduceMotionChanged",
          setIsReduceMotionEnabled
        );
      }
    };
  }, []);

  useEffect(() => {
    if (isReduceMotionEnabled) {
      attentionTranslateY.stopAnimation();
      attentionScale.stopAnimation();
      attentionTranslateY.setValue(0);
      attentionScale.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(attentionTranslateY, {
            toValue: -7,
            duration: 360, // 12% of 3000ms
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(attentionScale, {
            toValue: 1.06,
            duration: 360,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(attentionTranslateY, {
            toValue: 2,
            duration: 240, // 20% - 12%
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(attentionScale, {
            toValue: 1.02,
            duration: 240,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(attentionTranslateY, {
            toValue: 0,
            duration: 180,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(attentionScale, {
            toValue: 1,
            duration: 180,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2220),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [
    attentionScale,
    attentionTranslateY,
    isReduceMotionEnabled,
    hasCompletedMoodTrackerEver,
  ]);

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

  const subheadingDynamicStyle = useMemo(
    () => ({
      color: colors.text,
      fontFamily: appStyles.fontLight, // match web font-weight: 300
      fontSize: 32, // match web h2 on < $screen-lg
      lineHeight: 38,
    }),
    [colors.text]
  );

  const selectedLabelColor = useMemo(() => {
    if (isDarkMode || isHighContrast) return colors.textTertiary;
    return appStyles.colorSecondary_9749fa;
  }, [colors.textTertiary, isDarkMode, isHighContrast]);

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

  const renderEmoticons = ({ isModal = false } = {}) => {
    return emoticons.map((emoticon, index) => {
      const isAnySelected = emoticons.some((x) => x.isSelected);
      const isNotSelected = isAnySelected && !emoticon.isSelected;
      const labelSelectedInModal =
        isModal && emoticon.isSelected && !isDarkMode && !isHighContrast;

      return (
        <TouchableOpacity
          onPress={() => handleEmoticonClick(emoticon.value)}
          key={index}
          style={[
            styles.tileTouchable,
            isModal && styles.tileTouchableModal,
            isNotSelected && styles.tileNotSelected,
          ]}
        >
          <Emoticon
            name={`${emoticon.value}`}
            size={emoticon.isSelected ? "lg" : "sm"}
          />
          <AppText
            numberOfLines={1}
            ellipsizeMode="tail"
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

  // const renderUserGuideButton = () => {
  //   if (!IS_RO || typeof openUserGuide !== "function") return null;

  //   return (
  //     <TouchableOpacity
  //       onPress={openUserGuide}
  //       accessibilityRole="button"
  //       accessibilityLabel={t("user_guide")}
  //       style={[styles.userGuideButton, styles.userGuideButtonCompact]}
  //     >
  //       <Icon name="read-book" color="#fff" size="sm" />
  //     </TouchableOpacity>
  //   );
  // };

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
        <View style={styles.topRow}>
          <View style={styles.headingContainer}>
            <AppText namedStyle="h1" style={styles.welcomeHeading}>
              {t("welcome-heading")}
              {clientName ? ", " : null}
              {clientName ? (
                <AppText namedStyle="h1" style={styles.welcomeHeadingName}>
                  {clientName}
                </AppText>
              ) : null}
            </AppText>
            <AppText
              namedStyle="text"
              style={[styles.subheading, subheadingDynamicStyle]}
            >
              {t("heading")}
            </AppText>
          </View>
          {/* {renderUserGuideButton()} */}
        </View>

        <View style={styles.rating}>
          {renderEmoticons()}
          <TouchableOpacity
            onPress={handleMoreTilePress}
            style={styles.tileTouchable}
          >
            <Animated.View
              style={[
                styles.emoticonBubble,
                !isReduceMotionEnabled && {
                  transform: [
                    { translateY: attentionTranslateY },
                    { scale: attentionScale },
                  ],
                },
              ]}
            >
              <Emoticon
                name={
                  hasCompletedMoodTrackerEver
                    ? "emoticon-history"
                    : "emoticon-insight"
                }
                size="sm"
              />
            </Animated.View>
            <AppText
              numberOfLines={2}
              namedStyle="smallText"
              style={[styles.tileLabel, textDynamicStyle]}
            >
              {hasCompletedMoodTrackerEver ? t("history") : t("how_it_works")}
            </AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.mascotRow}>
          <Image
            source={
              isDarkMode || isHighContrast
                ? mascotHappyPurpleLight
                : mascotHappyPurpleFull
            }
            style={styles.mascot}
          />
        </View>
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
        <View style={styles.modalBody}>
          <View style={styles.modalEmoticonsRow}>
            {renderEmoticons({ isModal: true })}
          </View>
          {hasSelectedMoodtracker() ? (
            <View style={styles.modalAdditionalComment}>
              <Textarea
                value={comment}
                onChange={(value) => setComment(value)}
                label={t("additional_comment_label")}
                placeholder={t("additional_comment_placeholder")}
                style={styles.modalTextarea}
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
        </View>
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
    width: "100%",
    paddingTop: 16,
    gap: 16,
  },
  emergencyLabel: {
    flex: 1,
    marginRight: 12,
    textAlign: "left",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  headingContainer: { flex: 1 },
  welcomeHeading: { flexWrap: "wrap" },
  welcomeHeadingName: { color: appStyles.colorPurple },
  subheading: { marginTop: 8 },
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
  /** Five equal columns, centered — matches web .mood-tracker__rating-box__rating--modal */
  tileTouchableModal: {
    width: "20%",
    maxWidth: "20%",
    marginBottom: 12,
  },
  tileNotSelected: { opacity: 0.5 },
  emoticonBubble: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  emoticonBubbleSelected: {
    transform: [{ scale: 1.02 }],
  },
  tileLabel: {
    marginTop: 6,
    paddingHorizontal: 2,
    width: "100%",
    flexWrap: "nowrap",
  },
  mascotRow: {
    width: "100%",
    alignItems: "flex-end",
    paddingTop: 4,
  },
  mascot: { width: 160, height: 160, resizeMode: "contain" },
  modalBody: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 16,
  },
  modalEmoticonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-start",
    width: "100%",
  },
  /** Matches web .mood-tracker__modal__content__additional-comment */
  modalAdditionalComment: {
    width: "100%",
    marginTop: 16,
    alignSelf: "stretch",
  },
  modalTextarea: {
    width: "100%",
    alignSelf: "stretch",
  },
  userGuideButton: {
    backgroundColor: appStyles.colorPurple,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    marginTop: 16,
  },
  userGuideButtonCompact: {
    width: 45,
    height: 45,
    borderRadius: 25,
  },
});

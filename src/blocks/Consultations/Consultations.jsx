import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, View } from "react-native";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";

import { AppText, Consultation, NewButton } from "#components";
import { FIVE_MINUTES, getConsultationEndDate, showToast } from "#utils";
import {
  useGetAllConsultations,
  useAcceptConsultation,
  useRejectConsultation,
  useGetTheme,
} from "#hooks";
import { appStyles } from "#styles";

/**
 * Get upcoming consultations (not yet finished)
 */
const getUpcomingConsultations = (consultations, currentDateTs) => {
  return consultations
    ?.filter((consultation) => {
      const endTime = getConsultationEndDate(
        consultation.timestamp,
        consultation.durationMinutes
      ).getTime();
      return (
        consultation.timestamp >= currentDateTs ||
        (currentDateTs >= consultation.timestamp && currentDateTs <= endTime)
      );
    })
    .sort((a, b) => a.timestamp - b.timestamp);
};

/**
 * Get past consultations (finished)
 */
const getPastConsultations = (consultations, currentDateTs) => {
  return consultations
    ?.filter((consultation) => {
      const endTime = getConsultationEndDate(
        consultation.timestamp,
        consultation.durationMinutes
      ).getTime();
      return (
        endTime < currentDateTs &&
        (consultation.status === "finished" ||
          consultation.status === "scheduled")
      );
    })
    .sort((a, b) => b.timestamp - a.timestamp);
};

// Avoid long timers (React Native warns about them on Android)
const MAX_TIMER_DELAY = 60 * 1000;

/**
 * Get the closest future moment at which a consultation changes state
 * (join becomes available, consultation starts or consultation ends)
 */
const getNextStateChangeTs = (consultations, currentDateTs) => {
  let next = null;
  consultations?.forEach(({ timestamp, durationMinutes }) => {
    const endTs = getConsultationEndDate(timestamp, durationMinutes).getTime();
    [timestamp - FIVE_MINUTES, timestamp, endTs + 1].forEach(
      (ts) => {
        if (ts > currentDateTs && (next === null || ts < next)) next = ts;
      }
    );
  });
  return next;
};

/**
 * Consultations
 *
 * Consultations block
 *
 * @return {jsx}
 */
export const Consultations = ({
  openEditConsultation,
  openJoinConsultation,
  isTmpUser,
  navigation,
  currencySymbol,
  onScheduleConsultationClick,
  openDeviceTest,
}) => {
  const { t, i18n } = useTranslation("blocks", { keyPrefix: "consultations" });
  const { colors, isDarkMode } = useGetTheme();
  const isAndroid = Platform.OS === "android";
  const hasAutoTriggeredRef = useRef(false);

  const daysOfWeekTranslations = {
    monday: t("monday"),
    tuesday: t("tuesday"),
    wednesday: t("wednesday"),
    thursday: t("thursday"),
    friday: t("friday"),
    saturday: t("saturday"),
    sunday: t("sunday"),
  };

  const consultationsQuery = useGetAllConsultations(!isTmpUser);
  const isFocused = useIsFocused();

  // The current time used to split consultations and enable the join button.
  // Kept in state so the list re-renders when a consultation changes state.
  const [nowTs, setNowTs] = useState(() => Date.now());

  // Refetch the consultations each time the screen is focused
  useFocusEffect(
    useCallback(() => {
      setNowTs(Date.now());
      if (!isTmpUser) consultationsQuery.refetch({ cancelRefetch: false });
    }, [isTmpUser])
  );

  // While the screen is focused, re-render (and refetch) at the moment the
  // next consultation becomes joinable, starts or ends
  useEffect(() => {
    if (!isFocused || isTmpUser) return;

    const nextTs = getNextStateChangeTs(consultationsQuery.data, nowTs);
    if (!nextTs) return;

    const delay = Math.min(nextTs - Date.now(), MAX_TIMER_DELAY);
    const timeout = setTimeout(
      () => {
        const currentTs = Date.now();
        setNowTs(currentTs);
        if (currentTs >= nextTs) consultationsQuery.refetch();
      },
      Math.max(delay, 0)
    );

    return () => clearTimeout(timeout);
  }, [consultationsQuery.data, isFocused, isTmpUser, nowTs]);

  const handleOpenEdit = (consultation) => {
    openEditConsultation(consultation);
  };

  const handleOpenDetails = (consultation) => {
    navigation.navigate("ActivityHistory", {
      providerId: consultation.providerId,
      consultation: consultation,
    });
  };

  const onAcceptConsultationSuccess = () => {
    showToast({
      message: t("accept_consultation_success"),
    });
  };
  const onAcceptConsultationError = (error) => {
    showToast({
      message: error,
      type: "error",
    });
  };
  const acceptConsultationMutation = useAcceptConsultation(
    onAcceptConsultationSuccess,
    onAcceptConsultationError
  );
  const acceptConsultation = (consultationId, price, timestamp) => {
    acceptConsultationMutation.mutate({
      consultationId,
      price,
      slot: timestamp,
    });
  };

  const onRejectConsultationSuccess = () => {
    showToast({ message: t("reject_consultation_success") });
  };
  const onRejectConsultationError = (error) => {
    showToast({ message: error, type: "error" });
  };
  const rejectConsultationMutation = useRejectConsultation(
    onRejectConsultationSuccess,
    onRejectConsultationError
  );
  const rejectConsultation = (consultationId) => {
    rejectConsultationMutation.mutate(consultationId);
  };

  const renderList = useCallback(
    (list) => {
      return list.map((consultation, index) => (
        <Consultation
          renderIn="client"
          handleOpenEdit={handleOpenEdit}
          handleJoinClick={openJoinConsultation}
          handleTestDevices={openDeviceTest}
          handleOpenDetails={handleOpenDetails}
          daysOfWeekTranslations={daysOfWeekTranslations}
          consultation={consultation}
          overview={false}
          suggested={consultation.status === "suggested"}
          handleAcceptConsultation={acceptConsultation}
          handleRejectConsultation={rejectConsultation}
          currencySymbol={currencySymbol}
          key={consultation.consultationId || index}
          t={t}
          style={styles.consultation}
          sponsorImage={consultation.sponsorImage}
        />
      ));
    },
    [
      acceptConsultation,
      currencySymbol,
      daysOfWeekTranslations,
      handleOpenDetails,
      openJoinConsultation,
      openDeviceTest,
      rejectConsultation,
      t,
    ]
  );

  const renderAllConsultations = useMemo(() => {
    if (isTmpUser) return <AppText>{t("registration_needed")}</AppText>;

    const consultations = consultationsQuery.data || [];
    const upcoming = getUpcomingConsultations(consultations, nowTs) || [];
    const past = getPastConsultations(consultations, nowTs) || [];
    const hasUpcoming = upcoming.length > 0;
    const hasPast = past.length > 0;

    if (
      onScheduleConsultationClick &&
      !consultationsQuery.isLoading &&
      consultationsQuery.data &&
      !hasUpcoming &&
      !hasPast &&
      !hasAutoTriggeredRef.current
    ) {
      hasAutoTriggeredRef.current = true;
      onScheduleConsultationClick();
    }

    if (!hasUpcoming && !hasPast) {
      return (
        <View style={styles.empty}>
          {onScheduleConsultationClick ? (
            <NewButton
              label={t("schedule_button_label")}
              iconName="calendar"
              iconColor="#ffffff"
              size="lg"
              isFullWidth
              onPress={onScheduleConsultationClick}
            />
          ) : null}
        </View>
      );
    }

    return (
      <View>
        {!!onScheduleConsultationClick && (
          <NewButton
            label={t("schedule_button_label")}
            iconName="calendar"
            iconColor="#ffffff"
            size="lg"
            onPress={onScheduleConsultationClick}
            isFullWidth
            style={styles.headingButton}
          />
        )}
        {hasUpcoming && (
          <View style={styles.section}>
            <View
              style={[
                styles.sectionHeading,
                styles.sectionHeadingBorder,
                {
                  borderBottomColor: isDarkMode
                    ? "#344054"
                    : appStyles.colorGray_cdd8e1,
                },
              ]}
            >
              <AppText namedStyle="h3" style={{ color: colors.text }}>
                {t("upcoming_tab_label")}
              </AppText>
            </View>
            <View style={styles.list}>{renderList(upcoming)}</View>
          </View>
        )}

        {hasPast && (
          <View style={[styles.section, hasUpcoming && styles.sectionAfter]}>
            <View
              style={[
                styles.sectionHeading,
                styles.sectionHeadingBorder,
                {
                  borderBottomColor: isDarkMode
                    ? "#344054"
                    : appStyles.colorGray_cdd8e1,
                },
              ]}
            >
              <AppText namedStyle="h3" style={{ color: colors.text }}>
                {t("past_tab_label")}
              </AppText>
            </View>
            <View style={styles.list}>{renderList(past)}</View>
          </View>
        )}
      </View>
    );
  }, [
    colors.text,
    consultationsQuery.data,
    consultationsQuery.isLoading,
    i18n.language,
    isTmpUser,
    isDarkMode,
    nowTs,
    onScheduleConsultationClick,
    renderList,
    t,
  ]);

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.glassBox,
          {
            backgroundColor: isDarkMode
              ? colors.card
              : isAndroid
                ? colors.card
                : "rgba(255,255,255,0.78)",
            borderColor: isDarkMode
              ? colors.border || "rgba(255,255,255,0.12)"
              : isAndroid
                ? appStyles.colorGray_cdd8e1
                : "rgba(224, 233, 255, 0.70)",
          },
        ]}
      >
        {renderAllConsultations}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  consultation: { marginBottom: 24, width: "100%" },
  empty: {
    paddingVertical: 24,
  },
  headingButton: {
    width: "100%",
    marginBottom: 16,
  },
  glassBox: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    ...appStyles.shadow2,
  },
  list: {
    alignItems: "stretch",
  },
  root: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 64,
  },
  section: {},
  sectionAfter: {
    marginTop: 32,
  },
  sectionHeading: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 12,
    paddingBottom: 12,
    marginBottom: 12,
  },
  sectionHeadingBorder: {
    borderBottomWidth: 1,
  },
});

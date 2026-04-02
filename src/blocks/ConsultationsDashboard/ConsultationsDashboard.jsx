import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

import { Block, AppText, NewButton, Loading, Consultation } from "#components";
import { appStyles } from "#styles";

import { useGetTheme, useRejectConsultation } from "#hooks";
import { Context } from "#services";
import { showToast } from "#utils";

/**
 * ConsultationsDashboard
 *
 * ConsultationsDashboard block
 *
 * @return {jsx}
 */
export const ConsultationsDashboard = ({
  openJoinConsultation,
  openEditConsultation,
  handleAcceptSuggestion,
  handleSchedule,
  upcomingConsultations,
  isLoading,
  navigation,
  handleRegistrationModalOpen,
  isTmpUser,
  currencySymbol = "",
}) => {
  const { isDarkMode } = useGetTheme();
  const { t, i18n } = useTranslation("blocks", {
    keyPrefix: "consultations-dashboard",
  });
  const { t: tConsultation } = useTranslation("blocks", {
    keyPrefix: "consultations",
  });
  const VIDEO_HEIGHT = (appStyles.screenWidth * 9) / 16;

  const { country } = useContext(Context);
  const shouldShowVideo =
    country === "KZ" &&
    (i18n.language === "kk" || i18n.language === "ru") &&
    (!upcomingConsultations || upcomingConsultations.length === 0);
  const infoVideoId = i18n.language === "kk" ? "UvC8GaOb0SY" : "RlRj_-HeH0s";

  const handleViewAll = () => {
    if (isTmpUser) {
      handleRegistrationModalOpen();
    } else {
      navigation.push("TabNavigation", { screen: "Consultations" });
    }
  };

  const handleScheduleConsultation = () => {
    if (isTmpUser) {
      handleRegistrationModalOpen();
    } else {
      handleSchedule();
    }
  };

  const onRejectConsultationSuccess = () => {
    showToast({ message: tConsultation("reject_consultation_success") });
  };
  const onRejectConsultationError = (error) => {
    showToast({ message: error, type: "error" });
  };
  const rejectConsultationMutation = useRejectConsultation(
    onRejectConsultationSuccess,
    onRejectConsultationError
  );
  const handleRejectConsultation = (consultationId) => {
    rejectConsultationMutation.mutate(consultationId);
  };

  const handleOpenDetails = (consultation) => {
    navigation.navigate("ActivityHistory", {
      providerId: consultation.providerId,
      consultation,
    });
  };

  const renderConsultation = (consultation, index) => (
    <View
      style={styles.consultationItem}
      key={consultation.consultationId ?? index}
    >
      <Consultation
        consultation={consultation}
        t={tConsultation}
        handleOpenEdit={openEditConsultation}
        handleOpenDetails={handleOpenDetails}
        handleJoinClick={openJoinConsultation}
        handleAcceptConsultation={handleAcceptSuggestion}
        handleRejectConsultation={handleRejectConsultation}
        currencySymbol={currencySymbol}
        overview={false}
        suggested={consultation.status === "suggested"}
        hasPriceBadge
      />
    </View>
  );

  return (
    <Block style={styles.block}>
      <View style={styles.heading}>
        <AppText namedStyle="h3">{t("heading")}</AppText>
        <TouchableOpacity onPress={handleViewAll}>
          <AppText style={styles.viewAllText}>{t("view_all")}</AppText>
        </TouchableOpacity>
      </View>
      {shouldShowVideo && (
        <View style={styles.videoContainer}>
          <YoutubePlayer
            height={VIDEO_HEIGHT}
            play={false}
            videoId={infoVideoId}
          />
        </View>
      )}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Loading size="lg" />
        </View>
      ) : (
        <>
          {upcomingConsultations && upcomingConsultations.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollViewContent}
              style={styles.scrollView}
            >
              {upcomingConsultations
                .slice(0, 3)
                .map((consultation, index) =>
                  renderConsultation(consultation, index)
                )}
            </ScrollView>
          )}
          <View style={styles.buttonContainer}>
            <NewButton
              label={t("schedule_consultation_label")}
              size="lg"
              iconName="calendar"
              isFullWidth
              onPress={handleScheduleConsultation}
            />
          </View>
        </>
      )}
    </Block>
  );
};

const styles = StyleSheet.create({
  block: {
    paddingTop: 40,
  },
  buttonContainer: {
    alignItems: "center",
    justifyItems: "center",
    marginTop: 20,
    paddingBottom: 16,
  },
  consultationItem: {
    paddingTop: 10,
    paddingHorizontal: 6,
    width: appStyles.screenWidth * 0.85,
  },
  scrollView: {
    marginTop: 20,
  },
  scrollViewContent: {
    paddingRight: 16,
  },
  heading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  loadingContainer: {
    alignItems: "center",
    height: 200,
    justifyContent: "center",
    width: "100%",
  },
  videoContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: appStyles.colorBlack_37,
    height: undefined,
    marginTop: 16,
    width: "100%",
  },
  viewAllText: {
    color: appStyles.colorSecondary_9749fa,
    fontFamily: appStyles.fontSemiBold,
  },
});

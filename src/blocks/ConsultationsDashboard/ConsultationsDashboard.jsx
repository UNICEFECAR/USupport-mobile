import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

import {
  Block,
  AppText,
  AppButton,
  Loading,
  CustomCarousel,
  ConsultationBig,
} from "#components";
import { appStyles } from "#styles";

import { useGetTheme } from "#hooks";
import { Context } from "#services";

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
}) => {
  const { isDarkMode } = useGetTheme();
  const { t, i18n } = useTranslation("blocks", {
    keyPrefix: "consultations-dashboard",
  });
  const width = appStyles.screenWidth * 0.96;
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

  const renderCarouselItems = ({ item, index }) => {
    return (
      <ConsultationBig
        consultation={item}
        handleJoin={openJoinConsultation}
        handleChange={openEditConsultation}
        handleAcceptSuggestion={handleAcceptSuggestion}
        handleSchedule={handleSchedule}
        t={t}
        key={index}
      />
    );
  };

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
      ) : !upcomingConsultations || upcomingConsultations.length === 0 ? (
        <View style={styles.buttonContainer}>
          <AppButton
            label={t("schedule_consultation_label")}
            type={isDarkMode ? "primary" : "secondary"}
            size="lg"
            onPress={handleScheduleConsultation}
          />
        </View>
      ) : (
        <View style={styles.carouselContainer}>
          {upcomingConsultations.length > 1 ? (
            <CustomCarousel
              data={upcomingConsultations}
              renderItem={renderCarouselItems}
              width={width}
            />
          ) : (
            <ConsultationBig
              consultation={upcomingConsultations[0]}
              handleJoin={openJoinConsultation}
              handleChange={openEditConsultation}
              handleAcceptSuggestion={handleAcceptSuggestion}
              handleSchedule={handleSchedule}
              t={t}
            />
          )}
        </View>
      )}
    </Block>
  );
};

const styles = StyleSheet.create({
  block: {
    paddingBottom: 100,
    paddingTop: 40,
  },
  buttonContainer: {
    alignItems: "center",
    justifyItems: "center",
    marginTop: 20,
    paddingBottom: 16,
  },
  carouselContainer: { marginTop: 20 },
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

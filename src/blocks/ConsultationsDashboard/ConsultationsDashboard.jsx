import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import {
  Block,
  AppText,
  AppButton,
  Loading,
  CustomCarousel,
  ConsultationBig,
} from "#components";
import { appStyles } from "#styles";

import { userSvc } from "#services";

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
  const { t } = useTranslation("consultations-dashboard");
  const width = appStyles.screenWidth * 0.96;

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
        // key={consultation.consultationId}
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
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Loading size="lg" />
        </View>
      ) : !upcomingConsultations || upcomingConsultations.length === 0 ? (
        <View style={styles.buttonContainer}>
          <AppButton
            label={t("schedule_consultation_label")}
            type="secondary"
            size="lg"
            onPress={handleScheduleConsultation}
          />
        </View>
      ) : (
        <View style={styles.carouselContainer}>
          <CustomCarousel
            data={upcomingConsultations}
            renderItem={renderCarouselItems}
            width={width}
          />
        </View>
      )}
    </Block>
  );
};

const styles = StyleSheet.create({
  block: {
    paddingTop: 40,
    paddingBottom: 100,
  },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewAllText: {
    color: appStyles.colorSecondary_9749fa,
    fontFamily: appStyles.fontSemiBold,
  },
  buttonContainer: {
    justifyItems: "center",
    alignItems: "center",
    marginTop: 20,
    paddingBottom: 16,
  },
  carouselContainer: { marginTop: 20 },
  loadingContainer: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
});

import React from "react";
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

import { useGetTheme } from "#hooks";

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
  const { t } = useTranslation("blocks", {
    keyPrefix: "consultations-dashboard",
  });
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
        key={index}
      />
    );
  };

  return (
    <Block
      style={styles.block}
      heading={t("heading")}
      btnLabel={t("view_all")}
      onPress={handleViewAll}
    >
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
    paddingTop: 40,
    paddingBottom: 100,
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

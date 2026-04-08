import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";

import { AppText, NewButton, Loading, Consultation } from "#components";
import LinearGradient from "../../components/LinearGradient";
import { appStyles } from "#styles";

import { useGetTheme, useRejectConsultation } from "#hooks";
import { showToast } from "#utils";

/**
 * ConsultationsDashboard
 *
 * ConsultationsDashboard block — layout and glass styling aligned with client-ui.
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
  const { colors, isHighContrast } = useGetTheme();
  const { t, i18n } = useTranslation("blocks", {
    keyPrefix: "consultations-dashboard",
  });
  const { t: tConsultation } = useTranslation("blocks", {
    keyPrefix: "consultations",
  });

  const rejectConsultationMutation = useRejectConsultation(
    () => showToast({ message: tConsultation("reject_consultation_success") }),
    (error) => showToast({ message: error, type: "error" })
  );
  const handleRejectConsultation = (consultationId) => {
    rejectConsultationMutation.mutate(consultationId);
  };

  const isLightTheme = colors.background === appStyles.colorWhite_ff;
  const isLoggedIn = !isTmpUser;

  const dummyConsultations = useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const dayAfter = new Date(now);
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(14, 0, 0, 0);

    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 5);
    nextWeek.setHours(11, 0, 0, 0);

    return [
      {
        consultationId: "dummy-1",
        timestamp: tomorrow.getTime(),
        image: "default",
        status: "scheduled",
        providerName: t("dummy_provider_1") || "Dr. Smith",
        price: 0,
      },
      {
        consultationId: "dummy-2",
        timestamp: dayAfter.getTime(),
        image: "default",
        status: "scheduled",
        providerName: t("dummy_provider_2") || "Dr. Johnson",
        price: 0,
      },
      {
        consultationId: "dummy-3",
        timestamp: nextWeek.getTime(),
        image: "default",
        status: "scheduled",
        providerName: t("dummy_provider_3") || "Dr. Williams",
        price: 0,
      },
    ];
  }, [t, i18n.language]);

  const consultationsToShow =
    !isLoggedIn &&
    (!upcomingConsultations || upcomingConsultations.length === 0)
      ? dummyConsultations
      : upcomingConsultations;

  const showFirstSection =
    isLoading ||
    !isLoggedIn ||
    (upcomingConsultations && upcomingConsultations.length > 0);

  const handleOpenDetails = (consultation) => {
    navigation.navigate("ActivityHistory", {
      providerId: consultation.providerId,
      consultation,
    });
  };

  const handleScheduleConsultation = () => {
    if (isTmpUser) {
      handleRegistrationModalOpen();
    } else {
      handleSchedule();
    }
  };

  const handleExploreResources = () => {
    navigation.navigate("TabNavigation", { screen: "InformationalPortal" });
  };

  // Light theme: client-ui liquid-glass, nudged slightly whiter for mobile
  const glassGradient = useMemo(
    () => ({
      degrees: 145,
      locations: [0, 100],
      colors:
        isLightTheme && !isHighContrast
          ? ["rgba(255, 255, 255, 0.99)", "rgba(245, 248, 255, 0.85)"]
          : colors.cardMediaGradient,
    }),
    [isLightTheme, isHighContrast, colors.cardMediaGradient]
  );

  const renderConsultation = (consultation) => {
    const isDummy = String(consultation.consultationId).startsWith("dummy");
    return (
      <View style={styles.consultationItem} key={consultation.consultationId}>
        <Consultation
          consultation={consultation}
          t={tConsultation}
          handleOpenEdit={openEditConsultation}
          handleOpenDetails={handleOpenDetails}
          handleJoinClick={openJoinConsultation}
          handleAcceptConsultation={handleAcceptSuggestion}
          handleRejectConsultation={handleRejectConsultation}
          currencySymbol={currencySymbol}
          overview={isDummy}
          suggested={consultation.status === "suggested"}
          hasPriceBadge
        />
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        gradient={glassGradient}
        style={[
          styles.glassOuter,
          isLightTheme && !isHighContrast
            ? styles.consultationsDashboardShadowLight
            : appStyles.cardMediaShadowDark,
          { borderColor: colors.cardMediaGradientBorder },
        ]}
      >
        {showFirstSection && (
          <View
            style={[
              styles.part,
              styles.partFirst,
              { borderBottomColor: colors.cardMediaSeparator },
            ]}
          >
            <AppText
              namedStyle="h3"
              style={[styles.sectionHeading, { color: colors.text }]}
            >
              {t("heading")}
            </AppText>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Loading size="lg" />
              </View>
            ) : (
              consultationsToShow?.slice(0, 1).map((c) => renderConsultation(c))
            )}
          </View>
        )}

        <View style={styles.part}>
          <AppText
            namedStyle="h3"
            style={[styles.sectionHeading, { color: colors.text }]}
          >
            {t("heading_need_support")}
          </AppText>
          <LinearGradient
            gradient={glassGradient}
            style={[
              styles.needSupportInner,
              { borderColor: colors.cardMediaGradientBorder },
            ]}
          >
            <NewButton
              label={t("schedule_consultation_label")}
              onPress={handleScheduleConsultation}
              iconName="calendar"
              size="lg"
              isFullWidth
            />
            <NewButton
              label={t("explore_resources_label")}
              onPress={handleExploreResources}
              size="lg"
              type="outline"
              isFullWidth
            />
          </LinearGradient>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  // client-ui: box-shadow 0 0.6rem 1rem rgba(95, 108, 145, 0.14)
  consultationsDashboardShadowLight: {
    shadowColor: "rgb(95, 108, 145)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  glassOuter: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  part: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  partFirst: {
    borderBottomWidth: 2,
  },
  sectionHeading: {
    fontFamily: appStyles.fontLight,
    letterSpacing: 0.16,
    marginBottom: 4,
    textAlign: "left",
  },
  consultationItem: {
    paddingTop: 12,
    width: "100%",
  },
  loadingContainer: {
    alignItems: "center",
    height: 200,
    justifyContent: "center",
    width: "100%",
  },
  needSupportInner: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "column",
    gap: 12,
    marginTop: 12,
    padding: 16,
  },
});

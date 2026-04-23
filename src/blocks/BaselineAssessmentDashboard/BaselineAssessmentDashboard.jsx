import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";

import {
  AppText,
  Icon,
  NewButton,
  Loading,
  BaselineAssesmentBox,
} from "#components";
import LinearGradient from "../../components/LinearGradient";
import { HowItWorksBA } from "#modals";
import { useGetLatestBaselineAssessment, useGetTheme } from "#hooks";
import { appStyles } from "#styles";

/**
 * BaselineAssessmentDashboard
 *
 * BaselineAssessmentDashboard block — layout and glass styling aligned with client-ui.
 *
 * @return {jsx}
 */
export const BaselineAssessmentDashboard = ({
  openBaselineAssesmentModal,
  navigation,
  isTmpUser,
}) => {
  const [isHowItWorksBAOpen, setIsHowItWorksBAOpen] = useState(false);

  const { t } = useTranslation("blocks", {
    keyPrefix: "baseline-assessment-dashboard",
  });

  const { colors, isHighContrast } = useGetTheme();
  const isLightTheme = colors.background === appStyles.colorWhite_ff;

  const { data: latestAssessment, isFetching } =
    useGetLatestBaselineAssessment(!isTmpUser);
  const hasCompletedAssessment = latestAssessment?.status === "completed";

  const handleViewAssessment = () => {
    if (latestAssessment) {
      navigation.navigate("BaselineAssesment", {
        baselineAssessmentId: latestAssessment.baselineAssessmentId,
      });
    }
  };

  // Match ConsultationsDashboard liquid-glass (light theme)
  const glassGradient = useMemo(
    () => ({
      degrees: 145,
      locations: [0, 100],
      colors:
        isLightTheme && !isHighContrast
          ? Platform.OS === "android"
            ? ["#ffffff", "#f5f8ff"]
            : ["rgba(255, 255, 255, 0.99)", "rgba(245, 248, 255, 0.85)"]
          : colors.cardMediaGradient,
    }),
    [isLightTheme, isHighContrast, colors.cardMediaGradient]
  );

  const mapBackdropGradient = useMemo(
    () => ({
      degrees: 135,
      locations: [0, 100],
      colors: ["rgba(102, 118, 141, 0.85)", "rgba(74, 85, 104, 0.9)"],
    }),
    []
  );

  const mapOverlayGradient = useMemo(
    () => ({
      degrees: 135,
      locations: [0, 100],
      colors: ["rgba(106, 79, 251, 0.25)", "rgba(102, 118, 141, 0.4)"],
    }),
    []
  );

  const renderAssessmentContent = () => {
    if (isFetching) {
      return (
        <View style={styles.loadingInner}>
          <Loading size="lg" />
        </View>
      );
    }

    if (!latestAssessment) {
      return (
        <LinearGradient
          gradient={glassGradient}
          style={[
            styles.innerGlass,
            { borderColor: colors.cardMediaGradientBorder },
          ]}
        >
          <View style={styles.iconCircle}>
            <Icon name="document" size="lg" color="#6a4ffb" />
          </View>
          <AppText namedStyle="smallText" style={styles.descriptionCenter}>
            {t("no_assessment_description")}
          </AppText>
          <NewButton
            size="lg"
            onPress={openBaselineAssesmentModal}
            isFullWidth
            label={t("start_new_assessment")}
          />
        </LinearGradient>
      );
    }

    if (latestAssessment.status === "completed") {
      return (
        <LinearGradient
          gradient={glassGradient}
          style={[
            styles.innerGlass,
            { borderColor: colors.cardMediaGradientBorder },
          ]}
        >
          <View style={styles.resultsRow}>
            <View style={styles.resultsItem}>
              <AppText style={styles.resultsLabel}>
                {t("psychological")}
              </AppText>
              <AppText namedStyle="h4" style={styles.resultsValue}>
                {latestAssessment.finalResult.psychologicalScore}
              </AppText>
            </View>
            <View style={styles.resultsItem}>
              <AppText style={styles.resultsLabel}>{t("social")}</AppText>
              <AppText namedStyle="h4" style={styles.resultsValue}>
                {latestAssessment.finalResult.socialScore}
              </AppText>
            </View>
            <View style={styles.resultsItem}>
              <AppText style={styles.resultsLabel}>{t("biological")}</AppText>
              <AppText namedStyle="h4" style={styles.resultsValue}>
                {latestAssessment.finalResult.biologicalScore}
              </AppText>
            </View>
          </View>
          <View style={styles.completedButtons}>
            <NewButton
              size="lg"
              onPress={openBaselineAssesmentModal}
              isFullWidth
              label={t("start_new_assessment")}
            />
            <NewButton
              size="lg"
              type="white"
              onPress={handleViewAssessment}
              isFullWidth
              label={t("see_last_result")}
            />
          </View>
        </LinearGradient>
      );
    }

    return (
      <BaselineAssesmentBox
        progress={latestAssessment.completionPercentage}
        status={latestAssessment.status}
        startedAt={latestAssessment.startedAt}
        currentPosition={latestAssessment.currentPosition}
        completionPercentage={latestAssessment.completionPercentage}
        handleViewAssessment={handleViewAssessment}
        t={t}
      />
    );
  };

  return (
    <React.Fragment>
      <HowItWorksBA
        isOpen={isHowItWorksBAOpen}
        onClose={() => setIsHowItWorksBAOpen(false)}
      />
      <View style={styles.root}>
        <LinearGradient
          gradient={glassGradient}
          style={[
            styles.glassOuter,
            isLightTheme && !isHighContrast
              ? styles.liquidGlassShadowLight
              : appStyles.cardMediaShadowDark,
            { borderColor: colors.cardMediaGradientBorder },
          ]}
        >
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
              {t("explore_heading")}
            </AppText>
            <View style={styles.mapContainer}>
              <LinearGradient
                gradient={mapBackdropGradient}
                style={StyleSheet.absoluteFillObject}
              />
              <LinearGradient
                gradient={mapOverlayGradient}
                style={StyleSheet.absoluteFillObject}
              />
              <LinearGradient
                gradient={glassGradient}
                style={[
                  styles.exploreCard,
                  { borderColor: colors.cardMediaGradientBorder },
                ]}
              >
                <View style={styles.iconCircle}>
                  <Icon name="location" size="lg" color="#6a4ffb" />
                </View>
                <AppText
                  namedStyle="smallText"
                  style={[styles.exploreDescription, ,]}
                >
                  {t("explore_card_description")}
                </AppText>
                <NewButton
                  label={t("explore_button_label")}
                  onPress={() => navigation.navigate("Organizations")}
                  size="lg"
                  isFullWidth
                />
              </LinearGradient>
            </View>
          </View>

          <View style={styles.part}>
            <View style={styles.assessmentHeader}>
              <AppText
                namedStyle="h3"
                style={[
                  styles.sectionHeading,
                  styles.headerTitle,
                  { color: colors.text },
                ]}
              >
                {hasCompletedAssessment ? t("heading_completed") : t("heading")}
              </AppText>
              <TouchableOpacity
                onPress={() => setIsHowItWorksBAOpen(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppText
                  style={[
                    styles.howItWorksLink,
                    { color: appStyles.colorSecondary_9749fa },
                  ]}
                >
                  {t("how_it_works")}
                </AppText>
              </TouchableOpacity>
            </View>
            {renderAssessmentContent()}
          </View>
        </LinearGradient>
      </View>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  root: {
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  // Same as ConsultationsDashboard (client-ui liquid-glass shadow)
  liquidGlassShadowLight: {
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
  headerTitle: {
    flex: 1,
    marginRight: 12,
    marginBottom: 0,
  },
  mapContainer: {
    borderRadius: 16,
    marginTop: 12,
    minHeight: 200,
    overflow: "hidden",
    position: "relative",
    width: "100%",
  },
  exploreCard: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 24,
    borderWidth: 1,
    marginVertical: 24,
    maxWidth: 320,
    overflow: "hidden",
    padding: 24,
    width: "100%",
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
    }),
  },
  exploreDescription: {
    marginBottom: 16,
    textAlign: "center",
  },
  assessmentHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    width: "100%",
  },
  howItWorksLink: {
    fontFamily: appStyles.fontSemiBold,
    fontSize: 14,
  },
  iconCircle: {
    alignItems: "center",
    backgroundColor: "rgba(106, 79, 251, 0.12)",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    marginBottom: 12,
    width: 56,
  },
  innerGlass: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "column",
    gap: 12,
    marginTop: 12,
    padding: 16,
    width: "100%",
  },
  descriptionCenter: {
    marginBottom: 4,
    textAlign: "center",
  },
  loadingInner: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    minHeight: 120,
    width: "100%",
  },
  resultsRow: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 16,
    width: "100%",
  },
  resultsItem: {
    alignItems: "center",
    backgroundColor: "rgba(106, 79, 251, 0.08)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "100%",
  },
  resultsLabel: {
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  resultsValue: {
    color: appStyles.colorSecondary_9749fa,
    margin: 0,
  },
  completedButtons: {
    gap: 12,
    marginTop: 4,
    width: "100%",
  },
});

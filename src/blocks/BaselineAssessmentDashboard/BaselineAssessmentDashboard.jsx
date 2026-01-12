import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import React, { useState } from "react";

import {
  AppButton,
  AppText,
  Block,
  Box,
  BaselineAssesmentBox,
  Loading,
} from "#components";
import { HowItWorksBA } from "#modals";
import { useGetLatestBaselineAssessment } from "#hooks";
import { appStyles } from "#styles";
/**
 * BaselineAssessmentDashboard
 *
 * BaselineAssessmentDashboard Block
 *
 * @return {jsx}
 */
export const BaselineAssessmentDashboard = ({
  openBaselineAssesmentModal,
  navigation,
}) => {
  const { t } = useTranslation("blocks", {
    keyPrefix: "baseline-assessment-dashboard",
  });

  const [isHowItWorksBAOpen, setIsHowItWorksBAOpen] = useState(false);

  const { data: latestAssessment, isLoading } =
    useGetLatestBaselineAssessment();
  const hasCompletedAssessment = latestAssessment?.status === "completed";

  const handleViewAssessment = () => {
    if (!hasCompletedAssessment) () => setIsHowItWorksBAOpen(true);
    else
      navigation.navigate("BaselineAssesment", {
        baselineAssessmentId: latestAssessment.baselineAssessmentId,
      });
  };

  return (
    <React.Fragment>
      <HowItWorksBA
        isOpen={isHowItWorksBAOpen}
        onClose={() => setIsHowItWorksBAOpen(false)}
      />
      <Block style={{ marginTop: 40 }}>
        <View>
          <View style={styles.heading}>
            <AppText t namedStyle="h3">
              {t("heading")}
            </AppText>
            <TouchableOpacity onPress={handleViewAssessment}>
              {hasCompletedAssessment ? (
                <AppText style={styles.headingButton}>
                  {t("see_last_result")}
                </AppText>
              ) : (
                <AppText style={styles.headingButton}>
                  {t("how_it_works")}
                </AppText>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: "center" }}>
            {isLoading ? (
              <Loading style={{ marginTop: 24 }} />
            ) : !latestAssessment ? (
              <AppButton
                style={{ marginTop: 24 }}
                size="lg"
                onPress={openBaselineAssesmentModal}
                label={t("start_new_assessment")}
              />
            ) : latestAssessment.status === "completed" ? (
              <View style={styles.resultContainer}>
                <AppText namedStyle="h4" isSemibold>
                  {t("latest_result")}
                </AppText>
                <Box boxShadow={2} style={styles.resultBox}>
                  <AppText style={{ textAlign: "center" }}>
                    {t("psychological")}:{" "}
                    {latestAssessment.finalResult.psychologicalScore}
                  </AppText>
                </Box>
                <Box boxShadow={2} style={styles.resultBox}>
                  <AppText style={{ textAlign: "center" }}>
                    {t("biological")}:{" "}
                    {latestAssessment.finalResult.biologicalScore}
                  </AppText>
                </Box>
                <Box boxShadow={2} style={styles.resultBox}>
                  <AppText style={{ textAlign: "center" }}>
                    {t("social")}: {latestAssessment.finalResult.socialScore}
                  </AppText>
                </Box>
                <AppButton
                  style={{ marginTop: 24 }}
                  size="lg"
                  onPress={openBaselineAssesmentModal}
                  label={t("start_new_assessment")}
                />
              </View>
            ) : (
              <BaselineAssesmentBox
                progress={latestAssessment.completionPercentage}
                status={latestAssessment.status}
                startedAt={latestAssessment.startedAt}
                currentPosition={latestAssessment.currentPosition}
                completionPercentage={latestAssessment.completionPercentage}
                handleViewAssessment={handleViewAssessment}
                t={t}
              />
            )}
          </View>
        </View>
      </Block>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  headingButton: {
    color: appStyles.colorSecondary_9749fa,
    fontFamily: appStyles.fontSemiBold,
  },
  heading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  resultContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
    width: "100%",
  },
  resultBox: {
    minWidth: "90%",
    marginTop: 20,
    padding: 12,
  },
});

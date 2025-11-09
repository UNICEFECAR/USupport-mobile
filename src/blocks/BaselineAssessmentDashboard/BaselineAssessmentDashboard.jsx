import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import {
  AppButton,
  AppText,
  Block,
  Box,
  BaselineAssesmentBox,
  Loading,
} from "#components";

import { useGetLatestBaselineAssessment } from "#hooks";

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

  const { data: latestAssessment, isLoading } =
    useGetLatestBaselineAssessment();

  const handleViewAssessment = () => {
    if (latestAssessment) {
      navigation.navigate("BaselineAssesment", {
        baselineAssessmentId: latestAssessment.baselineAssessmentId,
      });
    }
  };

  return (
    <Block style={{ marginTop: 40 }}>
      <View>
        <AppText namedStyle="h3">{t("heading")}</AppText>

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
  );
};

const styles = StyleSheet.create({
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

import { View } from "react-native";
import { useTranslation } from "react-i18next";

import {
  Block,
  AppButton,
  Loading,
  BaselineAssesmentBox,
  AppText,
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
          ) : !latestAssessment || latestAssessment.status === "completed" ? (
            <AppButton
              style={{ marginTop: 24 }}
              size="lg"
              onPress={openBaselineAssesmentModal}
              label={t("start_new_assessment")}
            />
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

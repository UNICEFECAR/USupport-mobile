import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { BaselineAssesment as BaselineAssesmentBlock } from "#blocks";
import { useGetBaselineAssessments } from "#hooks";

import { Loading, Screen } from "#components";

/**
 * BaselineAssesment
 *
 * Baseline assesment test page
 *
 * @returns {JSX.Element}
 */
export const BaselineAssesment = ({ navigation, route }) => {
  const { t } = useTranslation("baseline-assesment-page");
  const { data: baselineAssessments, isLoading } = useGetBaselineAssessments();
  const { baselineAssessmentId } = route.params;

  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [hasStartedAssessment, setHasStartedAssessment] = useState(false);

  useEffect(() => {
    if (baselineAssessmentId && baselineAssessments) {
      const assessment = baselineAssessments.find(
        (assessment) => assessment.baselineAssessmentId === baselineAssessmentId
      );
      if (assessment) {
        setSelectedAssessment(assessment);
        setHasStartedAssessment(true);
      }
    }
  }, [baselineAssessmentId, baselineAssessments]);

  // Separate assessments by status
  const { inProgressAssessment, completedAssessments } = useMemo(() => {
    if (!baselineAssessments) {
      return { inProgressAssessment: null, completedAssessments: [] };
    }

    const inProgress = baselineAssessments.find(
      (assessment) => assessment.status === "in_progress"
    );
    const completed = baselineAssessments.filter(
      (assessment) => assessment.status === "completed"
    );

    return {
      inProgressAssessment: inProgress || null,
      completedAssessments: completed,
    };
  }, [baselineAssessments]);

  return (
    <Screen hasHeaderNavigation={false} t={t}>
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Loading />
        </View>
      ) : (
        <BaselineAssesmentBlock
          selectedAssessment={selectedAssessment}
          setSelectedAssessment={setSelectedAssessment}
          setHasStartedAssessment={setHasStartedAssessment}
          inProgressAssessment={inProgressAssessment}
          navigation={navigation}
        />
      )}

      {/* Only show assessment list if no assessment is selected and no new assessment started */}
      {!selectedAssessment && !hasStartedAssessment && (
        <View className="page__baseline-assesment__sessions">
          {/* Show in-progress assessment first if it exists */}
          {/* {inProgressAssessment && (
            <div className="page__baseline-assesment__sessions__in-progress">
              <h3>{t("continue_assessment")}</h3>
              <BaselineAssesmentBox
                key={inProgressAssessment.baselineAssessmentId}
                progress={inProgressAssessment.completionPercentage}
                status={inProgressAssessment.status}
                startedAt={inProgressAssessment.startedAt}
                currentPosition={inProgressAssessment.currentPosition - 1}
                completionPercentage={inProgressAssessment.completionPercentage}
                handleViewAssessment={() => setSelectedAssessment(inProgressAssessment)}
                t={t}
              />
            </div>
          )} */}

          {/* Show completed assessments if there are any */}
          {/* {completedAssessments.length > 0 && (
            <View className="page__baseline-assesment__sessions__completed">
              <AppText>{t("completed_assessments")}</AppText>
              {completedAssessments.map((assessment) => (
                <BaselineAssesmentBox
                  key={assessment.baselineAssessmentId}
                  progress={
                    assessment.status === "completed"
                      ? 100
                      : assessment.completionPercentage
                  }
                  status={assessment.status}
                  startedAt={assessment.startedAt}
                  currentPosition={
                    assessment.status === "completed"
                      ? assessment.currentPosition
                      : assessment.currentPosition - 1
                  }
                  completionPercentage={assessment.completionPercentage}
                  handleViewAssessment={() => setSelectedAssessment(assessment)}
                  t={t}
                />
              ))}
            </View>
          )} */}
        </View>
      )}
    </Screen>
  );
};

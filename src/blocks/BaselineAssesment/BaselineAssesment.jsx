import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

import {
  ProgressBar,
  AppText,
  RadioButtonSelector,
  NewButton,
  Block,
  Icon,
} from "#components";
import {
  useGetBaselineAssessmentQuestions,
  useGetClientAnswersForBaselineAssessmentById,
  useAddBaselineAssessmentAnswer,
  useCreateBaselineAssessment,
  useGetTheme,
} from "#hooks";
import { appStyles } from "#styles";

import { BaselineAssesmentResult } from "../BaselineAssesmentResult";

export const BaselineAssesment = ({
  selectedAssessment,
  inProgressAssessment,
  setHasStartedAssessment,
  navigation,
}) => {
  const { t } = useTranslation("blocks", {
    keyPrefix: "baseline-assesment",
  });
  const { t: tScreen } = useTranslation("screens", { keyPrefix: "screen" });
  const { colors, isDarkMode, isHighContrast } = useGetTheme();
  const queryClient = useQueryClient();
  const [hasSetInitially, setHasSetInitially] = useState(false);

  const [state, setState] = useState({
    currentStep: "intro", // intro, questions, completed
    currentQuestionIndex: 0,
    answers: {},
    baselineAssessmentId: null,
    isNewAssessment: false,
    finalResult: null,
  });

  const { data: questions } = useGetBaselineAssessmentQuestions();

  const {
    isFetching: isFetchingAnswers,
    data: answers,
    error: answersError,
  } = useGetClientAnswersForBaselineAssessmentById(
    selectedAssessment?.baselineAssessmentId,
    !state.isNewAssessment
  );

  useEffect(() => {
    if (answers && selectedAssessment && !hasSetInitially) {
      setState((prev) => ({
        ...prev,
        answers,
        baselineAssessmentId: selectedAssessment.baselineAssessmentId,
        currentQuestionIndex: selectedAssessment.currentPosition - 1,
        currentStep:
          selectedAssessment.status === "completed" ? "completed" : "questions",
        finalResult: selectedAssessment.finalResult,
      }));
      setHasSetInitially(true);
    }
  }, [answers, selectedAssessment, hasSetInitially]);

  const addBaselineAssessmentAnswerMutation = useAddBaselineAssessmentAnswer();
  const createBaselineAssessmentMutation = useCreateBaselineAssessment();

  const currentQuestion = questions?.[state.currentQuestionIndex];
  const progress = questions?.length
    ? ((state.currentQuestionIndex + 1) / questions.length) * 100
    : 0;
  const answeredProgress = questions?.length
    ? (state.currentQuestionIndex / questions.length) * 100
    : 0;

  // Check if user can start a new assessment
  const canStartNewAssessment = !inProgressAssessment;

  const canContinue =
    currentQuestion && state.answers[currentQuestion.questionId];
  const isLastQuestion = state.currentQuestionIndex === questions?.length - 1;

  // Start the assessment
  const handleStartAssessment = () => {
    if (!canStartNewAssessment) {
      // toast.error("You have an assessment in progress. Please complete it before starting a new one.");
      return;
    }

    createBaselineAssessmentMutation.mutate(undefined, {
      onSuccess: (assessmentData) => {
        setState((prev) => ({
          ...prev,
          currentStep: "questions",
          baselineAssessmentId: assessmentData.baselineAssessmentId,
          isNewAssessment: true,
        }));
        setHasStartedAssessment?.(true);
      },
      onError: (error) => {
        // toast.error("Error creating assessment. Please try again.");
        console.error("Failed to create baseline assessment:", error);
      },
    });
  };

  // Navigate to next question
  const handleNext = useCallback(
    (providedAnswerValue = null) => {
      if (!currentQuestion) return;

      const questionId = currentQuestion.questionId;
      const answerValue = providedAnswerValue ?? state.answers[questionId];

      if (!answerValue) return;

      const currentAnswer = answers ? answers[questionId] : null;

      if (
        answers &&
        currentAnswer &&
        currentAnswer === answerValue &&
        !isLastQuestion
      ) {
        console.log("same answer");
        setState((prev) => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
        }));
        return;
      }

      // Submit answer to API first
      addBaselineAssessmentAnswerMutation.mutate(
        {
          questionId,
          answerValue,
          baselineAssessmentId: state.baselineAssessmentId,
          currentPosition: state.currentQuestionIndex + 1,
        },
        {
          onSuccess: (data) => {
            setState((prev) => {
              // Update session ID if we got one back
              const updatedState = { ...prev };
              if (data.baselineAssessmentId && !prev.baselineAssessmentId) {
                updatedState.baselineAssessmentId = data.baselineAssessmentId;
              }

              // Navigate after successful submission
              if (prev.currentQuestionIndex < questions.length - 1) {
                updatedState.currentQuestionIndex =
                  prev.currentQuestionIndex + 1;
              } else {
                // Assessment completed
                updatedState.currentStep = "completed";
                updatedState.finalResult = data.finalResult;
              }
              return updatedState;
            });
            queryClient.invalidateQueries({
              queryKey: ["baseline-assessments"],
            });
            queryClient.invalidateQueries({
              queryKey: ["latest-baseline-assessment"],
            });
          },
          onError: (error) => {
            // toast.error("Error submitting answer. Please try again.");
            // Remove the answer from local state if submission failed
            setState((prev) => {
              const newAnswers = { ...prev.answers };
              delete newAnswers[questionId];
              return { ...prev, answers: newAnswers };
            });
          },
        }
      );
    },
    [
      currentQuestion,
      state.answers,
      state.baselineAssessmentId,
      state.currentQuestionIndex,
      answers,
      isLastQuestion,
      questions,
      addBaselineAssessmentAnswerMutation,
      queryClient,
    ]
  );

  // Handle answer selection
  const handleAnswerSelect = useCallback(
    (answerValue) => {
      if (!currentQuestion) return;

      const questionId = currentQuestion.questionId;

      // Update state first
      setState((prev) => ({
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: answerValue,
        },
      }));

      // Automatically proceed to next question after selecting an answer
      // Use setTimeout to ensure state update is processed first
      setTimeout(() => {
        handleNext(answerValue);
      }, 0);
    },
    [currentQuestion, handleNext]
  );

  // Navigate to previous question
  const handleBack = () => {
    if (state.currentQuestionIndex > 0) {
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
    }
  };

  // Render rating scale (1-5)
  const renderRatingScale = () => {
    const currentAnswer = currentQuestion
      ? state.answers[currentQuestion.questionId]
      : null;

    const ratingOptions = [
      { value: 1, label: "1. Strongly Disagree" },
      { value: 2, label: "2. Disagree" },
      { value: 3, label: "3. Neutral" },
      { value: 4, label: "4. Agree" },
      { value: 5, label: "5. Strongly Agree" },
    ];

    return (
      <View style={styles.ratingScale}>
        {ratingOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.ratingOption}
            onPress={() => handleAnswerSelect(option.value)}
            disabled={addBaselineAssessmentAnswerMutation.isLoading}
          >
            <RadioButtonSelector
              isChecked={currentAnswer === option.value}
              setIsChecked={() => handleAnswerSelect(option.value)}
              disabled={addBaselineAssessmentAnswerMutation.isLoading}
              label={option.label}
              style={[
                styles.radioButton,
                currentAnswer === option.value && styles.radioButtonSelected,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleRedirectToDashboard = () => {
    queryClient.invalidateQueries({
      queryKey: ["baseline-assessments"],
    });
    queryClient.invalidateQueries({
      queryKey: ["latest-baseline-assessment"],
    });
    navigation.navigate("Dashboard");
  };

  const handleGoBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    handleRedirectToDashboard();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Block>
        <View style={styles.grid}>
          {/* Questions Step */}
          {state.currentStep === "questions" && currentQuestion && (
            <>
              <View style={styles.progressContainer}>
                <TouchableOpacity
                  onPress={handleGoBack}
                  style={styles.goBackRow}
                  hitSlop={appStyles.hitSlop}
                >
                  <Icon
                    style={styles.goBackIcon}
                    name="arrow-chevron-back"
                    color={
                      isHighContrast ? "#fff" : appStyles.colorPrimary_20809e
                    }
                  />
                  <AppText namedStyle="text" isBold style={styles.goBackText}>
                    {tScreen("go_back")}
                  </AppText>
                </TouchableOpacity>
                <AppText namedStyle="h3" style={styles.instructionsTitle}>
                  {t("instructions")}
                </AppText>

                <View style={styles.progressInfo}>
                  <AppText
                    namedStyle="smallText"
                    style={[
                      styles.progressText,
                      { color: isDarkMode ? "#c1d7e0" : "#92989b" },
                    ]}
                  >
                    {t("question", {
                      number: state.currentQuestionIndex + 1,
                      total: questions.length,
                    })}
                  </AppText>
                  <AppText
                    namedStyle="smallText"
                    style={[
                      styles.progressText,
                      { color: isDarkMode ? "#c1d7e0" : "#92989b" },
                    ]}
                  >
                    {t("completed", {
                      percentage: Math.round(answeredProgress),
                    })}
                  </AppText>
                </View>
                <ProgressBar
                  progress={progress}
                  height="md"
                  style={styles.progressBar}
                />
              </View>

              {/* Question */}
              <View style={styles.questionContainer}>
                <View style={styles.questionContent}>
                  <AppText namedStyle="h3" style={styles.questionText}>
                    {t(currentQuestion.questionText)}
                  </AppText>
                </View>
              </View>

              {/* Rating Scale */}
              <View style={styles.ratingContainer}>{renderRatingScale()}</View>

              {/* Navigation */}
              <View style={styles.navigation}>
                <View style={styles.navigationButtons}>
                  <NewButton
                    disabled={state.currentQuestionIndex === 0}
                    label={t("back")}
                    type="outline"
                    size="lg"
                    onPress={handleBack}
                    style={styles.navButton}
                  />
                </View>
                <NewButton
                  label={t("save")}
                  size="lg"
                  onPress={handleRedirectToDashboard}
                  variant="secondary"
                  iconName="save"
                  isFullWidth
                  style={{ alignSelf: "center", marginTop: 16 }}
                />
              </View>
            </>
          )}

          {/* Completed Step */}
        </View>
      </Block>
      {state.currentStep === "completed" && state.finalResult && (
        <BaselineAssesmentResult
          redirectToDashboard={handleRedirectToDashboard}
          result={state.finalResult}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  grid: {
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 640,
    alignSelf: "center",
    width: "100%",
  },

  intro: {
    alignItems: "center",
    marginBottom: 32,
    width: "100%",
  },
  title: {
    marginBottom: 24,
    textAlign: "center",
  },
  description: {
    marginBottom: 24,
    maxWidth: 480,
    textAlign: "center",
    lineHeight: 24,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
    marginTop: 24,
  },
  statText: {
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 480,
  },

  progressContainer: {
    marginBottom: 16,
    width: "100%",
    maxWidth: 720,
  },
  goBackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  goBackIcon: {
    marginRight: 8,
  },
  goBackText: {
    textTransform: "none",
  },
  instructionsTitle: {
    textAlign: "center",
    marginBottom: 12,
    marginTop: 12,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  progressText: {
    textAlign: "center",
  },
  progressBar: {
    marginBottom: 12,
  },

  questionContainer: {
    marginBottom: 12,
    width: "100%",
  },
  questionContent: {
    maxWidth: 480,
    width: "97%",
    alignSelf: "center",
  },
  questionText: {
    marginBottom: 12,
    lineHeight: 26,
    textAlign: "left",
  },

  ratingContainer: {
    marginBottom: 20,
    width: "100%",
  },
  ratingScale: {
    gap: 12,
    width: "100%",
    alignSelf: "center",
  },
  ratingOption: {
    alignItems: "center",
    width: "100%",
  },
  radioButton: {
    width: "100%",
  },
  radioButtonSelected: {
    borderWidth: 1,
    borderColor: "#9749fa",
  },

  // Navigation section
  navigation: {
    width: "100%",
    paddingBottom: 32,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
    maxWidth: 480, // 48rem equivalent
    alignSelf: "center",
  },
  navButton: {
    flex: 1,
    minWidth: 120, // 12rem equivalent
  },

  // Responsive adjustments for mobile
  "@media (max-width: 768)": {
    navigationButtons: {
      flexDirection: "column",
      gap: 16,
    },
    navButton: {
      minWidth: "auto",
    },
  },
});

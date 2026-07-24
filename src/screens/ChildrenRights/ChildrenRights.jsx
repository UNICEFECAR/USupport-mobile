import React, { useState, useCallback, useMemo, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useTranslation, Trans } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { FlashList } from "@shopify/flash-list";

import {
  Block,
  NewButton,
  RadioButtonSelector,
  CheckBox,
  Loading,
  AppText,
  Box,
  Screen,
  CardMedia,
} from "#components";

import { useGetOrganizationMetadata, useGetTheme } from "#hooks";
import { appStyles } from "#styles";
import { cmsSvc } from "#services";
import { destructureArticleData } from "#utils";

// Screen definitions with all navigation logic
// For dynamic screens, use metadataField instead of answers
const SCREENS = {
  // ==================== NON-EMERGENCY FLOW ====================
  "non-emergency": {
    type: "question",
    inputType: "single",
    titleKey: "non_emergency_title",
    paragraphKey: "non_emergency_paragraph",
    questionKey: "non_emergency_question",
    answers: [
      {
        id: "new",
        labelKey: "non_emergency_answer_1",
        nextScreen: "untitled-q1",
      },
      {
        id: "recurring-no-pro",
        labelKey: "non_emergency_answer_2",
        nextScreen: "untitled-q1",
      },
      {
        id: "recurring-pro",
        labelKey: "non_emergency_answer_3",
        nextScreen: "final-q1",
      },
    ],
  },

  // Untitled Section - 5 questions (uses metadata for answers)
  "untitled-q1": {
    type: "form-question",
    inputType: "multi",
    questionKey: "untitled_q1_question",
    formField: "specialisation",
    filterSpecialisations: [
      // Show only some specialisations for this section
      "pediatric_psychiatry",
      "psychological_evaluation",
      "psychological_counseling",
      "individual_psychotherapy",
    ],
    metadataField: "specialisations", // Dynamic from metadata
    metadataIdField: "organizationSpecialisationId",
    nextScreen: "untitled-q2",
  },
  "untitled-q2": {
    type: "form-question",
    inputType: "single",
    questionKey: "untitled_q2_question",
    formField: "district",
    metadataField: "districts", // Dynamic from metadata
    metadataIdField: "districtId",
    nextScreen: "untitled-q3",
  },
  "untitled-q3": {
    type: "form-question",
    inputType: "single",
    questionKey: "untitled_q3_question",
    formField: "propertyType",
    metadataField: "propertyTypes", // Dynamic from metadata
    metadataIdField: "organizationPropertyTypeId",
    nextScreen: "untitled-q4",
  },
  "untitled-q4": {
    type: "form-question",
    inputType: "single",
    questionKey: "untitled_q4_question",
    formField: "paymentMethod",
    metadataField: "paymentMethods", // Dynamic from metadata
    metadataIdField: "paymentMethodId",
    nextScreen: "untitled-q5",
  },
  "untitled-q5": {
    type: "form-question",
    inputType: "single",
    questionKey: "untitled_q5_question",
    formField: "userInteraction",
    metadataField: "userInteractions", // Dynamic from metadata
    metadataIdField: "userInteractionId",
    nextScreen: "submit-untitled",
    isLastFormQuestion: true,
  },

  // Final Section - 4 questions (uses metadata for answers)
  "final-q1": {
    type: "form-question",
    inputType: "multi",
    questionKey: "final_q1_question",
    formField: "specialisations",
    metadataField: "specialisations", // Dynamic from metadata - all specialisations
    metadataIdField: "organizationSpecialisationId",
    nextScreen: "final-q2",
  },
  "final-q2": {
    type: "form-question",
    inputType: "single",
    questionKey: "final_q2_question",
    formField: "district",
    metadataField: "districts", // Dynamic from metadata
    metadataIdField: "districtId",
    nextScreen: "final-q3",
  },
  "final-q3": {
    type: "form-question",
    inputType: "single",
    questionKey: "final_q3_question",
    formField: "propertyType",
    metadataField: "propertyTypes", // Dynamic from metadata
    metadataIdField: "organizationPropertyTypeId",
    nextScreen: "final-q4",
  },
  "final-q4": {
    type: "form-question",
    inputType: "single",
    questionKey: "final_q4_question",
    formField: "paymentMethod",
    metadataField: "paymentMethods", // Dynamic from metadata
    metadataIdField: "paymentMethodId",
    nextScreen: "submit-final",
    isLastFormQuestion: true,
  },

  // ==================== RIGHTS FLOW ====================
  "rights-intro": {
    type: "question",
    inputType: "single",
    titleKey: "rights_intro_title",
    paragraphKey: "rights_intro_paragraph",
    questionKey: "rights_intro_question",
    answers: [
      {
        id: "schools",
        labelKey: "rights_intro_answer_1",
        nextScreen: "section-2",
      },
      {
        id: "social_care",
        labelKey: "rights_intro_answer_2",
        nextScreen: "section-8",
      },
      {
        id: "health_system",
        labelKey: "rights_intro_answer_3",
        nextScreen: "section-11",
      },
    ],
  },

  // Section 2 - Services provided in schools
  "section-2": {
    type: "question",
    inputType: "single",
    titleKey: "section_2_title",
    questionKey: "section_2_question",
    answers: [
      {
        id: "all_students",
        labelKey: "section_2_answer_1",
        nextScreen: "section-3",
      },
      {
        id: "sen_students",
        labelKey: "section_2_answer_2",
        nextScreen: "section-4",
      },
      {
        id: "pregnant_students",
        labelKey: "section_2_answer_3",
        nextScreen: "section-5",
      },
      {
        id: "violence_victims",
        labelKey: "section_2_answer_4",
        nextScreen: "section-6",
      },
      {
        id: "disciplined_students",
        labelKey: "section_2_answer_5",
        nextScreen: "section-7",
      },
    ],
  },

  // Section 3 - Services for all students (Content)
  "section-3": {
    type: "content",
    titleKey: "section_3_title",
    paragraphKey: "section_3_paragraph",
    sectionNumber: 3,
  },

  // Section 4 - Services for SEN students (Content)
  "section-4": {
    type: "content",
    titleKey: "section_4_title",
    paragraphKey: "section_4_paragraph",
    sectionNumber: 4,
  },

  // Section 5 - Services for pregnant students (Content)
  "section-5": {
    type: "content",
    titleKey: "section_5_title",
    paragraphKey: "section_5_paragraph",
    sectionNumber: 3,
  },

  // Section 6 - Services for violence victims (Content)
  "section-6": {
    type: "content",
    titleKey: "section_6_title",
    paragraphKey: "section_6_paragraph",
    sectionNumber: 6,
  },

  // Section 7 - Disciplined students (Content)
  "section-7": {
    type: "content",
    titleKey: "section_7_title",
    paragraphKey: "section_7_paragraph",
    sectionNumber: 7,
  },

  // Section 8 - Services in social care system
  "section-8": {
    type: "question",
    inputType: "single",
    titleKey: "section_8_title",
    questionKey: "section_8_question",
    answers: [
      {
        id: "violence_by_parents",
        labelKey: "section_8_answer_1",
        nextScreen: "section-9",
      },
      {
        id: "day_care_centers",
        labelKey: "section_8_answer_2",
        nextScreen: "section-10",
      },
      {
        id: "residential_centers",
        labelKey: "section_8_answer_3",
        nextScreen: "section-10",
      },
      {
        id: "emergency_reception",
        labelKey: "section_8_answer_4",
        nextScreen: "section-10",
      },
      {
        id: "night_shelters",
        labelKey: "section_8_answer_5",
        nextScreen: "section-10",
      },
    ],
  },

  // Section 9 - Violence by parents (Content)
  "section-9": {
    type: "content",
    titleKey: "section_9_title",
    paragraphKey: "section_9_paragraph",
    sectionNumber: 9,
  },

  // Section 10 - Social care centers (Content)
  "section-10": {
    type: "content",
    titleKey: "section_10_title",
    paragraphKey: "section_10_paragraph",
    sectionNumber: 10,
  },

  // Section 11 - Services in health system
  "section-11": {
    type: "question",
    inputType: "single",
    titleKey: "section_11_title",
    questionKey: "section_11_question",
    answers: [
      {
        id: "children_0_18",
        labelKey: "section_11_answer_1",
        nextScreen: "section-12",
      },
      {
        id: "various_conditions",
        labelKey: "section_11_answer_2",
        nextScreen: "section-13",
      },
      {
        id: "mental_disorders",
        labelKey: "section_11_answer_3",
        nextScreen: "section-14",
      },
    ],
  },

  // Section 12 - Children 0-18 services (Content)
  "section-12": {
    type: "content",
    titleKey: "section_12_title",
    paragraphKey: "section_12_paragraph",
    sectionNumber: 12,
  },

  // Section 13 - Various conditions (Content)
  "section-13": {
    type: "content",
    titleKey: "section_13_title",
    paragraphKey: "section_13_paragraph",
    sectionNumber: 13,
  },

  // Section 14 - Mental disorders (Content)
  "section-14": {
    type: "content",
    titleKey: "section_14_title",
    paragraphKey: "section_14_paragraph",
    sectionNumber: 14,
  },
};

/**
 * ChildrenRights
 *
 * Multi-screen flow for children's rights and non-emergency situations
 *
 * @returns {JSX.Element}
 */
export const ChildrenRights = ({ route }) => {
  const { t, i18n } = useTranslation("screens", {
    keyPrefix: "children-rights-screen",
  });
  const { t: tOrg } = useTranslation("blocks", { keyPrefix: "organizations" });
  const navigation = useNavigation();
  const { colors, isDarkMode, isHighContrast } = useGetTheme();

  const startParam = route?.params?.start;

  const [state, setState] = useState({
    currentScreen: startParam || "non-emergency",
    navigationHistory: [],
    selectedAnswer: null,
    selectedAnswers: [],
    formData: {},
    screenAnswers: {}, // Store answers for all screens (screenId -> answer value)
  });

  const { data: metadata, isLoading: isMetadataLoading } =
    useGetOrganizationMetadata();

  const currentScreenData = SCREENS[state.currentScreen];

  // Fetch articles for content screens based on contentId
  const { data: articlesData, isLoading: isArticlesLoading } = useQuery(
    [
      "children-rights-articles",
      currentScreenData?.sectionNumber,
      i18n.language,
    ],
    async () => {
      if (
        currentScreenData?.sectionNumber === undefined ||
        currentScreenData?.sectionNumber === null
      ) {
        return { data: [], meta: { pagination: { total: 0 } } };
      }

      // Search for articles that match the decision_tree_section field
      const { data } = await cmsSvc.getArticles({
        decisionTreeSection: currentScreenData.sectionNumber,
        locale: i18n.language,
        populate: true,
        limit: 3,
      });

      return data;
    },
    {
      enabled:
        currentScreenData?.type === "content" &&
        currentScreenData?.sectionNumber !== undefined &&
        currentScreenData?.sectionNumber !== null,
      refetchOnWindowFocus: false,
    }
  );

  const articles = articlesData?.data || [];

  // Restore saved answer when screen changes (if navigating back to a previously answered screen)
  useEffect(() => {
    if (currentScreenData && state.currentScreen) {
      const savedAnswer = state.screenAnswers[state.currentScreen];

      // Restore answer if we have a saved one and no current selection
      if (savedAnswer !== undefined) {
        if (currentScreenData.inputType === "multi") {
          const savedArray = Array.isArray(savedAnswer) ? savedAnswer : [];
          if (state.selectedAnswers.length === 0 && savedArray.length > 0) {
            setState((prev) => ({
              ...prev,
              selectedAnswers: savedArray,
            }));
          }
        } else {
          if (state.selectedAnswer === null && savedAnswer !== null) {
            setState((prev) => ({
              ...prev,
              selectedAnswer: savedAnswer,
            }));
          }
        }
      }
    }
  }, [state.currentScreen]); // Only depend on currentScreen to avoid loops

  // Helper function to get the translation key based on metadata field type
  const getTranslationKey = useCallback((metadataField, name) => {
    // UserInteractions need "_interaction" suffix
    if (metadataField === "userInteractions") {
      return `${name}_interaction`;
    }
    // All other fields use the name directly
    return name;
  }, []);

  // Helper function to get answers from metadata for dynamic screens
  const getAnswersFromMetadata = useCallback(
    (screen) => {
      if (!screen.metadataField || !metadata) return screen.answers || [];

      let metadataItems = metadata[screen.metadataField] || [];

      if (screen.filterSpecialisations) {
        metadataItems = metadataItems.filter((item) =>
          screen.filterSpecialisations.includes(item.name)
        );
      }

      return metadataItems
        .map((item) => ({
          id: item[screen.metadataIdField],
          labelKey: getTranslationKey(screen.metadataField, item.name),
          name: item.name,
          isFromMetadata: true, // Flag to use tOrg for translation
        }))
        .sort((a, b) => tOrg(a.labelKey).localeCompare(tOrg(b.labelKey)));
    },
    [metadata, tOrg, getTranslationKey]
  );

  // Get current screen answers (either static or from metadata)
  const currentAnswers = useMemo(() => {
    if (!currentScreenData) return [];
    if (currentScreenData.metadataField) {
      return getAnswersFromMetadata(currentScreenData);
    }
    return currentScreenData.answers || [];
  }, [currentScreenData, getAnswersFromMetadata]);

  // Handle article click
  const handleArticleClick = useCallback(
    (article) => {
      const articleId = article.id || article.data?.id;
      if (articleId) {
        navigation.navigate("ArticleInformation", {
          articleId: articleId,
        });
      }
    },
    [navigation]
  );

  const handleRedirectToContent = useCallback(() => {
    navigation.navigate("InformationalPortal", {
      screen: "Articles",
    });
  }, []);

  // Handle single answer selection
  const handleAnswerSelect = useCallback((answerId) => {
    setState((prev) => ({
      ...prev,
      selectedAnswer: answerId,
    }));
  }, []);

  // Handle multi-select answer toggle
  const handleMultiSelect = useCallback((answerId) => {
    setState((prev) => {
      const isSelected = prev.selectedAnswers.includes(answerId);
      return {
        ...prev,
        selectedAnswers: isSelected
          ? prev.selectedAnswers.filter((id) => id !== answerId)
          : [...prev.selectedAnswers, answerId],
      };
    });
  }, []);

  // Navigate to next screen
  const handleNext = useCallback(() => {
    const screen = currentScreenData;

    if (screen.type === "question") {
      // For question screens, find the selected answer and navigate to its nextScreen
      const selectedAnswerData = currentAnswers.find(
        (a) => a.id === state.selectedAnswer
      );
      if (selectedAnswerData?.nextScreen) {
        // Save the current answer before navigating
        const answerValue = state.selectedAnswer;
        setState((prev) => ({
          ...prev,
          navigationHistory: [...prev.navigationHistory, prev.currentScreen],
          currentScreen: selectedAnswerData.nextScreen,
          screenAnswers: {
            ...prev.screenAnswers,
            [prev.currentScreen]: answerValue,
          },
          selectedAnswer: null,
          selectedAnswers: [],
        }));
      }
    } else if (screen.type === "form-question") {
      // For form questions, save the answer and navigate to next screen
      const answerValue =
        screen.inputType === "multi"
          ? state.selectedAnswers
          : state.selectedAnswer;

      setState((prev) => ({
        ...prev,
        navigationHistory: [...prev.navigationHistory, prev.currentScreen],
        currentScreen: screen.nextScreen,
        formData: {
          ...prev.formData,
          [screen.formField]: answerValue,
        },
        screenAnswers: {
          ...prev.screenAnswers,
          [prev.currentScreen]: answerValue,
        },
        selectedAnswer: null,
        selectedAnswers: [],
      }));
    }
  }, [
    currentScreenData,
    currentAnswers,
    state.selectedAnswer,
    state.selectedAnswers,
  ]);

  // Navigate back
  const handleBack = useCallback(() => {
    if (state.navigationHistory.length > 0) {
      const previousScreen =
        state.navigationHistory[state.navigationHistory.length - 1];
      const previousScreenData = SCREENS[previousScreen];

      // Restore the previous answer from screenAnswers or formData
      let restoredAnswer = null;
      let restoredAnswers = [];

      // First check screenAnswers (works for all screen types)
      const savedAnswer = state.screenAnswers[previousScreen];

      if (previousScreenData?.type === "form-question") {
        // For form questions, prefer formData but fallback to screenAnswers
        const formDataValue = state.formData[previousScreenData.formField];
        const valueToUse =
          formDataValue !== undefined ? formDataValue : savedAnswer;

        if (previousScreenData.inputType === "multi") {
          restoredAnswers = Array.isArray(valueToUse) ? valueToUse : [];
        } else {
          restoredAnswer = valueToUse || null;
        }
      } else if (previousScreenData?.type === "question") {
        // For regular question screens, use screenAnswers
        restoredAnswer = savedAnswer || null;
      }

      setState((prev) => ({
        ...prev,
        navigationHistory: prev.navigationHistory.slice(0, -1),
        currentScreen: previousScreen,
        selectedAnswer: restoredAnswer,
        selectedAnswers: restoredAnswers,
      }));
    } else {
      // If no navigation history, go back to previous screen in navigation stack
      navigation.goBack();
    }
  }, [
    state.navigationHistory,
    state.formData,
    state.screenAnswers,
    navigation,
  ]);

  // Handle form submission (for untitled and final sections)
  const handleFormSubmit = useCallback(() => {
    const screen = currentScreenData;

    // Include the current screen's answer in formData (since it hasn't been saved yet)
    const currentAnswerValue =
      screen.inputType === "multi"
        ? state.selectedAnswers
        : state.selectedAnswer;

    const updatedFormData = {
      ...state.formData,
      [screen.formField]: currentAnswerValue,
    };

    // Build navigation params for organizations page
    const params = {};

    // Handle specialisations from both flows (untitled uses 'specialisation', final uses 'specialisations')
    // Ensure specialisations is always an array for the Organizations screen
    const specialisations =
      updatedFormData.specialisations || updatedFormData.specialisation;
    if (specialisations) {
      // Ensure it's an array (handle both single value and array)
      params.specialisations = Array.isArray(specialisations)
        ? specialisations
        : [specialisations];
    }

    // Pass other filter params
    if (updatedFormData.district) {
      params.district = updatedFormData.district;
    }
    if (updatedFormData.paymentMethod) {
      params.paymentMethod = updatedFormData.paymentMethod;
    }
    if (updatedFormData.userInteraction) {
      params.userInteraction = updatedFormData.userInteraction;
    }
    // Note: propertyType is not used in Organizations filters, so we skip it

    // Navigate within TabNavigation: the tab route is named "Consultations".
    // In RO this tab renders the Organizations screen component.
    navigation.navigate("TabNavigation", { screen: "Consultations", params });
  }, [
    currentScreenData,
    state.formData,
    state.selectedAnswer,
    state.selectedAnswers,
    navigation,
  ]);

  // Check if current answer is valid for continuing
  const canContinue =
    currentScreenData?.inputType === "multi"
      ? state.selectedAnswers.length > 0
      : state.selectedAnswer !== null;

  // Render question screen with RadioButtonSelector
  const renderQuestionScreen = () => {
    const screen = currentScreenData;

    return (
      <>
        {/* Header with title and paragraph */}
        {(screen.titleKey || screen.paragraphKey) && (
          <View style={styles.header}>
            {screen.titleKey && (
              <AppText
                namedStyle="h2"
                style={[
                  styles.title,
                  { color: colors.text, textAlign: "center" },
                ]}
              >
                {t(screen.titleKey)}
              </AppText>
            )}
            {screen.paragraphKey && (
              <AppText
                style={[
                  styles.paragraph,
                  { color: colors.textSecondary, textAlign: "center" },
                ]}
              >
                {t(screen.paragraphKey)}
              </AppText>
            )}
          </View>
        )}

        {/* Question */}
        {screen.questionKey && (
          <View style={styles.question}>
            <View style={styles.questionContent}>
              <AppText
                namedStyle="h3"
                style={[
                  styles.questionText,
                  { color: colors.text, textAlign: "left" },
                ]}
              >
                {t(screen.questionKey)}
              </AppText>
            </View>
          </View>
        )}

        {/* Answers */}
        <View style={styles.answers}>
          <View style={styles.answersContainer}>
            {currentAnswers.map((answer) => (
              <View key={answer.id} style={styles.answerOption}>
                <RadioButtonSelector
                  name={`question-${state.currentScreen}`}
                  isChecked={state.selectedAnswer === answer.id}
                  setIsChecked={() => handleAnswerSelect(answer.id)}
                  label={
                    answer.isFromMetadata
                      ? tOrg(answer.labelKey)
                      : t(answer.labelKey)
                  }
                  style={styles.radioButton}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <View style={styles.navigationButtons}>
            <NewButton
              label={t("back")}
              type="outline"
              size="lg"
              isFullWidth
              onPress={handleBack}
              style={styles.buttonFullWidth}
            />
            <NewButton
              label={t("continue")}
              size="lg"
              isFullWidth
              onPress={handleNext}
              disabled={!canContinue}
              style={styles.buttonFullWidth}
            />
          </View>
        </View>
      </>
    );
  };

  // Render form question screen (single or multi-select)
  const renderFormQuestionScreen = () => {
    const screen = currentScreenData;
    const isMulti = screen.inputType === "multi";
    const isLastQuestion = screen.isLastFormQuestion;

    return (
      <>
        {/* Question */}
        <View style={styles.question}>
          <View style={styles.questionContent}>
            <AppText
              namedStyle="h3"
              style={[
                styles.questionText,
                { color: colors.text, textAlign: "left" },
              ]}
            >
              {t(screen.questionKey)}
            </AppText>
          </View>
        </View>

        {/* Answers */}
        <View style={styles.answers}>
          <View
            style={[
              styles.answersContainer,
              isMulti && styles.answersContainerMulti,
            ]}
          >
            {isMulti
              ? currentAnswers.map((answer) => (
                  <Box
                    key={answer.id}
                    borderRadius="sm"
                    boxShadow={1}
                    style={[
                      styles.checkboxWrapper,
                      state.selectedAnswers.includes(answer.id) &&
                        styles.checkboxWrapperSelected,
                    ]}
                  >
                    <CheckBox
                      label={
                        answer.isFromMetadata
                          ? tOrg(answer.labelKey)
                          : t(answer.labelKey)
                      }
                      isChecked={state.selectedAnswers.includes(answer.id)}
                      setIsChecked={() => handleMultiSelect(answer.id)}
                      style={styles.checkbox}
                    />
                  </Box>
                ))
              : currentAnswers.map((answer) => (
                  <View key={answer.id} style={styles.answerOption}>
                    <RadioButtonSelector
                      name={`question-${state.currentScreen}`}
                      isChecked={state.selectedAnswer === answer.id}
                      setIsChecked={() => handleAnswerSelect(answer.id)}
                      label={
                        answer.isFromMetadata
                          ? tOrg(answer.labelKey)
                          : t(answer.labelKey)
                      }
                      style={styles.radioButton}
                    />
                  </View>
                ))}
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <View style={styles.navigationButtons}>
            <NewButton
              label={t("back")}
              type="outline"
              size="lg"
              isFullWidth
              onPress={handleBack}
              style={styles.buttonFullWidth}
            />
            <NewButton
              label={isLastQuestion ? t("submit") : t("continue")}
              size="lg"
              isFullWidth
              onPress={isLastQuestion ? handleFormSubmit : handleNext}
              disabled={!canContinue}
              style={styles.buttonFullWidth}
            />
          </View>
        </View>
      </>
    );
  };

  // Render article item for FlashList
  const renderArticle = useCallback(
    ({ item }) => {
      const articleData = destructureArticleData(item.data ? item.data : item);
      return (
        <CardMedia
          style={styles.cardMedia}
          title={articleData.title}
          image={
            articleData.imageMedium ||
            articleData.imageThumbnail ||
            articleData.imageSmall
          }
          description={articleData.description}
          labels={articleData.labels}
          creator={articleData.creator}
          readingTime={articleData.readingTime}
          categoryName={articleData.categoryName}
          onPress={() => handleArticleClick(item)}
          t={t}
        />
      );
    },
    [handleArticleClick, t]
  );

  // Render content screen
  const renderContentScreen = () => {
    const screen = currentScreenData;

    return (
      <>
        <View style={styles.content}>
          {screen.titleKey && (
            <AppText
              namedStyle="h2"
              style={[
                styles.contentTitle,
                { color: colors.text, textAlign: "center" },
              ]}
            >
              {t(screen.titleKey)}
            </AppText>
          )}
          {screen.paragraphKey && (
            <AppText
              style={[
                styles.contentParagraph,
                { color: colors.textSecondary, textAlign: "left" },
              ]}
            >
              <Trans
                // i18nKey={`children-rights-screen.${screen.paragraphKey}`}
                t={t}
                // ns="screens"
                components={[<AppText isBold key="0" />]}
              >
                {t(screen.paragraphKey)}
              </Trans>
            </AppText>
          )}
        </View>

        {/* Articles FlashList */}
        {isArticlesLoading && (
          <View style={styles.articlesLoadingContainer}>
            <Loading />
          </View>
        )}

        {!isArticlesLoading && articles.length > 0 && (
          <View style={styles.articlesContainer}>
            <FlashList
              estimatedItemSize={300}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item, index) => {
                const articleData = item.data ? item.data : item;
                return articleData.id?.toString() || index.toString();
              }}
              data={articles}
              renderItem={renderArticle}
              scrollEnabled={false}
              contentContainerStyle={styles.flashListContent}
            />
          </View>
        )}

        {/* Back button */}
        <View style={styles.navigation}>
          <View
            style={[
              styles.navigationButtons,
              screen.sectionNumber !== undefined &&
                screen.sectionNumber !== null &&
                styles.navigationButtonsStacked,
            ]}
          >
            <NewButton
              label={t("back")}
              type="outline"
              size="lg"
              isFullWidth
              onPress={handleBack}
              style={[
                styles.backButton,
                screen.sectionNumber !== undefined &&
                  screen.sectionNumber !== null &&
                  styles.fullWidthButton,
              ]}
            />
            {screen.sectionNumber !== undefined &&
              screen.sectionNumber !== null && (
                <View>
                  <NewButton
                    label={t("view_content")}
                    size="lg"
                    onPress={handleRedirectToContent}
                    style={styles.fullWidthButton}
                  />

                  <NewButton
                    label={t("to_dashboard")}
                    size="lg"
                    type="ghost"
                    onPress={() => navigation.navigate("Dashboard")}
                    style={[styles.fullWidthButton, styles.dashboardButton]}
                  />
                </View>
              )}
          </View>
        </View>
      </>
    );
  };

  // Render the appropriate screen type
  const renderScreen = () => {
    if (!currentScreenData) return null;

    // Show loading if metadata is needed but not yet loaded
    if (currentScreenData.metadataField && isMetadataLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Loading />
        </View>
      );
    }

    switch (currentScreenData.type) {
      case "question":
        return renderQuestionScreen();
      case "form-question":
        return renderFormQuestionScreen();
      case "content":
        return renderContentScreen();
      default:
        return null;
    }
  };

  return (
    <Screen t={t} hasEmergencyButton={false}>
      <View style={styles.page}>
        <Block style={styles.block}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.grid}>{renderScreen()}</View>
          </ScrollView>
        </Block>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  block: {
    flex: 1,
    flexGrow: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  grid: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
    width: "100%",
  },
  // Header section with title and paragraph
  header: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 32,
    width: "100%",
  },
  title: {
    marginBottom: 16,
  },
  paragraph: {
    marginTop: 8,
    marginBottom: 16,
    maxWidth: 1024,
    lineHeight: 24,
  },
  // Question section
  question: {
    marginBottom: 20,
    width: "100%",
  },
  questionContent: {
    maxWidth: 1024,
    width: "100%",
    alignSelf: "center",
  },
  questionText: {
    marginBottom: 16,
    lineHeight: 28,
  },
  // Answers section
  answers: {
    marginBottom: 32,
    width: "100%",
  },
  answersContainer: {
    flexDirection: "column",
    gap: 16,
    maxWidth: 1024,
    width: "100%",
    alignSelf: "center",
  },
  answersContainerMulti: {
    gap: 12,
  },
  answerOption: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 8,
    flex: 1,
    width: "100%",
  },
  radioButton: {
    margin: 0,
    width: "100%",
  },
  // Multi-select checkbox styling
  checkboxWrapper: {
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: "transparent",
  },
  checkboxWrapperSelected: {
    borderColor: appStyles.colorSecondary_9749fa,
  },
  checkbox: {
    marginBottom: 0,
  },
  // Content screen styling
  content: {
    alignItems: "center",
    width: "100%",
    maxWidth: 1024,
    marginHorizontal: "auto",
    marginBottom: 32,
  },
  contentTitle: {
    marginBottom: 24,
  },
  contentParagraph: {
    marginBottom: 24,
    lineHeight: 24,
  },
  // Articles section
  articlesLoadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
    width: "100%",
  },
  articlesContainer: {
    width: "100%",
    marginBottom: 24,
  },
  flashListContent: {
    paddingBottom: 0,
  },
  cardMedia: {
    alignSelf: "center",
    marginTop: 24,
  },
  noArticlesContainer: {
    paddingVertical: 40,
    alignItems: "center",
    width: "100%",
  },
  // Navigation section
  navigation: {
    width: "100%",
    marginTop: 24,
    marginBottom: 24,
  },
  navigationButtons: {
    flexDirection: "column",
    gap: 16,
    maxWidth: 1024,
    width: "100%",
    alignSelf: "center",
  },
  navigationButtonsStacked: {
    flexDirection: "column",
    gap: 16,
  },
  buttonFullWidth: {
    width: "100%",
    minWidth: "auto",
  },
  fullWidthButton: {
    flex: 0,
    width: "100%",
    minWidth: "auto",
  },
  dashboardButton: {
    marginTop: 16,
  },
});

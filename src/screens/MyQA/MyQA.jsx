import React, { useState, useEffect, useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  useWindowDimensions,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Config from "react-native-config";

import { Screen, NewButton } from "#components";
import { MyQA as MyQABlock, InformationPortalHero } from "#blocks";
import { HowItWorksMyQA } from "#modals";

import {
  CreateQuestion,
  QuestionDetails,
  ScheduleConsultationGroup,
  FilterQuestions,
} from "#backdrops";

import {
  useGetClientData,
  useAddVoteQuestion,
  useGetClientQuestions,
  useGetQuestions,
  useKeyboard,
  useAddCountryEvent,
} from "#hooks";
import { showToast } from "#utils";
import { Context } from "#services";

const { AMAZON_S3_BUCKET } = Config;

const myQaHeroImage = `${AMAZON_S3_BUCKET}/my-qa-mobile`;
const QUESTIONS_BATCH_SIZE = 10;

/**
 * MyQA
 *
 * MyQA screen
 *
 * @returns {JSX.Element}
 */
export const MyQA = ({ navigation }) => {
  const { t } = useTranslation("screens", { keyPrefix: "my-qa-screen" });
  const { t: blocksT } = useTranslation("blocks", { keyPrefix: "my-qa" });
  const { bottom: bottomInset } = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const scrollViewRef = useRef(null);
  const [giveSuggestionLayout, setGiveSuggestionLayout] = useState(null);
  const [searchValue, setSearchValue] = useState("");

  const { isTmpUser, handleRegistrationModalOpen } = useContext(Context);

  const [isCreateQuestionOpen, setIsCreateQuestionOpen] = useState(false);
  const [isQuestionDetailsOpen, setIsQuestionDetailsOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isFilterQuestionsBackdropOpen, setIsFilterQuestionsBackdropOpen] =
    useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState();
  const [tabs, setTabs] = useState([
    { label: "All", value: "all", isSelected: true },
    { label: "Most popular", value: "most_popular", isSelected: false },
    { label: "New", value: "newest", isSelected: false },
    ...(!isTmpUser
      ? [
          {
            label: "Your questions",
            value: "your_questions",
            isSelected: false,
          },
        ]
      : []),
  ]);
  const [providerId, setProviderId] = useState(null);
  const [filterTag, setFilterTag] = useState();
  // Questions in all languages are shown until the user picks one
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [shouldFetchQuestions, setShouldFetchQuestions] = useState(false);

  const [isKeyboardShown, setIsKeyboardShown] = useState(false);
  useKeyboard(
    true,
    () => setIsKeyboardShown(true),
    () => setIsKeyboardShown(false)
  );

  const clientData = useGetClientData()[1];

  const queryClient = useQueryClient();

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["getQuestions"] });
  };

  const onError = (error, rollback) => {
    showToast({ message: error, type: "error" });
    rollback();
  };

  const selectedTab = tabs.find((tab) => tab.isSelected).value;
  const isYourQuestionsTab = selectedTab === "your_questions";

  const userQuestionsQuery = useGetClientQuestions(
    isYourQuestionsTab && shouldFetchQuestions,
    selectedLanguage
  );
  const allQuestionsQuery = useGetQuestions(
    selectedTab,
    !isYourQuestionsTab,
    selectedLanguage
  );

  // Read the questions straight from the query cache so there is no render
  // where the request has finished but the list is still empty
  const activeQuestionsQuery = isYourQuestionsTab
    ? userQuestionsQuery
    : allQuestionsQuery;
  const questions = activeQuestionsQuery.data || [];
  const activeQuestionsQueryKey = isYourQuestionsTab
    ? ["getClientQuestions", selectedLanguage]
    : ["getQuestions", selectedTab, selectedLanguage];

  const onMutate = ({ vote, answerId }) => {
    const queryKey = activeQuestionsQueryKey;
    const previousQuestions = queryClient.getQueryData(queryKey);
    const isLike = vote === "like" || vote === "remove-like";

    queryClient.setQueryData(queryKey, (oldQuestions = []) =>
      oldQuestions.map((oldQuestion) => {
        if (oldQuestion.answerId !== answerId) return oldQuestion;

        const question = { ...oldQuestion };
        if (isLike) {
          if (question.isLiked) {
            question.likes--;
          } else {
            question.likes++;
          }

          if (question.isDisliked) {
            question.dislikes--;
          }
        } else {
          if (question.isDisliked) {
            question.dislikes--;
          } else {
            question.dislikes++;
          }
          if (question.isLiked) {
            question.likes--;
          }
        }
        question.isLiked = question.isLiked ? false : isLike;
        question.isDisliked = !isLike
          ? question.isDisliked
            ? false
            : !isLike
          : !isLike;
        return question;
      })
    );

    return () => {
      queryClient.setQueryData(queryKey, previousQuestions);
    };
  };

  const addVoteQuestionMutation = useAddVoteQuestion(
    onSuccess,
    onError,
    onMutate
  );

  const addCountryEventMutation = useAddCountryEvent();

  useEffect(() => {
    if (isTmpUser) {
      setTabs(tabs.filter((tab) => tab.value !== "your_questions"));
    }
  }, [isTmpUser]);

  // Mount the answer cards in batches instead of all at once
  const [visibleQuestionsCount, setVisibleQuestionsCount] =
    useState(QUESTIONS_BATCH_SIZE);

  useEffect(() => {
    setVisibleQuestionsCount(QUESTIONS_BATCH_SIZE);
  }, [selectedTab, selectedLanguage, filterTag, searchValue]);

  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - layoutMeasurement.height;

    if (isCloseToBottom && visibleQuestionsCount < questions.length) {
      setVisibleQuestionsCount((count) => count + QUESTIONS_BATCH_SIZE);
    }
  };

  const handleLike = (vote, answerId) => {
    if (isTmpUser) {
      handleRegistrationModalOpen();
    } else {
      addVoteQuestionMutation.mutate({ vote, answerId });
    }
  };

  const [isSelectConsultationOpen, setIsSelectConsultationOpen] =
    useState(false);
  const [isConfirmBackdropOpen, setIsConfirmBackdropOpen] = useState(false);
  const [isRequireDataAgreementOpen, setIsRequireDataAgreementOpen] =
    useState(false);

  const openRequireDataAgreement = () => setIsRequireDataAgreementOpen(true);

  const handleScheduleConsultationPress = (question) => {
    if (isTmpUser) {
      handleRegistrationModalOpen();
    } else {
      setProviderId(question.providerData.providerId);
      if (!clientData.dataProcessing) {
        openRequireDataAgreement();
      } else {
        addCountryEventMutation.mutate({
          eventType: "mobile_schedule_button_click",
        });
        setIsSelectConsultationOpen(true);
      }
    }
  };

  const handleSetIsQuestionDetailsOpen = (question) => {
    setSelectedQuestion(question);
    setIsQuestionDetailsOpen(true);
  };

  const handleAskQuestion = () => {
    if (isTmpUser) {
      handleRegistrationModalOpen();
    } else {
      setIsCreateQuestionOpen(true);
    }
  };
  const handleProviderClick = (providerId) => {
    navigation.push("ProviderOverview", { providerId });
  };

  const handleGiveSuggestionFocus = () => {
    if (
      Platform.OS !== "android" ||
      !giveSuggestionLayout ||
      !scrollViewRef.current
    ) {
      return;
    }

    const subscription = Keyboard.addListener("keyboardDidShow", (e) => {
      subscription.remove();
      const keyboardHeight = e.endCoordinates.height;
      const visibleHeight = windowHeight - keyboardHeight;
      const scrollY = Math.max(
        0,
        giveSuggestionLayout.y +
          giveSuggestionLayout.height -
          visibleHeight +
          56
      );
      scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
    });
  };

  const scrollContentBottomPadding =
    bottomInset + (Platform.OS === "ios" ? 130 : 140);

  return (
    <Screen
      hasEmergencyButton={false}
      hasHeaderNavigation
      t={t}
      style={
        !isKeyboardShown
          ? { paddingBottom: Platform.OS === "ios" ? 50 : 100 + bottomInset }
          : undefined
      }
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "position" : null}
        keyboardVerticalOffset={64}
      >
        <ScrollView
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: scrollContentBottomPadding }}
          onScroll={handleScroll}
          scrollEventThrottle={200}
        >
          <InformationPortalHero
            navigation={navigation}
            showSearch={true}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            placeholder={blocksT("search_input_placeholder")}
            image={{ uri: myQaHeroImage }}
          />
          <MyQABlock
            tabs={tabs}
            setTabs={setTabs}
            questions={questions}
            searchValue={searchValue}
            howItWorksLabel={t("heading_button_label")}
            onHowItWorksPress={() => setIsHowItWorksOpen(true)}
            onGoBack={() => navigation.goBack()}
            handleLike={handleLike}
            handleAskQuestion={handleAskQuestion}
            handleSchedulePress={handleScheduleConsultationPress}
            handleReadMore={handleSetIsQuestionDetailsOpen}
            handleFilterTags={() => setIsFilterQuestionsBackdropOpen(true)}
            filterTag={filterTag}
            isLoading={activeQuestionsQuery.isLoading}
            visibleQuestionsCount={visibleQuestionsCount}
            handleProviderClick={handleProviderClick}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            setShouldFetchQuestions={setShouldFetchQuestions}
          />
          {/* <View
            onLayout={(e) => setGiveSuggestionLayout(e.nativeEvent.layout)}
            collapsable={false}
          >
            <GiveSuggestion
              navigation={navigation}
              style={styles.marginBottom80}
              type="my-qa"
              onTextareaFocus={handleGiveSuggestionFocus}
            />
          </View> */}
        </ScrollView>
      </KeyboardAvoidingView>
      {isHowItWorksOpen ? (
        <HowItWorksMyQA
          isOpen={isHowItWorksOpen}
          onClose={() => setIsHowItWorksOpen(false)}
        />
      ) : null}
      {isCreateQuestionOpen ? (
        <CreateQuestion
          isOpen={isCreateQuestionOpen}
          onClose={() => setIsCreateQuestionOpen(false)}
        />
      ) : null}
      {isQuestionDetailsOpen ? (
        <QuestionDetails
          isOpen={isQuestionDetailsOpen}
          onClose={() => setIsQuestionDetailsOpen(false)}
          question={
            (selectedQuestion?.answerId &&
              questions.find(
                (question) => question.answerId === selectedQuestion.answerId
              )) ||
            selectedQuestion
          }
          handleLike={handleLike}
          handleSchedulePress={handleScheduleConsultationPress}
          handleProviderClick={handleProviderClick}
        />
      ) : null}
      <ScheduleConsultationGroup
        isSelectConsultationOpen={isSelectConsultationOpen}
        setIsSelectConsultationOpen={setIsSelectConsultationOpen}
        isConfirmBackdropOpen={isConfirmBackdropOpen}
        setIsConfirmBackdropOpen={setIsConfirmBackdropOpen}
        isRequireDataAgreementOpen={isRequireDataAgreementOpen}
        setIsRequireDataAgreementOpen={setIsRequireDataAgreementOpen}
        navigation={navigation}
        providerId={providerId}
        isInMyQA
      />
      {isFilterQuestionsBackdropOpen && (
        <FilterQuestions
          isOpen={isFilterQuestionsBackdropOpen}
          onClose={() => setIsFilterQuestionsBackdropOpen(false)}
          selectedTag={filterTag}
          setTag={setFilterTag}
          selectedLanguage={selectedLanguage}
        />
      )}
      {!isKeyboardShown && (
        <View
          style={{
            bottom: Platform.OS === "ios" ? 110 : bottomInset + 120,
            ...styles.askButton,
          }}
        >
          <NewButton
            label={t("ask_button_label")}
            size="lg"
            isFullWidth
            onPress={handleAskQuestion}
          />
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  askButton: {
    alignSelf: "center",
    position: "absolute",
    width: "100%",
    paddingHorizontal: 16,
  },
  scrollView: { paddingTop: 30 },
  marginBottom80: { marginBottom: 200 },
});

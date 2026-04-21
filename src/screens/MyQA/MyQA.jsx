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
  const [questions, setQuestions] = useState([]);
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
  const [selectedLanguage, setSelectedLanguage] = useState();
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

  const onMutate = ({ vote, answerId }) => {
    const rollbackCopy = JSON.parse(JSON.stringify([...questions]));

    const questionsCopy = [...questions];
    const isLike = vote === "like" || vote === "remove-like";

    for (let i = 0; i < questionsCopy.length; i++) {
      if (questionsCopy[i].answerId === answerId) {
        if (isLike) {
          if (questionsCopy[i].isLiked) {
            questionsCopy[i].likes--;
          } else {
            questionsCopy[i].likes++;
          }

          if (questionsCopy[i].isDisliked) {
            questionsCopy[i].dislikes--;
          }
        } else {
          if (questionsCopy[i].isDisliked) {
            questionsCopy[i].dislikes--;
          } else {
            questionsCopy[i].dislikes++;
          }
          if (questionsCopy[i].isLiked) {
            questionsCopy[i].likes--;
          }
        }
        questionsCopy[i].isLiked = questionsCopy[i].isLiked ? false : isLike;
        questionsCopy[i].isDisliked = !isLike
          ? questionsCopy[i].isDisliked
            ? false
            : !isLike
          : !isLike;
      }
    }

    setQuestions(questionsCopy);

    return () => {
      setQuestions(rollbackCopy);
    };
  };

  const addVoteQuestionMutation = useAddVoteQuestion(
    onSuccess,
    onError,
    onMutate
  );

  const addCountryEventMutation = useAddCountryEvent();

  const isUserQuestionsEnabled =
    tabs.filter((tab) => tab.value === "your_questions" && tab.isSelected)
      .length > 0 &&
    shouldFetchQuestions &&
    !!selectedLanguage;

  const userQuestionsQuery = useGetClientQuestions(
    isUserQuestionsEnabled,
    selectedLanguage
  );
  const allQuestionsQuery = useGetQuestions(
    tabs.find((tab) => tab.isSelected).value,
    !isUserQuestionsEnabled,
    selectedLanguage
  );

  useEffect(() => {
    if (isTmpUser) {
      setTabs(tabs.filter((tab) => tab.value !== "your_questions"));
    }
  }, [isTmpUser]);

  useEffect(() => {
    if (isUserQuestionsEnabled && userQuestionsQuery.data) {
      setQuestions(userQuestionsQuery.data);
    }

    if (!isUserQuestionsEnabled && allQuestionsQuery.data) {
      setQuestions(allQuestionsQuery.data);
    }
  }, [tabs, userQuestionsQuery.data, allQuestionsQuery.data]);

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
        >
          <InformationPortalHero
            navigation={navigation}
            showSearch={true}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            placeholder={blocksT("search_input_placeholder")}
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
            userQuestionsLoading={userQuestionsQuery.isLoading}
            allQuestionsLoading={allQuestionsQuery.isLoading}
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
          question={selectedQuestion}
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
        />
      )}
      {!isKeyboardShown && (
        <View
          style={{
            bottom: Platform.OS === "ios" ? 70 : bottomInset + 120,
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

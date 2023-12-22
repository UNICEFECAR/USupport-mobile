import React, { useState, useEffect, useContext } from "react";
import { useTranslation, Trans } from "react-i18next";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import { Screen, AppText, AppButton } from "#components";
import { MascotHeadingBlock, MyQA as MyQABlock } from "#blocks";
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
} from "#hooks";
import { showToast } from "#utils";

import { appStyles } from "#styles";

import { mascotHappyPurple } from "#assets";

import { Context } from "#services";

/**
 * MyQA
 *
 * MyQA screen
 *
 * @returns {JSX.Element}
 */
export const MyQA = ({ navigation }) => {
  const { t } = useTranslation("my-qa-screen");

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
    { label: "Your questions", value: "your_questions", isSelected: false },
  ]);
  const [providerId, setProviderId] = useState(null);
  const [filterTag, setFilterTag] = useState();

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

  const isUserQuestionsEnabled =
    tabs.filter((tab) => tab.value === "your_questions" && tab.isSelected)
      .length > 0;

  const userQuestionsQuery = useGetClientQuestions(isUserQuestionsEnabled);
  const allQuestionsQuery = useGetQuestions(
    tabs.find((tab) => tab.isSelected).value,
    !isUserQuestionsEnabled
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
  return (
    <Screen hasEmergencyButton={false} hasHeaderNavigation t={t}>
      <ScrollView>
        <MascotHeadingBlock
          image={mascotHappyPurple}
          style={styles.headingBlock}
        >
          <Heading t={t} handleButtonPress={() => setIsHowItWorksOpen(true)} />
        </MascotHeadingBlock>
        <MyQABlock
          tabs={tabs}
          setTabs={setTabs}
          questions={questions}
          handleLike={handleLike}
          handleAskQuestion={handleAskQuestion}
          handleSchedulePress={handleScheduleConsultationPress}
          handleReadMore={handleSetIsQuestionDetailsOpen}
          handleFilterTags={() => setIsFilterQuestionsBackdropOpen(true)}
          filterTag={filterTag}
          userQuestionsLoading={userQuestionsQuery.isLoading}
          allQuestionsLoading={allQuestionsQuery.isLoading}
          handleProviderClick={handleProviderClick}
        />
      </ScrollView>
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
      <AppButton
        label={t("ask_button_label")}
        size="lg"
        style={styles.askButton}
        onPress={handleAskQuestion}
      />
    </Screen>
  );
};

const Heading = ({ t, handleButtonPress }) => {
  return (
    <View>
      <AppText namedStyle="h3" style={[styles.headingText]} black>
        {t("heading")}
      </AppText>
      <AppText namedStyle="text" black>
        <Trans
          components={
            <AppText
              namedStyle="text"
              style={[styles.textBold]}
              black
            ></AppText>
          }
        >
          {t("subheading")}
        </Trans>
      </AppText>
      <AppButton
        label={t("heading_button_label")}
        size="md"
        type="secondary"
        style={styles.headingButton}
        onPress={handleButtonPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  askButton: {
    alignSelf: "center",
    bottom: Platform.OS === "ios" ? 70 : 100,
    position: "absolute",
  },
  headingBlock: { paddingTop: 88 },
  headingButton: { marginRight: 24, marginTop: 12 },
  headingText: { marginBottom: 12 },
  textBold: { fontFamily: appStyles.fontExtraBold },
});

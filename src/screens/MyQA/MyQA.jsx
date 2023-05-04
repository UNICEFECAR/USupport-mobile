import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, ScrollView } from "react-native";
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

  const userQuestions = useGetClientQuestions(isUserQuestionsEnabled);
  const allQuestions = useGetQuestions(
    tabs.find((tab) => tab.isSelected).value,
    !isUserQuestionsEnabled
  );

  useEffect(() => {
    if (isTmpUser) {
      setTabs(tabs.filter((tab) => tab.value !== "your_questions"));
    }
  }, [isTmpUser]);

  useEffect(() => {
    if (isUserQuestionsEnabled && userQuestions.data) {
      setQuestions(userQuestions.data);
    }

    if (!isUserQuestionsEnabled && allQuestions.data) {
      setQuestions(allQuestions.data);
    }
  }, [tabs, userQuestions.data, allQuestions.data]);

  //Removed because it was causing a bug when the user likes a question in QuestionDetails modal
  // useEffect(() => {
  //   if (selectedQuestion)
  //     setSelectedQuestion(
  //       questions.find((question) => question.answerId === question.answerId)
  //     );
  // }, [questions]);

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
        // setIsSelectConsultationOpen(true);
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
        isInDashboard={true}
      />
      {isFilterQuestionsBackdropOpen && (
        <FilterQuestions
          isOpen={isFilterQuestionsBackdropOpen}
          onClose={() => setIsFilterQuestionsBackdropOpen(false)}
          selectedTag={filterTag}
          setTag={setFilterTag}
        />
      )}
    </Screen>
  );
};

const Heading = ({ t, handleButtonPress }) => {
  return (
    <View>
      <AppText namedStyle="h3" style={[styles.headingText, styles.textBlack]}>
        {t("heading")}
      </AppText>
      <AppText namedStyle="text" style={styles.textBlack}>
        {t("subheading_its")}{" "}
        <AppText namedStyle="text" style={[styles.textBold, styles.textBlack]}>
          {t("subheading_anonymous")}
        </AppText>
        ! {t("subheading_text1")}{" "}
        <AppText namedStyle="text" style={[styles.textBold, styles.textBlack]}>
          {t("subheading_not")}
        </AppText>{" "}
        {t("subheading_text2")}
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
  headingBlock: { paddingTop: 88 },
  headingText: { marginBottom: 12 },
  textBold: { fontFamily: appStyles.fontExtraBold },
  textBlack: { color: appStyles.colorBlack_37 },
  headingButton: { marginTop: 12, marginRight: 24 },
});

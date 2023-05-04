import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import {
  Block,
  InputSearch,
  ButtonWithIcon,
  Tabs,
  AppButton,
  Answer,
  AppText,
  Loading,
} from "#components";

/**
 * MyQA
 *
 * Notifiations block
 *
 * @returns {JSX.Element}
 */
export const MyQA = ({
  handleAskQuestion,
  handleReadMore,
  handleLike,
  handleSchedulePress,
  questions,
  tabs,
  setTabs,
  isUserQuestionsEnabled,
  handleFilterTags,
  filterTag,
  userQuestionsLoading,
  allQuestionsLoading,
}) => {
  const { t } = useTranslation("my-qa");

  const [searchValue, setSearchValue] = useState("");
  const selectedTab = tabs.find((x) => x.isSelected)?.value;

  const handleTabChange = (index) => {
    const tabsCopy = [...tabs];

    for (let i = 0; i < tabsCopy.length; i++) {
      if (i === index) {
        tabsCopy[i].isSelected = true;
      } else {
        tabsCopy[i].isSelected = false;
      }
    }
    setTabs(tabsCopy);
  };

  const renderQuestions = () => {
    if (
      (selectedTab === "your_questions" && userQuestionsLoading) ||
      (selectedTab !== "your_questions" && allQuestionsLoading)
    )
      return (
        <View style={styles.loadingContainer}>
          <Loading size="md" />
        </View>
      );
    const filteredQuestions = questions.filter((question) => {
      if (filterTag) {
        const tags = question.tags;
        if (!tags.includes(filterTag)) {
          return null;
        }
      }

      const value = searchValue.toLowerCase();
      if (value) {
        if (
          !question.answerTitle?.toLowerCase().includes(value) &&
          !question.answerText?.toLowerCase().includes(value) &&
          !question.tags?.find((x) => x.toLowerCase().includes(value))
        ) {
          return null;
        }
      }

      return question;
    });

    if (!filteredQuestions.length) {
      return (
        <AppText style={styles.noQuestionsText}>
          {t("no_questions_found")}
        </AppText>
      );
    }

    return filteredQuestions.map((question, index) => {
      return (
        <Answer
          question={question}
          key={index}
          style={styles.answer}
          isInYourQuestions={isUserQuestionsEnabled}
          handleLike={handleLike}
          handleReadMore={handleReadMore}
          handleSchedulePress={handleSchedulePress}
          t={t}
        />
      );
    });
  };

  return (
    <>
      <Block style={styles.block}>
        <InputSearch
          placeholder={t("search_input_placeholder")}
          style={styles.inputSearch}
          value={searchValue}
          onChange={(value) => setSearchValue(value)}
        />
        <ButtonWithIcon
          color="purple"
          label={t("filter_button_label")}
          iconName="filter"
          iconSize="md"
          style={styles.filterButton}
          onPress={handleFilterTags}
        />
      </Block>
      <Tabs
        options={tabs.map((tab) => {
          return {
            label: t(tab.value),
            value: tab.value,
            isSelected: tab.isSelected,
          };
        })}
        handleSelect={handleTabChange}
      />
      <Block style={styles.block}>
        <AppButton
          label={t("ask_button_label")}
          size="lg"
          style={styles.askButton}
          onPress={handleAskQuestion}
        />
        <View style={styles.answersContainer}>{renderQuestions()}</View>
      </Block>
    </>
  );
};

const styles = StyleSheet.create({
  block: {
    flexDirection: "column",
    alignItems: "center",
    paddingBottom: 20,
  },
  inputSearch: { marginTop: 32 },
  filterButton: { marginTop: 20, alignSelf: "flex-start", marginLeft: 10 },
  askButton: { marginTop: 20 },
  answer: { marginTop: 24 },
  answersContainer: { width: "100%", paddingBottom: 90 },
  noQuestionsText: { marginTop: 20, alignSelf: "center" },
  loadingContainer: {
    alignItems: "center",
    marginTop: 24,
  },
});

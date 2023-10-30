import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  Icon,
  Block,
  InputSearch,
  Tabs,
  Answer,
  AppText,
  Loading,
} from "#components";
import appStyles from "../../styles/appStyles";

/**
 * MyQA
 *
 * Notifiations block
 *
 * @returns {JSX.Element}
 */
export const MyQA = ({
  handleReadMore,
  handleLike,
  handleSchedulePress,
  questions,
  tabs,
  setTabs,
  handleFilterTags,
  filterTag,
  userQuestionsLoading,
  allQuestionsLoading,
  handleProviderClick,
}) => {
  const { t, i18n } = useTranslation("my-qa");

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

  const renderQuestions = useCallback(() => {
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
        const isTitleMatching = question.answerTitle
          ?.toLowerCase()
          .includes(value);
        const isTextMatching = question.answerText
          ?.toLowerCase()
          .includes(value);
        const isTagMatching = question.tags?.find((x) =>
          x.toLowerCase().includes(value)
        );
        const isQuestionMatching = question.question
          ?.toLowerCase()
          .includes(value);

        const isMatching =
          isTitleMatching ||
          isTextMatching ||
          isTagMatching ||
          isQuestionMatching
            ? true
            : false;
        return !!isMatching;
      }

      return true;
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
          handleLike={handleLike}
          handleReadMore={handleReadMore}
          handleSchedulePress={handleSchedulePress}
          handleProviderClick={handleProviderClick}
          t={t}
        />
      );
    });
  }, [
    questions,
    i18n.language,
    userQuestionsLoading,
    allQuestionsLoading,
    searchValue,
    filterTag,
  ]);

  return (
    <>
      <Block style={styles.block}>
        <View style={styles.headingContainer}>
          <InputSearch
            placeholder={t("search_input_placeholder")}
            style={styles.inputSearch}
            value={searchValue}
            onChange={(value) => setSearchValue(value)}
          />

          <TouchableOpacity
            onPress={handleFilterTags}
            style={styles.filterButton}
          >
            <Icon name="filter" color="#eaeaea" />
          </TouchableOpacity>
        </View>
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
      <Block style={styles.renderBlock}>
        <View style={styles.answersContainer}>{renderQuestions()}</View>
      </Block>
    </>
  );
};

const styles = StyleSheet.create({
  answer: { marginTop: 24 },
  answersContainer: { paddingBottom: 90, width: "100%" },
  block: {
    alignItems: "center",
    flexDirection: "column",
    paddingBottom: 20,
  },
  filterButton: {
    alignItems: "center",
    backgroundColor: appStyles.colorSecondary_9749fa,
    borderRadius: 25,
    display: "flex",
    justifyContent: "center",
    maxWidth: "15%",
    padding: 10,
  },
  headingContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 32,
    width: "100%",
  },
  inputSearch: { maxWidth: "85%" },
  loadingContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  noQuestionsText: { alignSelf: "center", marginTop: 20 },
  renderBlock: {
    alignItems: "center",
    flexDirection: "column",
    marginBottom: Platform.OS === "ios" ? 50 : 80,
  },
});

import React, { useCallback, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
  NewButton,
  Icon,
  Block,
  Tabs,
  Answer,
  AnswerSkeleton,
  AppText,
  Dropdown,
  NotFoundCard,
} from "#components";
import { useGetTheme, useGetLanguages } from "#hooks";
import { localStorage } from "#services";
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
  selectedLanguage,
  setSelectedLanguage,
  setShouldFetchQuestions,
  searchValue = "",
  howItWorksLabel,
  onHowItWorksPress,
  onGoBack,
}) => {
  const { t, i18n } = useTranslation("blocks", { keyPrefix: "my-qa" });
  const { isHighContrast } = useGetTheme();
  const selectedTab = tabs.find((x) => x.isSelected)?.value;

  const { data: languages } = useGetLanguages();

  useEffect(() => {
    async function checkLocalLang() {
      const localLang = await localStorage.getItem("language");
      const language = languages.find((x) => x.alpha2 === localLang);
      if (language) {
        setSelectedLanguage(language.language_id);
      }
    }

    if (languages?.length) {
      checkLocalLang();
      setShouldFetchQuestions(true);
    }
  }, [languages]);

  const languageOptions = useMemo(() => {
    const showAllOption = {
      value: "all",
      label: t("all"),
    };

    if (!languages) return [showAllOption];

    return [
      showAllOption,
      ...languages.map((x) => ({
        value: x.language_id,
        label: x.local_name,
      })),
    ];
  }, [languages, t]);

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
    ) {
      return (
        <>
          <AnswerSkeleton style={styles.answer} />
          <AnswerSkeleton style={styles.answer} />
          <AnswerSkeleton style={styles.answer} />
        </>
      );
    }
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
        <NotFoundCard
          mode="illustrated"
          headingText={t("no_questions_found")}
          descriptionLine1={t("try_changing_filters") || ""}
          style={styles.notFound}
        />
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
      {!!howItWorksLabel && !!onHowItWorksPress && !!onGoBack && (
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={onGoBack}
            style={styles.goBackRow}
            hitSlop={appStyles.hitSlop}
          >
            <Icon
              style={styles.goBackIcon}
              name="arrow-chevron-back"
              color={isHighContrast ? "#fff" : appStyles.colorPrimary_20809e}
            />
            <AppText namedStyle="text" isBold style={styles.goBackText}>
              {t("go_back")}
            </AppText>
          </TouchableOpacity>
        </View>
      )}
      <Block style={styles.block}>
        <View style={styles.headingContainer}>
          <NewButton
            label={howItWorksLabel}
            size="lg"
            onPress={onHowItWorksPress}
          />
          <TouchableOpacity
            onPress={handleFilterTags}
            style={styles.filterButton}
          >
            <Icon name="filter" color="#eaeaea" />
          </TouchableOpacity>
        </View>
        <Dropdown
          options={languageOptions}
          selected={selectedLanguage}
          setSelected={(selectedOption) => setSelectedLanguage(selectedOption)}
          placeholder={t("language_placeholder")}
          // style={[styles.dropdown, styles.marginBottom32]}
          dropdownId="filterLanguage"
          emptyMessage={t("no_languages_found")}
          style={{ marginTop: 12, width: "100%" }}
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
      <Block style={styles.renderBlock}>
        <View style={styles.answersContainer}>{renderQuestions()}</View>
      </Block>
    </>
  );
};

const styles = StyleSheet.create({
  answer: { marginTop: 24 },
  answersContainer: { paddingBottom: 40, width: "100%" },
  block: {
    alignItems: "flex-start",
    flexDirection: "column",
    paddingBottom: 20,
  },
  filterButton: {
    alignItems: "center",
    backgroundColor: appStyles.colorSecondary_9749fa,
    borderRadius: 25,
    display: "flex",
    justifyContent: "center",
    padding: 10,
  },
  goBackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  headingContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  notFound: { marginTop: 20 },
  renderBlock: {
    alignItems: "center",
    flexDirection: "column",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  goBackButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
});

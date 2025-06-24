import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";

import {
  AppButton,
  Block,
  Icon,
  AppText,
  RadioButtonSelector,
  Textarea,
  Emoticon,
} from "#components";

import {
  useGetTheme,
  useCreateConsultationSecurityCheck,
  useUpdateSecurityCheckAnswersByConsultationId,
} from "#hooks";

import { InputSlider } from "../../components/inputs";

import { appStyles } from "#styles";

/**
 * SafetyFeedback
 *
 * Safe feedback block
 *
 * @return {jsx}
 */
export const SafetyFeedback = ({ navigation, consultationId, answers }) => {
  const { t } = useTranslation("safety-feedback");

  const hasAnsweredBefore =
    Object.values(answers).filter((x) => x !== undefined).length === 11;

  const [questions, setQuestions] = useState([
    {
      label: t("q0"),
      field: "providerAttend",
      value: answers.hasOwnProperty("providerAttend")
        ? answers.providerAttend
        : null,
      id: 0,
    },
    {
      label: t("q1"),
      field: "contactsDisclosure",
      value: answers.hasOwnProperty("contactsDisclosure")
        ? answers.contactsDisclosure
        : null,
      id: 1,
    },
    {
      label: t("q2"),
      field: "suggestOutsideMeeting",
      value: answers.hasOwnProperty("suggestOutsideMeeting")
        ? answers.suggestOutsideMeeting
        : null,
      id: 2,
    },
    {
      label: t("q3"),
      field: "identityCoercion",
      value: answers.hasOwnProperty("identityCoercion")
        ? answers.identityCoercion
        : null,
      id: 3,
    },
    {
      label: t("q4"),
      field: "unsafeFeeling",
      value: answers.hasOwnProperty("unsafeFeeling")
        ? answers.unsafeFeeling
        : null,
      id: 4,
      showInput: true,
    },
    {
      label: t("q5"),
      field: "feeling",
      value: answers.hasOwnProperty("feeling") ? answers.feeling : null,
      id: 5,
      type: "emoji",
    },
    {
      label: t("q6"),
      field: "addressedNeeds",
      value: answers.hasOwnProperty("addressedNeeds")
        ? answers.addressedNeeds
        : 10,
      id: 6,
      type: "slider",
    },
    {
      label: t("q7"),
      field: "improveWellbeing",
      value: answers.hasOwnProperty("improveWellbeing")
        ? answers.improveWellbeing
        : 10,
      id: 7,
      type: "slider",
    },
    {
      label: t("q8"),
      field: "feelingsNow",
      value: answers.hasOwnProperty("feelingsNow") ? answers.feelingsNow : 10,
      id: 8,
      type: "slider",
    },
    {
      label: t("q9"),
      field: "additionalComment",
      value: answers.hasOwnProperty("additionalComment")
        ? answers.additionalComment
        : null,
      id: 9,
      type: "textarea",
    },
  ]);

  const [moreDetails, setMoreDetails] = useState(
    answers.hasOwnProperty("moreDetails") ? answers.moreDetails : ""
  );

  const handleAnswerSelect = (id, value) => {
    const newQuestions = questions.map((question) => {
      if (question.id === id) {
        return { ...question, value };
      }
      return question;
    });
    setQuestions(newQuestions);
  };

  const onCreateSuccess = () => navigation.navigate("TabNavigation");
  const onCreateError = (error) => {
    showToast({
      message: error,
      type: "error",
    });
  };
  const createConsultationSecurityCheckMutation =
    useCreateConsultationSecurityCheck(onCreateSuccess, onCreateError);

  const updateconsultationSecurityCheckMutation =
    useUpdateSecurityCheckAnswersByConsultationId(onCreateSuccess);

  const handleSubmit = () => {
    let payload = { consultationId };
    questions.forEach((question) => {
      if (questions[0].value === false) {
        payload = {
          consultationId,
          providerAttend: false,
          contactsDisclosure: false,
          suggestOutsideMeeting: false,
          identityCoercion: false,
          unsafeFeeling: false,
          feeling: null,
          addressedNeeds: 0,
          improveWellbeing: 0,
          feelingsNow: 0,
          additionalComment: "",
          moreDetails: "",
        };
      } else {
        payload[question.field] = question.value;
      }
    });
    payload.moreDetails = payload.unsafeFeeling ? moreDetails : "";

    if (hasAnsweredBefore) {
      updateconsultationSecurityCheckMutation.mutate(payload);
    } else {
      createConsultationSecurityCheckMutation.mutate(payload);
    }
  };

  const canSubmit = useMemo(() => {
    if (!questions[0].value) return true;
    const questionsExcludingLast = questions.slice(0, -1);

    return (
      questionsExcludingLast.filter(
        (x) => x.value !== null && x.value !== undefined
      ).length === questionsExcludingLast.length
    );
  }, [questions]);

  return (
    <Block>
      <View style={styles.warningContainer}>
        <Icon name="warning" size="md" />
        <AppText namedStyle="smallText" style={styles.warningText}>
          {t("warning")}
        </AppText>
      </View>

      {questions.map((question, index) => {
        if (!questions[0].value && question.id !== 0) return null;
        return question.type === "textarea" ? (
          <QuestionTextArea
            question={question}
            t={t}
            handleAnswerSelect={handleAnswerSelect}
            numeration={index + 1}
            key={index}
          />
        ) : question?.type === "slider" ? (
          <QuestionSlider
            question={question}
            handleAnswerSelect={handleAnswerSelect}
            numeration={index + 1}
            key={index}
          />
        ) : question?.type === "emoji" ? (
          <QuestionEmoji
            question={question}
            handleAnswerSelect={handleAnswerSelect}
            t={t}
            numeration={index + 1}
            key={index}
          />
        ) : (
          <>
            <Question
              question={question}
              handleAnswerSelect={handleAnswerSelect}
              t={t}
              key={index}
              numeration={index + 1}
            />
            {question.id === 4 && questions[4].value === true && (
              <Textarea
                label={t("more_details_label")}
                value={moreDetails}
                onChange={setMoreDetails}
                placeholder={t("more_details_placeholder")}
                style={styles.marginTop16}
              />
            )}
          </>
        );
      })}
      <AppButton
        label={t("button")}
        size="lg"
        disabled={!canSubmit}
        onPress={handleSubmit}
        loading={
          updateconsultationSecurityCheckMutation.Loading ||
          createConsultationSecurityCheckMutation.isLoading
        }
        style={[styles.marginTop40, styles.button]}
      />
      {hasAnsweredBefore && (
        <AppButton
          label={t("continue_button")}
          size="lg"
          type="secondary"
          disabled={!canSubmit}
          onPress={handleSubmit}
          style={[styles.marginTop40, styles.button]}
        />
      )}
    </Block>
  );
};

const Question = ({ question, handleAnswerSelect, t, numeration }) => {
  return (
    <View style={styles.marginTop40}>
      <AppText>
        {numeration}. {question.label}
      </AppText>
      <View style={styles.questionAnswersContainer}>
        <RadioButtonSelector
          label={t("yes")}
          isChecked={question.value === true}
          setIsChecked={() => handleAnswerSelect(question.id, true)}
          style={styles.radioButton}
        />
        <RadioButtonSelector
          label={t("no")}
          isChecked={question.value === false}
          setIsChecked={() => handleAnswerSelect(question.id, false)}
          style={styles.radioButton}
        />
      </View>
    </View>
  );
};

const QuestionTextArea = ({ question, handleAnswerSelect, t, numeration }) => {
  return (
    <View style={styles.marginTop40}>
      <AppText>
        {numeration}. {question.label}
      </AppText>
      <View style={styles.questionAnswersContainer}>
        <Textarea
          value={question.value}
          onChange={(value) => handleAnswerSelect(question.id, value)}
          placeholder={t("more_details_placeholder")}
          style={styles.marginTop16}
        />
      </View>
    </View>
  );
};

const QuestionEmoji = ({ question, handleAnswerSelect, t, numeration }) => {
  const { colors } = useGetTheme();
  const emoticonsArray = [
    {
      value: "very_satisfied",
      label: t("very_satisfied"),
      emoji: "happy",
      isSelected: question.value === "very_satisfied",
    },
    {
      value: "satisfied",
      label: t("satisfied"),
      emoji: "good",
      isSelected: question.value === "satisfied",
    },
    {
      value: "neutral",
      label: t("neutral"),
      emoji: "sad",
      isSelected: question.value === "neutral",
    },
    {
      value: "dissatisfied",
      label: t("dissatisfied"),
      emoji: "depressed",
      isSelected: question.value === "dissatisfied",
    },
    {
      value: "very Dissatisfied",
      label: t("very_dissatisfied"),
      emoji: "worried",
      isSelected: question.value === "very_dissatisfied",
    },
  ];
  const [emoticons, setEmoticons] = useState(emoticonsArray);

  const handleSelect = (value) => {
    const newEmoticons = emoticons.map((emoticon) => {
      if (emoticon.value === value) {
        return { ...emoticon, isSelected: true };
      }
      return { ...emoticon, isSelected: false };
    });
    setEmoticons(newEmoticons);
    handleAnswerSelect(question.id, value);
  };

  const renderEmoticons = () => {
    return emoticons.map((emoticon, index) => {
      const emoticonView = (
        <View
          style={[
            styles.emoticonContainer,
            !emoticon.isSelected && styles.emoticonContainerNotSelected,
          ]}
        >
          <Emoticon
            name={`${emoticon.emoji}`}
            size={emoticon.isSelected ? "lg" : "sm"}
          />
          <AppText
            numberOfLines={1}
            namedStyle="smallText"
            style={[styles.textSelected, { color: colors.textTertiary }]}
          >
            {emoticon.label}
          </AppText>
        </View>
      );
      return (
        <TouchableOpacity
          onPress={() => handleSelect(emoticon.value)}
          key={index}
        >
          {emoticonView}
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.marginTop40}>
      <AppText>
        {numeration}. {question.label}
      </AppText>
      <View style={styles.rating}>{renderEmoticons()}</View>
    </View>
  );
};

const QuestionSlider = ({ question, handleAnswerSelect, t, numeration }) => {
  return (
    <View style={styles.marginTop40}>
      <AppText>
        {numeration}. {question.label}
      </AppText>
      <View style={styles.questionAnswersContainer}>
        <InputSlider
          value={question.value}
          setValue={(value) => handleAnswerSelect(question.id, value)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  warningContainer: {
    paddingTop: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  warningText: { marginLeft: 16 },
  marginTop16: { marginTop: 16 },
  marginTop40: { marginTop: 40 },
  questionAnswersContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  radioButton: {
    maxWidth:
      appStyles.screenWidth / 2 < 160 ? appStyles.screenWidth / 2 - 24 : 160,
    marginTop: 8,
  },
  button: { alignSelf: "center" },
  rating: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    paddingTop: 16,
  },
  emoticonContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 62,
  },
  emoticonContainerNotSelected: { opacity: 0.5 },
});

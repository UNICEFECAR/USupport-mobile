import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, ScrollView } from "react-native";

import {
  AppButton,
  Block,
  Icon,
  AppText,
  RadioButtonSelector,
  Textarea,
} from "#components";

import {
  useCreateConsultationSecurityCheck,
  useUpdateSecurityCheckAnswersByConsultationId,
} from "#hooks";

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
    Object.values(answers).filter((x) => x !== undefined).length === 5;

  const [questions, setQuestions] = useState([
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
  const createConsultationSecurityCheckMutation =
    useCreateConsultationSecurityCheck(onCreateSuccess);

  const updateconsultationSecurityCheckMutation =
    useUpdateSecurityCheckAnswersByConsultationId(onCreateSuccess);

  const handleSubmit = () => {
    const payload = { consultationId };
    questions.forEach((question) => {
      payload[question.field] = question.value;
    });
    payload.moreDetails = payload.unsafeFeeling ? moreDetails : "";

    if (hasAnsweredBefore) {
      updateconsultationSecurityCheckMutation.mutate(payload);
    } else {
      createConsultationSecurityCheckMutation.mutate(payload);
    }
  };

  return (
    <Block>
      <View style={styles.warningContainer}>
        <Icon name="warning" size="md" />
        <AppText namedStyle="smallText" style={styles.warningText}>
          {t("warning")}
        </AppText>
      </View>

      <View style={styles.questionsContainer}>
        {questions.map((question, index) => (
          <Question
            question={question}
            handleAnswerSelect={handleAnswerSelect}
            t={t}
            key={index}
          />
        ))}
        {questions[3].value === true && (
          <Textarea
            label={t("more_details_label")}
            value={moreDetails}
            onChange={setMoreDetails}
            placeholder={t("more_details_placeholder")}
            style={styles.marginTop16}
          />
        )}
        <AppButton
          label={t("button")}
          size="lg"
          disabled={questions.filter((x) => x.value !== null).length !== 4}
          onPress={handleSubmit}
          style={[styles.marginTop40, styles.button]}
        />
        {hasAnsweredBefore && (
          <AppButton
            label={t("continue_button")}
            size="lg"
            type="secondary"
            disabled={questions.filter((x) => x.value !== null).length !== 4}
            onPress={handleSubmit}
            style={[styles.marginTop40, styles.button]}
          />
        )}
      </View>
    </Block>
  );
};

const Question = ({ question, handleAnswerSelect, t }) => {
  return (
    <View style={styles.marginTop40}>
      <AppText>{question.label}</AppText>
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
    maxWidth: 160,
    backgroundColor: "red",
    marginTop: 8,
  },
  button: { alignSelf: "center" },
});

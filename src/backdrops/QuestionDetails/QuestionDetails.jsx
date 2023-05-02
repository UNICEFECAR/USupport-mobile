import React from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import { Backdrop, AppText, Icon, Like, Label, Avatar } from "#components";
import { appStyles } from "#styles";
import { isDateToday } from "#utils";
import Config from "react-native-config";

const { AMAZON_S3_BUCKET } = Config;

/**
 * QuestionDetails
 *
 * The QuestionDetails modal
 *
 * @return {jsx}
 */
export const QuestionDetails = ({
  question,
  handleLike,
  isOpen,
  onClose,
  handleSchedulePress,
}) => {
  const { t } = useTranslation("question-details");

  const isInMyQuestions = question.isAskedByCurrentClient;
  const providerInfo = question.providerData;

  const imageUrl = AMAZON_S3_BUCKET + "/" + (providerInfo.image || "default");

  const getDateText = () => {
    const date = new Date(question.questionCreatedAt);

    if (isDateToday(date)) {
      return t("today");
    } else {
      return `${date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`}.${
        date.getMonth() + 1 > 9
          ? date.getMonth() + 1
          : `0${date.getMonth() + 1}`
      }`;
    }
  };

  return (
    <Backdrop classes="question-details" isOpen={isOpen} onClose={onClose}>
      <View style={styles.dateContainer}>
        <Icon name="calendar" color="#92989B" />
        <AppText style={styles.dateContainerText}>{getDateText()}</AppText>
      </View>
      {isInMyQuestions ? (
        <AppText>{question.question}</AppText>
      ) : (
        <AppText namedStyle="h3" style={styles.headingText}>
          {question.answerTitle}
        </AppText>
      )}
      {question.answerId ? (
        <Like
          handleClick={handleLike}
          likes={question.likes}
          dislikes={question.dislikes}
          answerId={question.answerId}
          isLiked={question.isLiked}
          isDisliked={question.isDisliked}
        />
      ) : null}
      {question.answerId && isInMyQuestions ? (
        <AppText
          namedStyle="h3"
          style={[styles.headingText, styles.marginTop12]}
        >
          {question.answerTitle}
        </AppText>
      ) : null}
      {question.tags ? (
        <View style={styles.labelsContainer}>
          {question.tags.map((label, index) => {
            return <Label text={label} key={index} style={styles.label} />;
          })}
        </View>
      ) : null}
      <AppText style={styles.answerText}>{question.answerText}</AppText>
      <View style={styles.bottomContainer}>
        <View style={styles.answerByContainer}>
          <AppText>{t("answered_by")}</AppText>
          <Avatar
            image={imageUrl && { uri: imageUrl }}
            size="xs"
            style={styles.avatar}
          />
          <AppText>
            {providerInfo.name} {providerInfo.surname}
          </AppText>
        </View>
        <TouchableOpacity onPress={() => handleSchedulePress(question)}>
          <View style={styles.scheduleButton}>
            <Icon name="calendar" color="#20809e" />
            <AppText style={styles.scheduleButtonText}>
              {t("schedule_consultation")}
            </AppText>
          </View>
        </TouchableOpacity>
      </View>
    </Backdrop>
  );
};

const styles = StyleSheet.create({
  dateContainer: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    top: 0,
  },
  dateContainerText: {
    marginLeft: 4,
    color: appStyles.colorGray_92989b,
  },
  headingText: {
    color: appStyles.colorPrimary_20809e,
  },
  labelsContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    marginHorizontal: 4,
    marginVertical: 2,
  },
  answerText: { marginTop: 8 },
  answerByContainer: { flexDirection: "row", marginTop: 12 },
  avatar: { marginHorizontal: 4 },
  scheduleButton: { flexDirection: "row", marginTop: 12 },
  scheduleButtonText: {
    marginLeft: 12,
    color: appStyles.colorPrimary_20809e,
    fontFamily: appStyles.fontBold,
  },
  marginTop12: {
    marginTop: 12,
  },
});

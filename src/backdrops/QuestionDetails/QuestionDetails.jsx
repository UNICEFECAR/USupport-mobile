import React from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";

import {
  Backdrop,
  AppText,
  Icon,
  Like,
  Label,
  Avatar,
  Line,
} from "#components";
import { appStyles } from "#styles";
import { isDateToday } from "#utils";
import Config from "react-native-config";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

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
  handleProviderClick,
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
    <Backdrop isOpen={isOpen} onClose={onClose}>
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
      <View style={styles.providerWrapper}>
        {question.answerId ? (
          <View style={styles.bottomContainer}>
            <View style={styles.answerByContainer}>
              <TouchableWithoutFeedback
                onPress={() => handleProviderClick(providerInfo.providerId)}
              >
                <Avatar
                  image={imageUrl && { uri: imageUrl }}
                  size="xs"
                  style={styles.avatar}
                />
              </TouchableWithoutFeedback>
              <AppText
                onPress={() => handleProviderClick(providerInfo.providerId)}
              >
                {providerInfo.name} {providerInfo.surname}
              </AppText>
            </View>
          </View>
        ) : null}

        <TouchableOpacity onPress={() => handleSchedulePress(question)}>
          <View style={styles.scheduleButton}>
            <Icon name="calendar" color="#20809e" />
          </View>
        </TouchableOpacity>
      </View>

      {question.answerId && isInMyQuestions ? (
        <AppText
          namedStyle="h3"
          style={[styles.headingText, styles.marginTop12]}
        >
          {question.answerTitle}
        </AppText>
      ) : null}
      <Line style={styles.line} />
      <View style={styles.subheadingWrapper}>
        {question.tags ? (
          <View style={styles.labelsContainer}>
            {question.tags.map((label, index) => {
              return (
                <Label text={`#${label}`} key={index} style={styles.label} />
              );
            })}
          </View>
        ) : null}
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
      </View>

      <AppText style={styles.answerText}>{question.answerText}</AppText>

      <>
        <View
          style={{
            height: Platform.OS === "ios" ? 85 : 100,
          }}
        />
      </>
    </Backdrop>
  );
};

const styles = StyleSheet.create({
  answerByContainer: { flexDirection: "row", marginTop: 12 },
  answerText: { marginTop: 18 },
  avatar: { marginHorizontal: 4 },
  dateContainer: {
    alignItems: "center",
    flexDirection: "row",
    position: "absolute",
    top: 0,
  },
  dateContainerText: {
    color: appStyles.colorGray_92989b,
    marginLeft: 4,
  },
  headingText: {
    color: appStyles.colorPrimary_20809e,
  },
  label: {
    borderWidth: 0,
    marginVertical: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    margin: 2,
  },
  labelsContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 6,
    maxWidth: "70%",
  },
  marginTop12: {
    marginTop: 12,
  },
  scheduleButton: { flexDirection: "row", marginTop: 12 },
  scheduleButtonText: {
    color: appStyles.colorPrimary_20809e,
    fontFamily: appStyles.fontBold,
    marginLeft: 12,
  },
  providerWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  likeWrapper: {
    marginTop: 12,
  },
  line: {
    marginTop: 12,
  },
  subheadingWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 12,
  },
});

import React from "react";
import Config from "react-native-config";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import { AppText } from "../../texts";
import { AppButton } from "../../buttons";
import { Icon, Like } from "../../icons";
import { Label } from "../../labels";
import { Avatar } from "../../avatars";
import { Line } from "../../separators";

import { isDateToday } from "#utils";

import { appStyles } from "#styles";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

const { AMAZON_S3_BUCKET } = Config;

/**
 * Answer
 *
 * Answer component used to display questions and answers in MyQA
 *
 * @return {jsx}
 */
export const Answer = ({
  question,
  handleLike = () => {},
  handleReadMore = () => {},
  handleSchedulePress = () => {},
  handleProviderClick = () => {},
  style,
  t,
}) => {
  const providerInfo = question.providerData;
  const isAskedByCurrentClient = question.isAskedByCurrentClient;

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

  const renderHeadingAndLabels = () => {
    return (
      <View style={styles.width100}>
        <View style={styles.headingAndLabelsContainer}>
          <AppText
            namedStyle="h3"
            style={styles.questionAnswerTitle}
            numberOfLines={2}
          >
            {question.answerTitle}
          </AppText>
          <Like
            handleClick={handleLike}
            likes={question.likes}
            dislikes={question.dislikes}
            answerId={question.answerId}
            isLiked={question.isLiked}
            isDisliked={question.isDisliked}
          />
        </View>
        <View style={styles.labelsContainer}>
          {question.tags &&
            question.tags.map((label, index) => {
              return <Label text={label} key={index} style={styles.label} />;
            })}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.answer, style]}>
      {!isAskedByCurrentClient ? (
        <>
          <View style={styles.headingContainer}>
            {isAskedByCurrentClient ? (
              <View>
                <View style={styles.dateContainer}>
                  <Icon name="calendar" color="#92989B" />
                  <AppText namedStyle="text" style={styles.text}>
                    {getDateText()}
                  </AppText>
                </View>
                <AppText
                  style={styles.marginTop_0_8}
                  namedStyle="text"
                  numberOfLines={2}
                >
                  {question.question}
                </AppText>
              </View>
            ) : (
              renderHeadingAndLabels()
            )}
          </View>
        </>
      ) : (
        <>
          <View style={styles.dateContainer}>
            <Icon name="calendar" color="#92989B" />
            <AppText namedStyle="text" style={styles.dateContainerText}>
              {getDateText()}
            </AppText>
          </View>
          <AppText style={styles.marginTop_0_8} numberOfLines={2}>
            {question.question}
          </AppText>
        </>
      )}
      <Line style={styles.marginTop_0_8} />
      {question.answerTitle && isAskedByCurrentClient ? (
        <View style={{ flexDirection: "row" }}>{renderHeadingAndLabels()}</View>
      ) : null}
      {question.answerTitle ? (
        <>
          <AppText
            namedStyle="text"
            numberOfLines={2}
            style={isAskedByCurrentClient && styles.marginTop_0_8}
          >
            {question.answerText}
          </AppText>
          <TouchableOpacity onPress={() => handleReadMore(question)}>
            <View style={styles.readMoreContainer}>
              <AppText style={styles.readMoreText}>{t("read_more")}</AppText>
            </View>
          </TouchableOpacity>
          <View style={styles.bottomContainer}>
            <View style={styles.answeredByContainer}>
              <AppText namedStyle="text">{t("answer_by")}</AppText>
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
                namedStyle="text"
                onPress={() => handleProviderClick(providerInfo.providerId)}
              >
                {providerInfo.name} {providerInfo.surname}
              </AppText>
            </View>
            <TouchableOpacity onPress={() => handleSchedulePress(question)}>
              <View style={styles.scheduleButton}>
                <Icon name="calendar" color={appStyles.colorPrimary_20809e} />
                <AppText namedStyle="text" style={styles.scheduleButtonText}>
                  {t("schedule_consultation")}
                </AppText>
              </View>
            </TouchableOpacity>
          </View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  answer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    width: "100%",
    maxWidth: 420,
    backgroundColor: appStyles.colorWhite_ff,
    ...appStyles.shadow2,
    borderWidth: 1,
    borderColor: "transparent",
    alignSelf: "center",
    borderRadius: 24,
  },
  headingContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  headingAndLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    textAlign: "left",
    marginBottom: 8,
  },
  labelsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  label: {
    marginRight: 4,
    marginBottom: 4,
    backgroundColor: appStyles.colorGray_ea,
  },
  questionAnswerTitle: {
    paddingTop: 12,
    width: "100%",
  },
  marginTop_0_8: {
    marginTop: 8,
  },
  text: { marginLeft: 4, color: appStyles.colorGray_92989b },
  dateContainer: { flexDirection: "row", alignItems: "center" },
  readMoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  readMoreText: {
    color: appStyles.colorPrimary_20809e,
    fontFamily: appStyles.fontBold,
  },
  bottomContainer: { flexDirection: "column" },
  answeredByContainer: { flexDirection: "row", marginTop: 10 },
  avatar: { marginHorizontal: 4 },
  scheduleButton: { marginTop: 20, flexDirection: "row" },
  scheduleButtonText: {
    marginLeft: 14,
    color: appStyles.colorPrimary_20809e,
    fontFamily: appStyles.fontBold,
  },
  dateContainerText: { marginLeft: 4, color: appStyles.colorGray_92989b },
  width100: { width: "100%" },
});

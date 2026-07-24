import React from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";

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
  handleProviderClick,
}) => {
  const { t } = useTranslation("backdrops", { keyPrefix: "question-details" });

  const isInMyQuestions = question?.isAskedByCurrentClient;
  const providerInfo = question?.providerData;

  const imageUrl =
    providerInfo?.image && AMAZON_S3_BUCKET
      ? `${AMAZON_S3_BUCKET}/${providerInfo.image}`
      : null;

  const getDateText = (dateString) => {
    const date = new Date(dateString);

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

  const providerId =
    providerInfo?.providerId || providerInfo?.provider_detail_id;

  return (
    <Backdrop isOpen={isOpen} onClose={onClose}>
      <View style={styles.dateContainer}>
        <Icon name="calendar" color={appStyles.colorGray_92989b} />
        <AppText style={styles.dateContainerText}>
          {getDateText(question.answerCreatedAt || question.questionCreatedAt)}
        </AppText>
      </View>

      <View style={styles.content}>
        {isInMyQuestions && !!question?.question ? (
          <AppText style={styles.questionText}>{question.question}</AppText>
        ) : null}

        <View style={styles.headingRow}>
          {!question?.answerId ? (
            <AppText namedStyle="h3" style={styles.headingText}>
              {question?.question}
            </AppText>
          ) : (
            <AppText namedStyle="h3" style={styles.headingText}>
              {question?.answerTitle}
            </AppText>
          )}

          {question?.answerId ? (
            <Like
              handleClick={handleLike}
              likes={question.likes || 0}
              dislikes={question.dislikes || 0}
              answerId={question.answerId}
              isLiked={question.isLiked}
              isDisliked={question.isDisliked}
            />
          ) : null}
        </View>

        {question?.tags?.length ? (
          <View style={styles.labelsContainer}>
            {question.tags.map((label, index) => {
              return (
                <Label
                  text={label}
                  key={index}
                  paletteIndex={index}
                  style={styles.labelChip}
                />
              );
            })}
          </View>
        ) : null}

        {!!question?.answerText ? (
          <AppText style={styles.answerText}>{question.answerText}</AppText>
        ) : null}

        {question?.answerId ? (
          <View style={styles.bottomContainer}>
            <View style={styles.answeredByContainer}>
              <AppText style={styles.answeredByText}>
                {t("answered_by")}
              </AppText>

              <TouchableOpacity
                onPress={() => providerId && handleProviderClick(providerId)}
                disabled={!providerId}
                hitSlop={appStyles.hitSlop}
              >
                <Avatar
                  image={imageUrl ? { uri: imageUrl } : undefined}
                  size="xs"
                  style={styles.avatar}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => providerId && handleProviderClick(providerId)}
                disabled={!providerId}
                hitSlop={appStyles.hitSlop}
              >
                <AppText style={styles.providerName}>
                  {providerInfo?.name} {providerInfo?.surname}
                </AppText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                onClose?.();
                handleSchedulePress?.(question);
              }}
              hitSlop={appStyles.hitSlop}
            >
              <View style={styles.scheduleButton}>
                <Icon name="calendar" color={appStyles.colorPrimary_20809e} />
                <AppText style={styles.scheduleButtonText}>
                  {t("schedule_consultation")}
                </AppText>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

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
  answerText: { marginTop: 18 },
  answeredByContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    flex: 1,
    paddingRight: 12,
  },
  answeredByText: { color: appStyles.colorGray_92989b },
  avatar: { marginHorizontal: 6 },
  content: {
    paddingTop: 14,
  },
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
  headingRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
  },
  headingText: {
    flex: 1,
  },
  labelsContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 6,
    marginTop: 10,
  },
  labelChip: {
    borderRadius: 4,
    paddingVertical: 2,
  },
  questionText: { marginTop: 6 },
  providerName: { marginTop: 0 },
  bottomContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  scheduleButton: { flexDirection: "row", alignItems: "center" },
  scheduleButtonText: {
    color: appStyles.colorPrimary_20809e,
    fontFamily: appStyles.fontBold,
    marginLeft: 12,
  },
});

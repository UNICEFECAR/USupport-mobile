import React from "react";
import Config from "react-native-config";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  Platform,
} from "react-native";

import { AppText } from "../../texts";
import { Icon, Like } from "../../icons";
import { Label } from "../../labels";
import { Avatar } from "../../avatars";
import { Line } from "../../separators";
import LinearGradient from "../../LinearGradient";
import { NewButton } from "../../buttons";

import { isDateToday } from "#utils";

import { appStyles } from "#styles";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useGetTheme } from "#hooks";

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
  const { colors, isHighContrast } = useGetTheme();
  const isLightTheme = colors.background === appStyles.colorWhite_ff;
  const providerInfo = question.providerData;
  const isAskedByCurrentClient = question.isAskedByCurrentClient;

  const imageUrl = AMAZON_S3_BUCKET + "/" + (providerInfo.image || "default");

  const canRenderExpoBlur = (() => {
    try {
      // expo-blur requires a native view manager registered as `ExpoBlurView`.
      // If the dev client hasn't been rebuilt with expo-blur, this will be missing.
      return !!UIManager.getViewManagerConfig?.("ExpoBlurView");
    } catch (e) {
      return false;
    }
  })();

  const shouldRenderBlur =
    !isHighContrast && Platform.OS !== "web" && canRenderExpoBlur;
  const BlurViewComponent = shouldRenderBlur
    ? // eslint-disable-next-line global-require
      require("expo-blur").BlurView
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
      }.${date.getFullYear()}`;
    }
  };

  return (
    <View
      style={[
        styles.answerOuter,
        isLightTheme
          ? appStyles.cardMediaShadowLight
          : appStyles.cardMediaShadowDark,
        style,
      ]}
    >
      <View
        style={[
          styles.answerSurface,
          {
            backgroundColor: isLightTheme
              ? shouldRenderBlur
                ? "transparent"
                : colors.cardMedia
              : "transparent",
            borderColor: colors.cardMediaBorder || "transparent",
          },
        ]}
      >
        {shouldRenderBlur && BlurViewComponent && (
          <>
            <BlurViewComponent
              style={styles.blurSurface}
              intensity={70}
              tint="default"
              blurReductionFactor={2}
              pointerEvents="none"
            />
            <View
              style={[
                styles.blurTintOverlay,
                { backgroundColor: colors.cardMedia },
              ]}
              pointerEvents="none"
            />
          </>
        )}

        {!isLightTheme && (
          <>
            <LinearGradient
              gradient={{
                degrees: 145,
                locations: [0, 1],
                colors: colors.cardMediaGradient || [
                  "rgba(30, 46, 86, 0.82)",
                  "rgba(19, 32, 65, 0.78)",
                ],
              }}
              style={styles.gradientSurface}
            />
            <View style={styles.insetHighlight} />
          </>
        )}
        {/* Match client-ui Answer card order */}
        <View style={styles.dateContainer}>
          <Icon
            name="calendar"
            color={isHighContrast ? "#ffff00" : "#92989B"}
          />
          <AppText
            namedStyle="text"
            style={[
              styles.dateContainerText,
              isHighContrast && styles.colorHighContrast,
            ]}
          >
            {getDateText(question.questionCreatedAt)}
          </AppText>
        </View>

        {!!question?.tags?.length && (
          <View style={styles.labelsContainer}>
            {question.tags.map((label, index) => (
              <Label
                text={label}
                key={index}
                style={styles.labelChip}
                paletteIndex={index}
              />
            ))}
          </View>
        )}

        {!!question.answerTitle ? (
          <>
            <AppText namedStyle="h3" style={styles.title} numberOfLines={2}>
              {question.answerTitle}
            </AppText>

            <AppText
              namedStyle="text"
              numberOfLines={2}
              style={styles.answerText}
            >
              {question.answerText}
            </AppText>

            <View style={styles.readMoreRow}>
              <NewButton
                label={t("read_more")}
                onPress={() => handleReadMore(question)}
                style={styles.readMoreButton}
              />
            </View>

            <View style={styles.authorRow}>
              <AppText namedStyle="text" style={styles.authorPrefix}>
                {t("answer_by")}
              </AppText>
              <TouchableWithoutFeedback
                onPress={() => handleProviderClick(providerInfo?.providerId)}
              >
                <Avatar
                  image={imageUrl && { uri: imageUrl }}
                  size="xs"
                  style={styles.avatar}
                />
              </TouchableWithoutFeedback>
              <AppText
                namedStyle="text"
                onPress={() => handleProviderClick(providerInfo?.providerId)}
                style={styles.authorName}
                numberOfLines={1}
              >
                {providerInfo?.name} {providerInfo?.surname}
              </AppText>
              <AppText namedStyle="text" style={styles.answeredDate}>
                {t("date_answered", {
                  date: getDateText(question.answerCreatedAt),
                })}
              </AppText>
            </View>

            <View style={styles.bottomRow}>
              <TouchableOpacity
                onPress={() => handleSchedulePress(question)}
                style={styles.scheduleTouchable}
              >
                <View style={styles.scheduleButton}>
                  <Icon
                    name="calendar"
                    color={isHighContrast ? "#ffff00" : "#8A4BF3"}
                  />
                  <AppText
                    namedStyle="text"
                    style={[
                      styles.scheduleText,
                      isHighContrast && styles.colorHighContrast,
                    ]}
                  >
                    {t("schedule_consultation")}
                  </AppText>
                </View>
              </TouchableOpacity>

              <View style={styles.likeContainer}>
                <Like
                  handleClick={handleLike}
                  likes={question.likes}
                  dislikes={question.dislikes}
                  answerId={question.answerId}
                  isLiked={question.isLiked}
                  isDisliked={question.isDisliked}
                />
              </View>
            </View>
          </>
        ) : (
          <>
            <AppText
              style={styles.marginTop_0_8}
              namedStyle="text"
              numberOfLines={2}
            >
              {question.question}
            </AppText>
            <Line style={styles.marginTop_0_8} />
            <View style={styles.readMoreRow}>
              <NewButton
                type="text"
                label={t("read_more")}
                onPress={() => handleReadMore(question)}
                style={styles.readMoreButton}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  answerOuter: {
    width: "96%",
    maxWidth: 420,
    alignSelf: "center",
    position: "relative",
    borderRadius: 24,
    overflow: "visible",
  },
  answerSurface: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "transparent",
    overflow: "hidden",
    position: "relative",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  blurSurface: {
    ...StyleSheet.absoluteFillObject,
  },
  blurTintOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientSurface: {
    ...StyleSheet.absoluteFillObject,
  },
  insetHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 2,
  },
  avatar: { marginHorizontal: 4 },
  dateContainer: { alignItems: "center", flexDirection: "row" },
  dateContainerText: { color: appStyles.colorGray_92989b, marginLeft: 4 },
  title: {
    marginTop: 12,
    marginBottom: 12,
    textAlign: "left",
    fontFamily: appStyles.fontSemiBold,
  },
  answerText: {
    textAlign: "left",
  },
  labelChip: {
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 4,
    paddingVertical: 2,
  },
  labelsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  marginTop_0_8: {
    marginTop: 8,
  },
  readMoreRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  readMoreButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignSelf: "flex-start",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    flexWrap: "wrap",
  },
  authorPrefix: {
    marginRight: 6,
  },
  authorName: {
    marginLeft: 4,
  },
  answeredDate: {
    marginLeft: 6,
  },
  bottomRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    flexWrap: "wrap",
  },
  scheduleTouchable: {
    flexShrink: 1,
  },
  scheduleButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeContainer: {
    marginLeft: "auto",
    flexShrink: 0,
  },
  scheduleText: {
    marginLeft: 8,
    fontFamily: appStyles.fontBold,
  },
  colorHighContrast: { color: "#ffff00" },
});

import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import Config from "react-native-config";

import { Avatar } from "../../avatars/Avatar/Avatar";
import { AppText } from "../../texts/AppText/AppText";
import { appStyles } from "#styles";
import { NewButton } from "../../buttons/NewButton/NewButton";
import {
  showToast,
  getDayOfTheWeek,
  getDateView,
  checkIsFiveMinutesBefore,
} from "#utils";
import { useGetTheme } from "#hooks";

const { AMAZON_S3_BUCKET } = Config;

/**
 * Consultation
 *
 * Consultation card component
 *
 * @return {jsx}
 */
export const Consultation = ({
  t,
  handleOpenEdit,
  handleOpenDetails,
  handleJoinClick,
  handleCancelConsultation,
  handleAcceptConsultation,
  handleRejectConsultation,
  handleViewProfile,
  hasPriceBadge = true,
  consultation,
  currencySymbol,
  overview,
  suggested,
  onPress,
  style,
}) => {
  const {
    providerId,
    clientDetailId,
    consultationId,
    timestamp,
    image,
    status,
    price,
    sponsorImage,
  } = consultation;
  const { colors, isDarkMode } = useGetTheme();
  const renderIn = "client";

  const name = consultation.providerName || consultation.clientName;

  const imageUrl = AMAZON_S3_BUCKET + "/" + (image || "default");

  const startDate = new Date(timestamp);
  const endDate = new Date(
    new Date(timestamp).setHours(new Date(timestamp).getHours() + 1)
  );
  const dayOfWeek = t(getDayOfTheWeek(startDate));
  const dateText = `${dayOfWeek} ${getDateView(startDate).slice(0, 5)}`;

  const today = new Date().getTime();
  const isFiveMinutesBefore = checkIsFiveMinutesBefore(timestamp);

  let buttonLabel, buttonAction;
  if (isFiveMinutesBefore) {
    buttonLabel = t("join");
    buttonAction = "join";
  } else if (today > endDate) {
    // If the consultation is in the past
    buttonLabel = t("details");
    buttonAction = "details";
  } else {
    buttonLabel = renderIn === "client" ? t("edit") : t("cancel_consultation");
    buttonAction = renderIn === "client" ? "edit" : "cancel";
  }

  const startHour = startDate.getHours();
  const endHour = endDate.getHours();
  const timeText = startDate
    ? `${startHour < 10 ? `0${startHour}` : startHour}:00 - ${
        endHour < 10 ? `0${endHour}` : endHour
      }:00`
    : "";

  const handleAcceptConsultationPress = () => {
    handleAcceptConsultation(consultationId, price, timestamp);
  };

  const handleRejectConsultationPress = () => {
    handleRejectConsultation(consultationId);
  };

  const handleJoin = () => {
    handleJoinClick(consultation);
  };

  const handleEdit = () => {
    handleOpenEdit(consultation);
  };

  const handleSeeDetails = () => {
    handleOpenDetails(consultation);
  };

  const handleCancel = () => {
    handleCancelConsultation(consultation);
  };

  return (
    <Pressable onPress={onPress} style={styles.touchableOpacity}>
      <View
        style={[
          styles.consultation,
          { backgroundColor: colors.card },
          style,
          buttonAction === "join" && styles.borderColorPurple,
          { ...appStyles.shadow2 },
        ]}
      >
        {/* {hasPriceBadge && (
          <View
            style={[
              styles.priceBadge,
              (consultation.campaignId || !price) && styles.priceBadgeFreeColor,
            ]}
          >
            {sponsorImage ? (
              <Image
                style={styles.sponsorImage}
                resizeMode="contain"
                source={{
                  uri:
                    AMAZON_S3_BUCKET +
                    "/" +
                    (sponsorImage || "default-sponsor"),
                }}
              />
            ) : null}
            <AppText
              namedStyle="smallText"
              style={[
                styles.textPurple,
                (consultation.campaignId || !price) &&
                  styles.priceBadgeFreeText,
                isDarkMode && { color: appStyles.colorWhite_ff },
                sponsorImage && { marginLeft: 30 },
              ]}
            >
              {price && !consultation.campaignId
                ? `${price}${currencySymbol}`
                : t("free")}
            </AppText>
          </View>
        )} */}
        <View style={styles.content}>
          <View>
            <Avatar image={{ uri: imageUrl }} size="md" />
          </View>
          <View style={styles.textContainer}>
            <AppText style={[styles.dateText, { color: colors.text }]}>
              {dateText}
            </AppText>
            <AppText style={[styles.timeText, { color: colors.text }]}>
              {buttonAction === "join" ? t("active") : timeText}
            </AppText>
            <AppText style={styles.nameText}>{name}</AppText>
          </View>
        </View>
        {!overview && !suggested && buttonAction === "join" && (
          <View style={styles.buttonContainer}>
            {/* <AppText style={styles.textPurple}>{t("active")}</AppText> */}
            <NewButton
              onPress={handleJoin}
              label={buttonLabel}
              type="solid"
              isFullWidth
            />
          </View>
        )}
        {!overview && suggested && renderIn === "client" && (
          <View style={styles.requestContainer}>
            <NewButton
              onPress={handleAcceptConsultationPress}
              label={t("accept")}
              type="solid"
              size="sm"
              style={{ width: "49%" }}
            />
            <NewButton
              onPress={handleRejectConsultationPress}
              label={t("reject")}
              type="outline"
              size="sm"
              style={{ width: "49%" }}
            />
          </View>
        )}

        {!overview && !suggested && buttonAction === "edit" && (
          <View style={styles.editButtonsContainer}>
            <Pressable
              onPress={() =>
                showToast({
                  message: t("join_button_label_tooltip"),
                  type: "info",
                })
              }
              style={{ width: "49%" }}
            >
              <NewButton size="sm" label={t("join")} disabled />
            </Pressable>
            <NewButton
              size="sm"
              onPress={handleEdit}
              label={buttonLabel}
              type="outline"
              style={{ width: "49%" }}
            />
          </View>
        )}

        {!overview && !suggested && buttonAction === "cancel" && (
          <View style={styles.buttonContainer}>
            <NewButton
              onPress={handleCancel}
              label={buttonLabel}
              type="outline"
              size="sm"
              isFullWidth
            />
          </View>
        )}

        {!overview && !suggested && buttonAction === "details" && (
          <View style={styles.buttonContainer}>
            {renderIn === "client" && status === "finished" ? (
              <NewButton
                onPress={handleSeeDetails}
                label={buttonLabel}
                type="outline"
                size="sm"
                isFullWidth
              />
            ) : (
              <AppText namedStyle="smallText">
                {status === "finished" ? t("conducted") : t("not_conducted")}
              </AppText>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  borderColorPurple: {
    borderColor: appStyles.colorSecondary_9749fa,
  },
  buttonContainer: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    paddingTop: 8,
    width: "100%",
  },
  consultation: {
    alignItems: "center",
    backgroundColor: appStyles.colorWhite_ff,
    borderColor: "transparent",
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 420,
    padding: 12,
    textAlign: "left",
    width: "100%",
  },
  content: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
  },
  dateText: {
    fontFamily: appStyles.fontBold,
    fontSize: 14,
  },
  editButtonsContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginTop: 10,
    width: "100%",
  },
  nameText: {
    fontFamily: appStyles.fontRegular,
    fontSize: 14,
    color: appStyles.colorBlue_6989a4,
  },
  priceBadge: {
    alignItems: "center",
    backgroundColor: appStyles.colorPurple_dac3f6,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    maxHeight: 30,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  priceBadgeFreeColor: {
    backgroundColor: appStyles.colorSecondary_9749fa,
  },
  priceBadgeFreeText: {
    color: appStyles.colorWhite_ff,
  },
  requestContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    width: "100%",
  },
  sponsorImage: {
    alignSelf: "flex-start",
    borderRadius: 25 / 2,
    height: 25,
    left: 0,
    position: "absolute",
    width: 25,
  },
  textContainer: {
    flexShrink: 1,
    flexGrow: 1,
    paddingLeft: 16,
  },
  textPurple: {
    color: appStyles.colorSecondary_9749fa,
  },
  timeText: {
    fontFamily: appStyles.fontRegular,
    fontSize: 14,
  },
  touchableOpacity: { alignItems: "center", width: "100%" },
});

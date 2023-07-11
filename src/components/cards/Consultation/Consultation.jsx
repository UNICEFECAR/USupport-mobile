import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";

import { Avatar } from "../../avatars/Avatar/Avatar";
import { AppText } from "../../texts/AppText/AppText";
import { appStyles } from "#styles";
import { Icon } from "../../icons/Icon";
import { AppButton } from "../../buttons/AppButton/AppButton";

import Config from "react-native-config";
const { AMAZON_S3_BUCKET } = Config;
import { getDayOfTheWeek, getDateView, checkIsFiveMinutesBefore } from "#utils";

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

  const handleAccepConsultationPress = () => {
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
          style,
          buttonAction === "join" && styles.borderColorPurple,
          { ...appStyles.shadow2 },
        ]}
      >
        <View style={styles.content}>
          <View>
            <Avatar image={{ uri: imageUrl }} size="md" />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.nameContainer}>
              <AppText
                style={[
                  styles.text,
                  buttonAction === "join" && styles.textPurple,
                ]}
              >
                {name}
              </AppText>
              {hasPriceBadge && (
                <View
                  style={[
                    styles.priceBadge,
                    (consultation.campaignId || !price) &&
                      styles.priceBadgeFreeColor,
                    { flexDirection: "row" },
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
                      sponsorImage && { marginLeft: 30 },
                    ]}
                  >
                    {price && !consultation.campaignId
                      ? `${price}${currencySymbol}`
                      : t("free")}
                  </AppText>
                </View>
              )}
            </View>
            <View style={styles.dateContainer}>
              <Icon
                name="calendar"
                size="sm"
                color={
                  buttonAction === "join"
                    ? appStyles.colorSecondary_9749fa
                    : appStyles.colorGray_66768d
                }
                style={styles.calendarIcon}
              />
              <View>
                <AppText namedStyle="smallText">{dateText}</AppText>
                <AppText namedStyle="smallText">{timeText}</AppText>
              </View>
            </View>
          </View>
        </View>
        {!overview && !suggested && buttonAction === "join" && (
          <View
            style={[
              styles.buttonContainer,
              { flexDirection: "row", justifyContent: "center" },
            ]}
          >
            <AppText style={[styles.textPurple]}>{t("active")}</AppText>
            <AppButton
              onPress={() => handleJoin()}
              label={buttonLabel}
              color={"purple"}
              size="sm"
              style={styles.joinButton}
            />
          </View>
        )}
        {!overview && suggested && renderIn === "client" && (
          <View style={styles.requestContainer}>
            <AppButton
              onPress={handleAccepConsultationPress}
              label={t("accept")}
              size="sm"
            />
            <AppButton
              onPress={handleRejectConsultationPress}
              label={t("reject")}
              type="secondary"
              size="sm"
            />
          </View>
        )}

        {!overview && !suggested && buttonAction === "edit" && (
          <View style={styles.buttonContainer}>
            <AppButton
              onPress={handleEdit}
              label={buttonLabel}
              size="sm"
              type="secondary"
              style={styles.oneButton}
            />
          </View>
        )}

        {!overview && !suggested && buttonAction === "cancel" && (
          <View style={styles.buttonContainer}>
            <AppButton
              onPress={handleCancel}
              label={buttonLabel}
              size="sm"
              type="secondary"
              style={styles.oneButton}
            />
          </View>
        )}

        {!overview && !suggested && buttonAction === "details" && (
          <View style={styles.buttonContainer}>
            {renderIn === "client" && status === "finished" ? (
              <AppButton
                onPress={handleSeeDetails}
                label={buttonLabel}
                size="sm"
                type="secondary"
                style={styles.oneButton}
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
  touchableOpacity: { width: "100%", alignItems: "center" },
  consultation: {
    padding: 16,
    alignItems: "center",
    width: "100%",
    maxWidth: 420,
    textAlign: "left",
    backgroundColor: appStyles.colorWhite_ff,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  borderColorPurple: {
    borderColor: appStyles.colorSecondary_9749fa,
  },
  content: {
    flexDirection: "row",
    width: "100%",
  },
  textContainer: { paddingLeft: 16, flexGrow: 1 },
  dateContainer: { flexDirection: "row", alignItems: "center" },
  calendarIcon: { marginRight: 8 },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceBadge: {
    alignItems: "center",
    backgroundColor: appStyles.colorPurple_dac3f6,
    borderRadius: 16,
    display: "flex",
    justifyContent: "center",
    marginRight: 14,
    marginLeft: 3,
    maxHeight: 30,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-end",
  },
  priceBadgeFreeColor: {
    backgroundColor: "rgba(32, 128, 158, 0.3)",
  },
  priceBadgeFreeText: {
    color: appStyles.colorPrimary_20809e,
  },
  buttonContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 8,
  },
  requestContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingTop: 8,
  },
  joinButton: { marginRight: "auto", marginLeft: "auto" },

  text: {
    color: appStyles.colorBlue_3d527b,
    fontFamily: appStyles.fontBold,
  },
  textPurple: {
    color: appStyles.colorSecondary_9749fa,
  },
  oneButton: { minWidth: 120 },
  sponsorImage: {
    width: 25,
    height: 25,
    borderRadius: 25 / 2,
    alignSelf: "flex-start",
    position: "absolute",
    left: 0,
  },
});

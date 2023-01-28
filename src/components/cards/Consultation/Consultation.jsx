import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import { Avatar } from "../../avatars/Avatar/Avatar";
import { AppText } from "../../texts/AppText/AppText";
import { appStyles } from "#styles";
import { Icon } from "../../icons/Icon";
import { AppButton } from "../../buttons/AppButton/AppButton";

import { AMAZON_S3_BUCKET } from "@env";
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
  overview,
  suggested,
  onPress,
  style,
}) => {
  const { providerId, consultationId, timestamp, image, status, price } =
    consultation;

  const renderIn = "client";

  console.log(consultation);
  //   const isPast = consultation
  //     ? new Date(timestamp).getTime() < new Date().getTime()
  //     : false;

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

  console.log(buttonAction);

  const startHour = startDate.getHours();
  const endHour = endDate.getHours();
  const timeText = startDate
    ? `${startHour < 10 ? `0${startHour}` : startHour}:00 - ${
        endHour < 10 ? `0${endHour}` : endHour
      }:00`
    : "";

  const handleAccepConsultationPress = () => {
    handleAcceptConsultation(consultationId);
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
  console.log(suggested, overview, renderIn);
  return (
    <TouchableOpacity onPress={onPress} style={styles.touchableOpacity}>
      <View
        style={[
          styles.consultation,
          style,
          buttonAction === "join" && styles.borderColorPurple,
          { ...appStyles.shadow2 },
        ]}
      >
        <View style={styles.content}>
          <Avatar image={{ uri: imageUrl }} size="md" />
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
                <View style={styles.priceBadge}>
                  <AppText namedStyle="smallText" style={styles.textPurple}>
                    {price || "Free"}
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
              />
            ) : (
              <AppText namedStyle="smallText">
                {status === "finished" ? t("conducted") : t("not_conducted")}
              </AppText>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
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
  textContainer: { paddingLeft: 16 },
  dateContainer: { flexDirection: "row", alignItems: "center" },
  calendarIcon: { marginRight: 8 },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  priceBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appStyles.colorPurple_dac3f6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginRight: 14,
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
    // wordBreak: "break-word",
  },
  textPurple: {
    color: appStyles.colorSecondary_9749fa,
  },
});

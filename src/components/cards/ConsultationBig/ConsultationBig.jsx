import React from "react";
import { View, StyleSheet, Image } from "react-native";

import { AppText } from "../../texts/AppText/AppText";
import { AppButton } from "../../buttons/AppButton/AppButton";
import { Avatar } from "../../avatars/Avatar/Avatar";
import LinearGradient from "../../LinearGradient";
import { appStyles } from "#styles";
import {
  checkIsFiveMinutesBefore,
  getDateView,
  getMonthName,
  getOrdinal,
} from "#utils";
import { mascotHappyBlue } from "#assets";
import Config from "react-native-config";
const { AMAZON_S3_BUCKET } = Config;

/**
 * CardConsultationBig
 *
 * CardConsultationBig component
 *
 * @return {jsx}
 */
export const ConsultationBig = ({
  consultation,
  style,
  handleJoin,
  handleChange,
  handleAcceptSuggestion,
  t,
}) => {
  const { providerName, timestamp, image, status, price } = consultation;
  const imageUrl = AMAZON_S3_BUCKET + "/" + (image || "default");

  const isLive = checkIsFiveMinutesBefore(timestamp);

  const startDate = new Date(timestamp);
  const ordinal = getOrdinal(startDate?.getDate());

  const dateText = `${getDateView(startDate).slice(0, 2)}${t(ordinal)} ${t(
    getMonthName(startDate).toLowerCase()
  )}`;

  const time = startDate.getHours();
  const timeText = startDate ? `${time < 10 ? `0${time}` : time}:00` : "";

  return (
    <LinearGradient
      gradient={appStyles.gradientConsultationBig}
      style={styles.linearGradient}
    >
      <View style={[styles.container, style]}>
        <View>
          {isLive ? (
            <AppText namedStyle="smallText" style={styles.nowText}>
              {t("live_text")}
            </AppText>
          ) : (
            <AppText namedStyle="smallText">
              {dateText}, {timeText}
            </AppText>
          )}
          <View style={styles.providerContainer}>
            <Avatar
              image={image && { uri: imageUrl }}
              size="sm"
              style={styles.avatar}
            />
            <AppText style={styles.providerNameText}>{providerName}</AppText>
          </View>
          {status === "suggested" ? (
            <AppButton
              type="primary"
              size="sm"
              onPress={() =>
                handleAcceptSuggestion(
                  consultation.consultationId,
                  price,
                  timestamp
                )
              }
              label={t("accept_button_label")}
              style={styles.button}
            />
          ) : isLive ? (
            <AppButton
              label={t("join_button_label")}
              color="purple"
              style={styles.button}
              onPress={() => handleJoin(consultation)}
            />
          ) : (
            <AppButton
              label={t("change_button_label")}
              type="secondary"
              color="purple"
              style={styles.button}
              onPress={() => handleChange(consultation)}
            />
          )}
        </View>
        <Image
          source={mascotHappyBlue}
          style={[
            styles.imageMascot,
            appStyles.screenWidth < 350 && styles.imageMascotSmall,
          ]}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  linearGradient: {
    borderRadius: 24,
    marginHorizontal: 4,
  },
  container: {
    padding: 16,
    flexDirection: "row",
    width: "96%",
    maxWidth: 420,
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 24,
  },
  nowText: {
    color: appStyles.colorSecondary_9749fa,
    fontFamily: appStyles.fontBold,
  },
  providerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  avatar: { marginRight: 8 },
  providerNameText: {
    color: appStyles.colorBlue_3d527b,
    fontFamily: appStyles.fontBold,
    wordBreak: "break-all",
    textAlign: "left",
    flex: 1,
  },
  button: { marginTop: 16 },
  imageMascot: { width: 128, height: 100 },
  imageMascotSmall: { width: 100, resizeMode: "contain" },
});

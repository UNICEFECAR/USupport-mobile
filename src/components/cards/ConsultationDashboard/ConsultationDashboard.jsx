import React from "react";
import { View, StyleSheet, Image } from "react-native";

import { AppText } from "../../texts/AppText/AppText";
import { AppButton } from "../../buttons/AppButton/AppButton";
import { appStyles } from "#styles";

import {
  checkIsFiveMinutesBefore,
  getDateView,
  getMonthName,
  getOrdinal,
} from "#utils";
import Config from "react-native-config";
import { useGetTheme } from "#hooks";
const { AMAZON_S3_BUCKET } = Config;

/**
 * ConsultationDashboard
 *
 * ConsultationDashboard component
 *
 * @return {jsx}
 */
export const ConsultationDashboard = ({
  style,
  consultation,
  handleJoin,
  handleEdit,
  handleAcceptSuggestion,
  handleSchedule,
  t,
}) => {
  const { colors } = useGetTheme();
  const { providerName, timestamp, image, status, price } = consultation || {};
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
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card },
        style,
        { ...appStyles.shadow2 },
      ]}
    >
      {consultation ? (
        <View className="consultation-dashboard__content">
          {isLive ? (
            <AppText namedStyle="smallText" style={styles.nowText}>
              {t("live_label")}
            </AppText>
          ) : (
            <AppText
              namedStyle="smallText"
              style={{ color: colors.textSecondary }}
            >{`${dateText} ${timeText}`}</AppText>
          )}
          <View style={styles.providerContainer}>
            <Image source={{ uri: imageUrl }} style={styles.providerImage} />
            <AppText style={[styles.providerNameText, { color: colors.text }]}>
              {providerName}
            </AppText>
          </View>
          {status === "suggested" ? (
            <AppButton
              type="primary"
              label={t("accept_button_label")}
              size="sm"
              onPress={() =>
                handleAcceptSuggestion(
                  consultation.consultationId,
                  price,
                  timestamp
                )
              }
              style={styles.marginTop8}
            />
          ) : isLive ? (
            <AppButton
              label={t("join_button_label")}
              color="purple"
              size="sm"
              classes="consultation-dashboard__button"
              onPress={() => handleJoin(consultation)}
              style={styles.marginTop8}
            />
          ) : (
            <AppButton
              label={t("change_button_label")}
              type="secondary"
              size="sm"
              color="purple"
              onPress={() => handleEdit(consultation)}
              style={styles.marginTop8}
            />
          )}
        </View>
      ) : (
        <View style={styles.marginTop8}>
          <AppText namedStyle="smallText" style={styles.noConsultationText}>
            {t("no_consultations")}
          </AppText>
          <AppButton
            size="sm"
            label={t("schedule_button_label")}
            color="purple"
            onPress={handleSchedule}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "column",
    width: 200,
    borderRadius: 16,
    alignItems: "center",
  },
  providerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  providerImage: {
    width: 32,
    height: 32,
    objectFit: "cover",
    borderRadius: 16,
    marginRight: 8,
  },
  nowText: {
    color: appStyles.colorSecondary_9749fa,
    fontFamily: appStyles.fontBold,
  },
  providerNameText: {
    color: appStyles.colorBlue_3d527b,
    fontFamily: appStyles.fontBold,
    wordBreak: "break-word",
  },
  noConsultationText: { marginBottom: 16 },
  marginTop8: { marginTop: 8, alignSelf: "center" },
});

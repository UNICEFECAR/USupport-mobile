import { View, StyleSheet, Pressable } from "react-native";
import Config from "react-native-config";

import { AppText } from "../../texts/AppText/AppText";
import { AppButton } from "../../buttons/AppButton/AppButton";
import { Avatar } from "../../avatars/Avatar/Avatar";
import LinearGradient from "../../LinearGradient";
import { appStyles } from "#styles";
import { CachedImage } from "../../images";
import {
  checkIsFiveMinutesBefore,
  getDateView,
  getMonthName,
  getOrdinal,
  showToast,
} from "#utils";

import { useGetTheme } from "#hooks";
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
  const { colors } = useGetTheme();
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
            <AppText
              namedStyle="smallText"
              style={{ color: colors.textSecondary }}
            >
              {dateText}, {timeText}
            </AppText>
          )}
          <View style={styles.providerContainer}>
            <Avatar
              image={image && { uri: imageUrl }}
              size="sm"
              style={styles.avatar}
            />
            <AppText
              style={[styles.providerNameText, { color: colors.text }]}
              numberOfLines={3}
            >
              {providerName}
            </AppText>
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
            <View style={styles.editButtonsContainer}>
              <Pressable
                onPress={() =>
                  showToast({
                    message: t("join_button_label_tooltip"),
                    type: "info",
                  })
                }
              >
                <AppButton
                  label={t("join_button_label")}
                  color="purple"
                  onPress={() => handleJoin(consultation)}
                  disabled
                />
              </Pressable>
              <AppButton
                label={t("change_button_label")}
                type="secondary"
                color="purple"
                onPress={() => handleChange(consultation)}
              />
            </View>
          )}
        </View>
        <CachedImage
          source={{ uri: `${AMAZON_S3_BUCKET}/mascot-happy-blue` }}
          style={[
            styles.imageMascot,
            appStyles.screenWidth < 350 && styles.imageMascotSmall,
          ]}
          resizeMode="contain"
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  avatar: { marginRight: 8 },
  button: { marginTop: 16 },
  container: {
    alignItems: "center",
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    maxWidth: 420,
    padding: 16,
    width: "96%",
  },
  editButtonsContainer: {
    alignSelf: "center",
    flexDirection: "column",
    gap: 8,
    marginTop: 8,
  },
  imageMascot: { height: 100, width: 128 },
  imageMascotSmall: { width: 100 },
  linearGradient: {
    borderRadius: 24,
    marginHorizontal: 4,
  },
  nowText: {
    color: appStyles.colorSecondary_9749fa,
    fontFamily: appStyles.fontBold,
  },
  providerContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 8,
  },
  providerNameText: {
    color: appStyles.colorBlue_3d527b,
    flex: 1,
    fontFamily: appStyles.fontBold,
    textAlign: "left",
    wordBreak: "break-all",
  },
});

import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet } from "react-native";

import { Avatar } from "../../avatars";
import { Icon } from "../../icons";
import { AppText } from "../../texts";

import { appStyles } from "#styles";

import { getDayOfTheWeek, getDateView } from "#utils";
import { specialistPlaceholder } from "#assets";
import Config from "react-native-config";
import { IconWifiOff, IconWifiOn } from "../../icons/assets/sprite";
// import { IconCheckCircle, IconForbidden } from "../../icons/assets/sprite";
import { useGetTheme } from "#hooks";
const { AMAZON_S3_BUCKET } = Config;

/**
 * ConsultationInformation
 *
 * ConsultationInformation
 *
 * @return {jsx}
 */
export const ConsultationInformation = ({
  startDate,
  endDate,
  providerName,
  providerImage = specialistPlaceholder,
  price,
  currencySymbol,
  style,
  showPriceBadge = true,
  isProviderInSession = false,
  t,
}) => {
  const { colors, isDarkMode } = useGetTheme();
  const dayOfWeek = t(getDayOfTheWeek(startDate));
  const dateText = `${dayOfWeek} ${getDateView(startDate).slice(0, 5)}`;

  const imageUrl = AMAZON_S3_BUCKET + "/" + (providerImage || "default");

  const startHour = startDate.getHours();
  const endHour = endDate.getHours();
  const timeText = startDate
    ? `${startHour < 10 ? `0${startHour}` : startHour}:00 - ${
        endHour < 10 ? `0${endHour}` : endHour
      }:00`
    : "";

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inormationContainer}>
        <Avatar image={imageUrl && { uri: imageUrl }} size="md" />
        <View style={styles.content}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <AppText style={[styles.nameText, { color: colors.text }]}>
              {providerName}
            </AppText>
            <View
              style={{
                // width: 16,
                // height: 16,
                borderRadius: 8,
                padding: 3,
                justifyContent: "center",
                alignItems: "center",

                backgroundColor: isProviderInSession
                  ? appStyles.colorGreen_7ec680
                  : "red",
              }}
            >
              {isProviderInSession ? <IconWifiOn /> : <IconWifiOff />}
            </View>
          </View>
          <View style={styles.dateContainer}>
            <Icon name="calendar" size="sm" color={colors.textSecondary} />
            <View style={styles.dateContainerContent}>
              <AppText
                namedStyle="smallText"
                style={{ color: colors.textSecondary }}
              >
                {dateText}
              </AppText>
              <AppText
                namedStyle="smallText"
                style={{ color: colors.textSecondary }}
              >
                {timeText}
              </AppText>
            </View>
          </View>
        </View>
      </View>
      {showPriceBadge ? (
        <View style={styles.priceBadgeContainer}>
          <View
            style={[styles.priceBadge, !price && styles.priceBadgeFreeColor]}
          >
            <AppText
              namedStyle="smallText"
              style={[
                styles.priceBadgeText,
                !price && styles.priceBadgeFreeText,
                isDarkMode && { color: colors.text },
              ]}
            >
              {price > 0 ? `${price}${currencySymbol}` : t("free")}
            </AppText>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  inormationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  content: { marginLeft: 16 },
  nameText: {
    color: appStyles.colorBlue_3d527b,
    fontFamily: appStyles.fontBold,
    marginRight: 10,
  },
  dateContainer: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  dateContainerContent: { marginLeft: 6 },
  priceBadge: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appStyles.colorPurple_dac3f6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  priceBadgeText: {
    color: appStyles.colorSecondary_9749fa,
  },
  priceBadgeFreeColor: {
    backgroundColor: "rgba(32, 128, 158, 0.3)",
  },
  priceBadgeFreeText: {
    color: appStyles.colorPrimary_20809e,
  },
});

ConsultationInformation.propTypes = {
  /**
   * Start date of the consultation
   */
  startDate: PropTypes.instanceOf(Date),

  /**
   * End date of the consultation
   * */
  endDate: PropTypes.instanceOf(Date),

  /**
   * Name of the provider
   * */
  providerName: PropTypes.string,

  /**
   * Additional classes
   * */
  classes: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
};

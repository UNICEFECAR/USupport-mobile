import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet } from "react-native";

import { Avatar } from "../../avatars";
import { Icon } from "../../icons";
import { AppText } from "../../texts";

import { appStyles } from "#styles";

import { getDayOfTheWeek, getDateView } from "#utils";
import { specialistPlaceholder } from "#assets";
import { AMAZON_S3_BUCKET } from "@env";

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
  t,
}) => {
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
          <AppText style={styles.nameText}>{providerName}</AppText>
          <View style={styles.dateContainer}>
            <Icon
              name="calendar"
              size="sm"
              color={appStyles.colorGray_66768d}
            />
            <View style={styles.dateContainerContent}>
              <AppText namedStyle="smallText">{dateText}</AppText>
              <AppText namedStyle="smallText">{timeText}</AppText>
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

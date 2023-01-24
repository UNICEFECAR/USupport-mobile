import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Avatar } from "../../avatars/Avatar/Avatar";
import { Icon } from "../../icons/Icon";
import { AppText } from "../../texts/AppText/AppText";

import { getDayOfTheWeek, getDateView } from "#utils";

import { appStyles } from "#styles";

import { AMAZON_S3_BUCKET } from "@env";

/**
 * ProviderOverview
 *
 * PorviderOverview component
 *
 * @return {jsx}
 */
export const ProviderOverview = ({
  image,
  name,
  patronym,
  surname,
  specializations,
  viewProfileLabel,
  freeLabel,
  price,
  editLabel,
  deleteLabel,
  earliestAvailableSlot,
  earliestAvailableSlotLabel,
  onClick,
  t,
  handleEdit,
  handleDelete,
  handleViewProfile,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const displayName = patronym
    ? `${name} ${patronym} ${surname}`
    : `${name} ${surname}`;

  const imageURI = AMAZON_S3_BUCKET + "/" + image;

  const startDate = new Date(earliestAvailableSlot);
  const endDate = new Date(
    new Date(earliestAvailableSlot).setHours(
      new Date(earliestAvailableSlot).getHours() + 1
    )
  );
  const dayOfWeek = t(getDayOfTheWeek(startDate));
  const dateText = `${dayOfWeek} ${getDateView(startDate).slice(0, 5)}`;

  const startHour = startDate.getHours();
  const endHour = endDate.getHours();
  const timeText = startDate
    ? `${startHour < 10 ? `0${startHour}` : startHour}:00 - ${
        endHour < 10 ? `0${endHour}` : endHour
      }:00`
    : "";

  const handleIconClick = () => {
    if (hasMenu) {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  return (
    <View
      style={[styles.providerOverview, { ...appStyles.shadow2 }]}
      classes={["provider-overview"].join(" ")}
    >
      <Avatar image={{ uri: imageURI }} size="md" />
      <View style={styles.content}>
        <View style={styles.textContent}>
          <View style={styles.textContainer}>
            <View style={styles.nameContainer}>
              <AppText style={styles.nameText}>{displayName}</AppText>
              <View
                style={styles.priceBadge}
                className={[
                  !price &&
                    "provider-overview__content__text-content__name-container__price-badge--free",
                ].join(" ")}
              >
                <AppText namedStyle="smallText" style={styles.priceBadgeText}>
                  {price || freeLabel}
                </AppText>
              </View>
            </View>
          </View>
          <AppText namedStyle="smallText" style={styles.typesText}>
            {t("earliest_available_slot")}
          </AppText>
          <View style={styles.dateContainer}>
            <Icon
              name="calendar"
              size="sm"
              color={appStyles.colorGray_66768d}
              style={styles.calendarIcon}
            />
            <View className="consultation__content__text-container__date-container__text">
              <AppText namedStyle="smallText">{dateText}</AppText>
              <AppText namedStyle="smallText">{timeText}</AppText>
            </View>
          </View>
        </View>
        <View>
          <Icon
            name="arrow-chevron-forward"
            color={appStyles.colorPrimary_20809e}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  providerOverview: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    textAlign: "left",
    width: "96%",
    maxWidth: 420,
    backgroundColor: appStyles.colorWhite_ff,
    borderRadius: 16,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: 16,
    maxWidth: "71%",
  },
  textContent: {
    paddingRight: 10,
    width: "100%",
  },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexGrow: 1,
  },
  priceBadge: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appStyles.colorPurple_dac3f6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  priceBadgeText: {
    color: appStyles.colorSecondary_9749fa,
  },
  dateContainer: { flexDirection: "row", alignItems: "center" },
  nameText: {
    color: appStyles.colorPrimary_20809e,
    wordBreak: "break-word",
    fontFamily: "Nunito_700Bold",
  },
  typesText: {
    wordBreak: "break-word",
  },
  calendarIcon: { marginRight: 8 },
});

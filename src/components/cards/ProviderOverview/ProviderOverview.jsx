import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Config from "react-native-config";

import { Avatar } from "../../avatars/Avatar/Avatar";
import { Icon } from "../../icons/Icon";
import { AppText } from "../../texts/AppText/AppText";
import { NewButton } from "../../buttons/NewButton/NewButton";
import { getDayOfTheWeek, getDateView } from "#utils";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";
const { AMAZON_S3_BUCKET } = Config;

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
  freeLabel,
  price,
  earliestAvailableSlot,
  onPress,
  handleViewProfile,
  handleBookSession,
  viewProfileLabel = "View profile",
  bookSessionLabel = "Book session",
  t,
  currencySymbol,
  specializations,
  style,
}) => {
  const { colors, isDarkMode } = useGetTheme();
  const displayName = patronym
    ? `${name} ${patronym} ${surname}`
    : `${name} ${surname}`;

  const imageURI = AMAZON_S3_BUCKET + "/" + image;

  const earliestSlot = earliestAvailableSlot
    ? new Date(earliestAvailableSlot)
    : null;
  const dayOfWeek = earliestSlot && t ? t(getDayOfTheWeek(earliestSlot)) : "";
  const dateText =
    earliestSlot && dayOfWeek
      ? `${dayOfWeek} ${getDateView(earliestSlot).slice(0, 5)}`
      : "";

  const startHour = earliestSlot?.getHours();
  const endHour = startHour != null ? startHour + 1 : null;
  const timeText =
    startHour != null && endHour != null
      ? `${startHour < 10 ? `0${startHour}` : startHour}:00 - ${
          endHour < 10 ? `0${endHour}` : endHour
        }:00`
      : "";

  const resolvedViewProfile = handleViewProfile || onPress;
  const showActions = !!resolvedViewProfile || !!handleBookSession;

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.providerOverview,
          { backgroundColor: colors.card },
          { ...appStyles.shadow2 },
        ]}
      >
        <Pressable
          disabled={!resolvedViewProfile}
          onPress={resolvedViewProfile}
          style={styles.top}
        >
          <Avatar image={{ uri: imageURI }} size="md" />
          <View style={styles.topTextContainer}>
            <View style={styles.nameRow}>
              <AppText style={[styles.nameText, { color: colors.text }]}>
                {displayName}
              </AppText>
              {!price && (
                <View
                  style={[styles.freeBadge, isDarkMode && styles.freeBadgeDark]}
                >
                  <AppText
                    namedStyle="smallText"
                    style={[
                      styles.freeBadgeText,
                      isDarkMode && { color: colors.text },
                    ]}
                  >
                    {freeLabel}
                  </AppText>
                </View>
              )}
            </View>
            {!!specializations?.length && (
              <AppText
                namedStyle="smallText"
                style={{ paddingTop: 4, color: colors.textSecondary }}
              >
                {specializations.join(", ")}
              </AppText>
            )}
          </View>
        </Pressable>

        {!!earliestAvailableSlot && (
          <View style={[styles.bottom, { borderTopColor: colors.inputBorder }]}>
            <AppText
              namedStyle="smallText"
              style={{ color: colors.textSecondary, paddingBottom: 8 }}
            >
              {t ? t("earliest_available_slot") : "Earliest available slot"}
            </AppText>
            <View style={styles.earliestRow}>
              <Icon
                name="calendar"
                size="sm"
                color={appStyles.colorGray_66768d}
              />
              <AppText
                isBold
                namedStyle="smallText"
                style={[styles.earliestBold, { color: colors.text }]}
              >
                {dateText}
              </AppText>
            </View>
            <View style={styles.earliestRow}>
              <Icon name="time" size="sm" color={appStyles.colorGray_66768d} />
              <AppText
                isBold
                namedStyle="smallText"
                style={[styles.earliestBold, { color: colors.text }]}
              >
                {timeText}
              </AppText>
            </View>
          </View>
        )}

        {showActions && (
          <View
            style={[styles.actions, { borderTopColor: colors.inputBorder }]}
          >
            <View style={styles.actionsRow}>
              {!!resolvedViewProfile && (
                <NewButton
                  label={viewProfileLabel}
                  type="outline"
                  size="md"
                  onPress={resolvedViewProfile}
                  style={styles.actionHalf}
                />
              )}
              {!!handleBookSession && (
                <NewButton
                  label={bookSessionLabel}
                  size="md"
                  onPress={handleBookSession}
                  style={styles.actionHalf}
                />
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%", alignItems: "center" },
  providerOverview: {
    display: "flex",
    paddingVertical: 12,
    paddingHorizontal: 16,
    textAlign: "left",
    width: "96%",
    maxWidth: 420,
    borderRadius: 16,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
  },
  topTextContainer: {
    flex: 1,
    paddingLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  nameText: {
    fontFamily: appStyles.fontBold,
    flex: 1,
  },
  freeBadge: {
    backgroundColor: "rgba(104, 77, 253, 0.12)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  freeBadgeDark: {
    backgroundColor: "rgba(193, 215, 224, 0.12)",
  },
  freeBadgeText: {
    color: appStyles.colorSecondary_9749fa,
  },
  bottom: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  earliestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 2,
  },
  earliestBold: {
    flex: 1,
  },
  actions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionHalf: {
    flex: 1,
    minWidth: 0,
  },
});

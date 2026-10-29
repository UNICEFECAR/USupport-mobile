import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Config from "react-native-config";

import { Avatar } from "../../avatars/Avatar/Avatar";
import { Icon } from "../../icons/Icon";
import { AppText } from "../../texts/AppText/AppText";
import { NewButton } from "../../buttons/NewButton/NewButton";
import { PeerSupportBadge } from "../../labels/PeerSupportBadge";
import {
  getConsultationEndDate,
  getDateView,
  getDayOfTheWeek,
  getDisplaySpecializations,
  getTimeAsString,
  isPeerSupportProvider,
  resolveSpecializationKeys,
} from "#utils";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";
import LinearGradient from "../../LinearGradient";
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
  earliestAvailableSlotDurationMinutes,
  onPress,
  handleViewProfile,
  handleBookSession,
  viewProfileLabel = "View profile",
  bookSessionLabel = "Book session",
  t,
  currencySymbol,
  specializations,
  specializationKeys,
  isPeerSupport,
  style,
  liquidGlass = false,
}) => {
  const { colors, isDarkMode, isHighContrast } = useGetTheme();
  const displayName = patronym
    ? `${name} ${patronym} ${surname}`
    : `${name} ${surname}`;

  const resolvedSpecializationKeys = resolveSpecializationKeys(
    specializationKeys,
    specializations
  );
  const showPeerBadge =
    isPeerSupport ??
    (resolvedSpecializationKeys
      ? isPeerSupportProvider(resolvedSpecializationKeys)
      : false);
  const displaySpecializations = resolvedSpecializationKeys
    ? getDisplaySpecializations(resolvedSpecializationKeys, t)
    : (specializations ?? []);

  const imageURI = AMAZON_S3_BUCKET + "/" + image;
  const isLightTheme = colors.background === appStyles.colorWhite_ff;

  const earliestSlot = earliestAvailableSlot
    ? new Date(earliestAvailableSlot)
    : null;
  const dayOfWeek = earliestSlot && t ? t(getDayOfTheWeek(earliestSlot)) : "";
  const dateText =
    earliestSlot && dayOfWeek
      ? `${dayOfWeek} ${getDateView(earliestSlot).slice(0, 5)}`
      : "";

  // Real start minutes and real length: this used to print `HH:00 - HH+1:00`
  // for every slot, so a 03:30-04:00 slot read 03:00-04:00.
  const timeText = earliestSlot
    ? `${getTimeAsString(earliestSlot)} - ${getTimeAsString(
        getConsultationEndDate(
          earliestSlot,
          earliestAvailableSlotDurationMinutes
        )
      )}`
    : "";

  const resolvedViewProfile = handleViewProfile || onPress;
  const showActions = !!resolvedViewProfile || !!handleBookSession;
  const showFreeBadge = !price;
  const slotBoxBackground = isDarkMode
    ? "rgba(255, 255, 255, 0.06)"
    : "rgba(106, 79, 251, 0.06)";

  const glassGradient = React.useMemo(
    () => ({
      degrees: 145,
      locations: [0, 100],
      colors:
        isLightTheme && !isHighContrast
          ? ["rgba(255, 255, 255, 0.44)", "rgba(235, 243, 255, 0.3)"]
          : colors.cardMediaGradient,
    }),
    [isLightTheme, isHighContrast, colors.cardMediaGradient]
  );

  const CardWrapper = liquidGlass ? LinearGradient : View;
  const cardWrapperProps = liquidGlass
    ? {
        gradient: glassGradient,
        style: [
          styles.providerOverview,
          isLightTheme && !isHighContrast
            ? styles.liquidGlassShadowLight
            : appStyles.cardMediaShadowDark,
          {
            borderColor:
              isLightTheme && !isHighContrast
                ? "rgba(224, 233, 255, 0.72)"
                : colors.cardMediaGradientBorder,
          },
        ],
      }
    : {
        style: [
          styles.providerOverview,
          { backgroundColor: colors.card },
          isLightTheme && !isHighContrast
            ? styles.liquidGlassShadowLight
            : appStyles.shadow2,
        ],
      };

  return (
    <View style={[styles.container, style]}>
      <CardWrapper {...cardWrapperProps}>
        <Pressable
          disabled={!resolvedViewProfile}
          onPress={resolvedViewProfile}
          style={styles.top}
        >
          <Avatar image={{ uri: imageURI }} size="md" />
          <View style={styles.topTextContainer}>
            <View style={styles.nameRow}>
              <AppText
                numberOfLines={2}
                namedStyle="paragraph"
                style={[styles.nameText, { color: colors.text }]}
              >
                {displayName}
              </AppText>
              {showFreeBadge && !!freeLabel && (
                <View
                  style={[styles.freeBadge, isDarkMode && styles.freeBadgeDark]}
                >
                  <AppText
                    namedStyle="smallText"
                    style={[
                      styles.freeBadgeText,
                      isDarkMode && styles.freeBadgeTextDark,
                    ]}
                  >
                    {freeLabel}
                  </AppText>
                </View>
              )}
            </View>
            {showPeerBadge && (
              <PeerSupportBadge
                style={styles.peerBadge}
                label={t ? t("peer_support") : "U-FRIEND"}
              />
            )}
            {!!displaySpecializations?.length && (
              <AppText numberOfLines={2} style={styles.typesText}>
                {displaySpecializations.join(", ")}
              </AppText>
            )}
          </View>
        </Pressable>

        {!!earliestAvailableSlot && (
          <View
            style={[styles.earliest, { backgroundColor: slotBoxBackground }]}
          >
            <AppText
              namedStyle="text"
              style={[styles.earliestLabel, { color: colors.textSecondary }]}
            >
              {t ? t("next_available_session") : "Next available session"}
            </AppText>
            <View style={styles.earliestRow}>
              <Icon
                name="calendar"
                size="md"
                color={appStyles.colorGray_66768d}
              />
              <AppText
                namedStyle="text"
                style={[styles.earliestBold, { color: colors.text }]}
              >
                {dateText}
              </AppText>
            </View>
            <View style={styles.earliestRow}>
              <Icon name="time" size="md" color={appStyles.colorGray_66768d} />
              <AppText
                namedStyle="text"
                style={[styles.earliestBold, { color: colors.text }]}
              >
                {timeText}
              </AppText>
            </View>
          </View>
        )}

        {showActions && (
          <View style={styles.actions}>
            {!!handleBookSession && (
              <NewButton
                label={
                  bookSessionLabel || (t ? t("book_session") : "Book session")
                }
                size="md"
                onPress={handleBookSession}
                style={styles.actionButton}
              />
            )}
            {!!resolvedViewProfile && (
              <NewButton
                label={viewProfileLabel}
                type="outline"
                size="md"
                onPress={resolvedViewProfile}
                style={styles.actionButton}
              />
            )}
          </View>
        )}
      </CardWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%", alignItems: "center" },
  providerOverview: {
    padding: 20,
    alignItems: "stretch",
    width: "100%",
    textAlign: "left",
    position: "relative",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
    maxWidth: 420,
    overflow: "visible",
  },
  liquidGlassShadowLight: {
    shadowColor: "rgb(95, 108, 145)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  topTextContainer: {
    flex: 1,
    paddingLeft: 16,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    width: "100%",
  },
  nameText: {
    fontFamily: appStyles.fontBold,
    fontWeight: "700",
    fontSize: 18,
    lineHeight: 24,
    flex: 1,
  },
  freeBadge: {
    backgroundColor: "#e6f6ea",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  freeBadgeDark: {
    backgroundColor: "rgba(52, 168, 83, 0.2)",
  },
  freeBadgeText: {
    padding: 0,
    color: "#1e7b34",
    fontFamily: appStyles.fontMedium,
  },
  freeBadgeTextDark: {
    color: "#8fdca4",
  },
  peerBadge: {
    marginTop: 6,
  },
  typesText: {
    paddingTop: 6,
    lineHeight: 22,
    opacity: 0.8,
  },
  earliest: {
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    gap: 10,
  },
  earliestLabel: {
    paddingTop: 0,
  },
  earliestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  earliestBold: {
    flex: 1,
    paddingTop: 0,
    fontFamily: appStyles.fontBold,
    fontSize: 18,
  },
  actions: {
    marginTop: 20,
    gap: 12,
    width: "100%",
  },
  actionButton: {
    width: "100%",
    minWidth: 0,
  },
});

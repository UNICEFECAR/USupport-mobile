import React from "react";
import { StyleSheet, View, Pressable, useWindowDimensions } from "react-native";
import Config from "react-native-config";

import { Avatar } from "../../avatars/Avatar/Avatar";
import { Icon } from "../../icons/Icon";
import { AppText } from "../../texts/AppText/AppText";
import { NewButton } from "../../buttons/NewButton/NewButton";
import { getDayOfTheWeek, getDateView } from "#utils";
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
  onPress,
  handleViewProfile,
  handleBookSession,
  viewProfileLabel = "View profile",
  bookSessionLabel = "Book session",
  t,
  currencySymbol,
  specializations,
  style,
  liquidGlass = false,
}) => {
  const { colors, isDarkMode, isHighContrast } = useGetTheme();
  const { width } = useWindowDimensions();
  const displayName = patronym
    ? `${name} ${patronym} ${surname}`
    : `${name} ${surname}`;

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
  const showFreeBadge = !price;
  // Match client-ui card title color.
  const nameColor = "#6a4ffb";

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
          appStyles.shadow2,
        ],
      };

  const isWide = width >= 1024;
  const divider = colors.inputBorder || dividerColor(isDarkMode);

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
                style={[styles.nameText, { color: nameColor }]}
              >
                {displayName}
              </AppText>
              {showFreeBadge && (
                <View
                  style={[styles.freeBadge, isDarkMode && styles.freeBadgeDark]}
                >
                  <AppText
                    namedStyle="smallText"
                    style={[
                      styles.freeBadgeText,
                      { color: isDarkMode ? colors.text : "#1a2340" },
                    ]}
                  >
                    {(freeLabel || "").toUpperCase()}
                  </AppText>
                </View>
              )}
            </View>
            {!!specializations?.length && (
              <AppText numberOfLines={2} style={styles.typesText}>
                {specializations.join(", ")}
              </AppText>
            )}
          </View>
        </Pressable>

        {(!!earliestAvailableSlot || showActions) && (
          <View style={[styles.bottom, { borderTopColor: divider }]}>
            {!!earliestAvailableSlot && (
              <View style={styles.earliest}>
                <AppText namedStyle="text" style={styles.earliestLabel}>
                  {t ? t("earliest_available_slot") : "Earliest available slot"}
                </AppText>
                <View style={styles.earliestWrapper}>
                  <View style={styles.earliestRow}>
                    <Icon
                      name="calendar"
                      size="sm"
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
                    <Icon
                      name="time"
                      size="sm"
                      color={appStyles.colorGray_66768d}
                    />
                    <AppText
                      namedStyle="text"
                      style={[styles.earliestBold, { color: colors.text }]}
                    >
                      {timeText}
                    </AppText>
                  </View>
                </View>
              </View>
            )}

            {showActions && (
              <View style={[styles.actions, { borderTopColor: divider }]}>
                <View
                  style={[styles.actionsRow, isWide && styles.actionsRowWide]}
                >
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
                      label={
                        bookSessionLabel ||
                        (t ? t("book_session") : "Book session")
                      }
                      size="md"
                      onPress={handleBookSession}
                      style={styles.actionHalf}
                    />
                  )}
                </View>
              </View>
            )}
          </View>
        )}
      </CardWrapper>
    </View>
  );
};

const dividerColor = (isDarkMode) => (isDarkMode ? "#344054" : "#cdd8e1");

const styles = StyleSheet.create({
  container: { width: "100%", alignItems: "center" },
  providerOverview: {
    padding: 16,
    alignItems: "stretch",
    width: "100%",
    textAlign: "left",
    position: "relative",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
    maxWidth: 420,
    overflow: "visible",
  },
  liquidGlassShadowLight: {
    shadowColor: "rgb(95, 108, 145)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  top: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
  },
  topTextContainer: {
    flex: 1,
    paddingLeft: 16,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    width: "100%",
  },
  nameText: {
    fontFamily: appStyles.fontSemiBold,
    fontWeight: "600",
    // client-ui: `.paragraph` with line-height ~1.4
    paddingTop: 4,
    lineHeight: 22,
    flex: 1,
  },
  freeBadge: {
    position: "absolute",
    top: -20,
    right: 16,
    backgroundColor: "rgba(151, 107, 255, 0.25)",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 999,
    ...appStyles.shadow1,
  },
  freeBadgeDark: {
    backgroundColor: "rgba(193, 215, 224, 0.12)",
  },
  freeBadgeText: {
    color: "#1a2340",
    fontFamily: appStyles.fontMedium,
    textTransform: "uppercase",
  },
  typesText: {
    paddingTop: 4,
    // client-ui `.text` with provider-overview__types: line-height 1.4 + muted look
    lineHeight: 22,
    opacity: 0.8,
  },
  bottom: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    width: "100%",
  },
  earliest: {
    flexDirection: "column",
    gap: 4,
  },
  earliestWrapper: {
    flexDirection: "column",
    gap: 6,
  },
  earliestLabel: {
    paddingTop: 0,
  },
  earliestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  earliestBold: {
    flex: 1,
    fontFamily: appStyles.fontBold,
  },
  actions: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    width: "100%",
  },
  actionsRow: {
    flexDirection: "column",
    gap: 12,
  },
  actionsRowWide: {
    flexDirection: "row",
  },
  actionHalf: {
    flex: 1,
    minWidth: 0,
  },
});

import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import Config from "react-native-config";
import { useTranslation } from "react-i18next";

import { Avatar } from "../../avatars/Avatar/Avatar";
import { AppText } from "../../texts/AppText/AppText";
import { Icon } from "../../icons/Icon";
import LinearGradient from "../../LinearGradient";
import { appStyles } from "#styles";
import { NewButton } from "../../buttons/NewButton/NewButton";
import {
  showToast,
  getDayOfTheWeek,
  getDateView,
  checkIsFiveMinutesBefore,
} from "#utils";
import { useGetTheme } from "#hooks";

const { AMAZON_S3_BUCKET } = Config;

const formatSpecializations = (value, t) => {
  if (!value) return "";

  let list;

  if (Array.isArray(value)) {
    list = value;
  } else if (typeof value === "string") {
    const trimmed = value.trim();
    const withoutBraces = trimmed.replace(/^\{|\}$/g, "");
    list = withoutBraces.split(",").map((item) => item.trim());
  } else {
    list = [value];
  }

  return list
    .filter(Boolean)
    .map((key) => t(key))
    .join(", ");
};

/**
 * Consultation
 *
 * Consultation card component (client layout aligned with client-ui Consultation card)
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
  hasPriceBadge = true,
  couponPrice,
  consultation,
  currencySymbol,
  overview,
  suggested,
  onPress,
  style,
  sponsorImage: sponsorImageProp,
  organizationName,
  withOrganization,
  seeDetails = false,
  buttonSize = "md",
}) => {
  // Specializations live under blocks.provider-overview in mobile locales.
  // The Consultation screen usually provides `t` from a different namespace/keyPrefix,
  // so we use a dedicated translator here to ensure labels resolve.
  const { t: tProviderOverview } = useTranslation("blocks", {
    keyPrefix: "provider-overview",
  });
  const {
    consultationId,
    timestamp,
    image,
    status,
    price: consultationPrice,
    couponPrice: consultationCouponPrice,
    campaignId,
    sponsorImage: sponsorFromConsultation,
  } = consultation;

  const sponsorImage = sponsorImageProp ?? sponsorFromConsultation;

  const renderIn = "client";

  // Align with web: read specializations from the same logical field,
  // but be defensive about older API field names in mobile payloads.
  const rawSpecializations =
    consultation?.providerSpecializations ??
    consultation?.providerSpecialities ??
    consultation?.specializations ??
    consultation?.providerSpecialization ??
    consultation?.providerSpeciality;

  const price =
    campaignId && renderIn === "client"
      ? 0
      : couponPrice != null && !Number.isNaN(Number(couponPrice))
        ? couponPrice
        : consultationCouponPrice != null &&
            !Number.isNaN(Number(consultationCouponPrice))
          ? consultationCouponPrice
          : consultationPrice;

  const isBookedWithCoupon =
    couponPrice || consultation.couponPrice || campaignId;

  const { colors, isDarkMode } = useGetTheme();

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

  const isPast = consultation
    ? new Date(timestamp).getTime() < new Date().getTime()
    : false;

  let statusLabel = "";
  let statusModifier = "";

  if (renderIn === "client") {
    if (isFiveMinutesBefore) {
      statusLabel = t("live");
      statusModifier = "live";
    } else if (!isPast) {
      statusLabel = t("upcoming_tab_label");
      statusModifier = "upcoming";
    } else if (status === "finished") {
      statusLabel = t("conducted");
      statusModifier = "completed";
    } else {
      statusLabel = t("not_conducted");
      statusModifier = "not-conducted";
    }
  }

  let buttonLabel, buttonAction;
  if (isFiveMinutesBefore) {
    buttonLabel = t("join");
    buttonAction = "join";
  } else if (today > endDate) {
    buttonLabel = t("details");
    buttonAction = "details";
  } else {
    buttonLabel = renderIn === "client" ? t("edit") : t("cancel_consultation");
    buttonAction = renderIn === "client" ? "edit" : "cancel";
  }

  const startHour = startDate.getHours();
  const endHour = startHour + 1;
  const rawTimeText = startDate
    ? `${startHour < 10 ? `0${startHour}` : startHour}:00 - ${
        endHour < 10 ? `0${endHour}` : endHour
      }:00`
    : "";
  const displayTimeText = buttonAction === "join" ? t("active") : rawTimeText;

  const specializationsText = formatSpecializations(rawSpecializations, (key) =>
    tProviderOverview(key, { defaultValue: key })
  );

  const hasActions =
    (!overview && !suggested && buttonAction === "join") ||
    (!overview && suggested && renderIn === "client") ||
    (!overview &&
      !suggested &&
      (buttonAction === "edit" || buttonAction === "cancel")) ||
    (((!overview && !suggested && buttonAction === "details") || seeDetails) &&
      ((renderIn === "client" && status === "finished") || seeDetails));

  const handleAcceptConsultationPress = () => {
    handleAcceptConsultation(consultationId, price, timestamp);
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

  const nameColor = colors.tabUnderlinedBorder || "#6a4ffb";
  const shouldShowPriceBadge =
    !!hasPriceBadge &&
    // In client-ui lists, "Free" is typically not shown as a separate badge.
    // Keep the badge when there is a paid price or when it's a coupon/organization booking.
    (Number(price) > 0 || !!isBookedWithCoupon || !!withOrganization);

  return (
    <Pressable onPress={onPress} style={styles.touchableOpacity}>
      <View
        style={[
          styles.consultation,
          { backgroundColor: isDarkMode ? "transparent" : colors.card },
          style,
          buttonAction === "join" && styles.borderColorPurple,
          { ...appStyles.shadow2 },
        ]}
      >
        {isDarkMode && (
          <LinearGradient
            gradient={{
              degrees: 145,
              locations: [0, 1],
              colors: colors.cardMediaGradient || [colors.card, colors.card],
            }}
            style={styles.darkBackground}
          />
        )}
        <View style={styles.content}>
          <Avatar image={{ uri: imageUrl }} size="sm" />
          <View style={styles.textContainer}>
            <AppText
              style={[styles.nameText, { color: nameColor }]}
              numberOfLines={2}
              isBold
            >
              {name}
            </AppText>
            {!!specializationsText && (
              <AppText
                style={[
                  styles.specializations,
                  { color: colors.textSecondary },
                ]}
                numberOfLines={2}
              >
                {specializationsText}
              </AppText>
            )}
          </View>
          {shouldShowPriceBadge && (
            <View style={styles.priceBadgeOuter}>
              <View style={styles.priceBadge}>
                {isBookedWithCoupon && sponsorImage ? (
                  <Image
                    style={styles.sponsorImage}
                    resizeMode="cover"
                    source={{
                      uri: AMAZON_S3_BUCKET + "/" + sponsorImage,
                    }}
                  />
                ) : withOrganization ? (
                  <Image
                    style={styles.sponsorImage}
                    resizeMode="cover"
                    source={{
                      uri: AMAZON_S3_BUCKET + "/" + "organization",
                    }}
                  />
                ) : null}
                <AppText
                  style={[
                    styles.priceBadgeText,
                    isBookedWithCoupon && sponsorImage && { marginLeft: 8 },
                  ]}
                >
                  {isBookedWithCoupon && renderIn === "client"
                    ? t("coupon")
                    : price > 0
                      ? `${consultation.price}${currencySymbol || ""}`
                      : t("free")}
                </AppText>
              </View>
            </View>
          )}
        </View>

        {!!statusLabel && (
          <View
            style={[
              styles.statusBadgeFloating,
              statusModifier === "upcoming" && styles.statusBadgeUpcoming,
              statusModifier === "live" && styles.statusBadgeLive,
              statusModifier === "completed" && styles.statusBadgeCompleted,
              statusModifier === "not-conducted" &&
                styles.statusBadgeNotConducted,
            ]}
          >
            <AppText
              namedStyle="smallText"
              style={[
                styles.statusBadgeLabel,
                statusModifier === "upcoming" &&
                  styles.statusBadgeTextUpcoming,
                statusModifier === "live" && styles.statusBadgeTextLive,
                statusModifier === "completed" &&
                  styles.statusBadgeTextCompleted,
                statusModifier === "not-conducted" &&
                  styles.statusBadgeTextNotConducted,
              ]}
            >
              {statusLabel}
            </AppText>
          </View>
        )}

        <View
          style={[
            styles.bottom,
            { borderTopColor: appStyles.colorGray_cdd8e1 },
          ]}
        >
          {!!organizationName && (
            <View style={styles.organization}>
              <AppText style={{ color: colors.text }}>
                {organizationName}
              </AppText>
            </View>
          )}
          <View style={styles.earliest}>
            <View style={styles.earliestRow}>
              <Icon
                name="calendar"
                size="sm"
                color={appStyles.colorGray_66768d}
              />
              <AppText isBold style={{ color: colors.text }}>
                {dateText}
              </AppText>
            </View>
            <View style={styles.earliestRow}>
              <Icon name="time" size="sm" color={appStyles.colorGray_66768d} />
              <AppText isBold style={{ color: colors.text }}>
                {displayTimeText}
              </AppText>
            </View>
          </View>

          {hasActions && (
            <View
              style={[
                styles.actions,
                { borderTopColor: appStyles.colorGray_cdd8e1 },
              ]}
            >
              {!overview && !suggested && buttonAction === "join" && (
                <NewButton
                  onPress={handleJoin}
                  label={buttonLabel}
                  type="gradient"
                  size={buttonSize}
                  isFullWidth
                />
              )}

              {!overview && suggested && renderIn === "client" && (
                <View style={styles.actionsRow}>
                  <NewButton
                    onPress={handleAcceptConsultationPress}
                    label={t("accept")}
                    type="gradient"
                    size={buttonSize}
                    style={[styles.actionHalf, styles.actionHalfButton]}
                  />
                  <NewButton
                    onPress={handleRejectConsultationPress}
                    label={t("reject")}
                    type="outline"
                    size={buttonSize}
                    style={[styles.actionHalf, styles.actionHalfButton]}
                  />
                </View>
              )}

              {!overview && !suggested && buttonAction === "edit" && (
                <View style={styles.actionsRow}>
                  <Pressable
                    onPress={() =>
                      showToast({
                        message: t("join_button_label_tooltip"),
                        type: "info",
                      })
                    }
                    style={styles.actionHalf}
                  >
                    <NewButton
                      size={buttonSize}
                      label={t("join")}
                      type="gradient"
                      disabled
                      style={styles.actionHalfButton}
                    />
                  </Pressable>
                  <NewButton
                    size={buttonSize}
                    onPress={handleEdit}
                    label={buttonLabel}
                    type="outline"
                    style={[styles.actionHalf, styles.actionHalfButton]}
                  />
                </View>
              )}

              {!overview && !suggested && buttonAction === "cancel" && (
                <NewButton
                  onPress={handleCancel}
                  label={buttonLabel}
                  type="outline"
                  size={buttonSize}
                  isFullWidth
                />
              )}

              {((!overview && !suggested && buttonAction === "details") ||
                seeDetails) &&
                ((renderIn === "client" && status === "finished") ||
                  seeDetails) && (
                  <NewButton
                    onPress={handleSeeDetails}
                    label={buttonLabel}
                    type="outline"
                    size={buttonSize}
                    isFullWidth
                  />
                )}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  actionHalf: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "48%",
    minWidth: 0,
  },
  actionHalfButton: {
    width: "100%",
    minWidth: 0,
  },
  actions: {
    borderTopWidth: 1,
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    width: "100%",
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
    width: "100%",
  },
  borderColorPurple: {
    borderColor: appStyles.colorSecondary_9749fa,
  },
  bottom: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
    width: "100%",
  },
  consultation: {
    alignItems: "stretch",
    backgroundColor: appStyles.colorWhite_ff,
    borderColor: "transparent",
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 420,
    overflow: "visible",
    padding: 16,
    textAlign: "left",
    width: "100%",
  },
  darkBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  content: {
    alignItems: "flex-start",
    flexDirection: "row",
    width: "100%",
  },
  earliest: {
    gap: 8,
    marginTop: 4,
    width: "100%",
  },
  earliestRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  nameText: {
    paddingTop: 2,
  },
  organization: {
    paddingBottom: 4,
  },
  priceBadge: {
    alignItems: "center",
    backgroundColor: appStyles.colorGray_cdd8e1,
    borderRadius: 6,
    flexDirection: "row",
    justifyContent: "center",
    maxWidth: 200,
    paddingVertical: 6,
    paddingHorizontal: 4,
    ...appStyles.shadow1,
  },
  priceBadgeOuter: {
    alignItems: "flex-end",
    flexShrink: 0,
    justifyContent: "flex-start",
    marginLeft: 8,
  },
  priceBadgeText: {
    color: appStyles.colorSecondary_9749fa,
    fontFamily: appStyles.fontMedium,
    paddingHorizontal: 10,
  },
  specializations: {
    marginTop: 4,
  },
  sponsorImage: {
    borderRadius: 12.5,
    height: 25,
    width: 25,
  },
  statusBadgeFloating: {
    position: "absolute",
    right: 24,
    top: -14,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 2,
    ...appStyles.shadow1,
  },

  statusBadgeLabel: {
    fontFamily: appStyles.fontMedium,
    padding: 0,
    textTransform: "uppercase",
  },
  statusBadgeNotConducted: {
    backgroundColor: "rgba(240, 68, 56, 0.16)",
  },
  statusBadgeUpcoming: {
    backgroundColor: "rgba(151, 73, 250, 0.16)",
  },
  statusBadgeLive: {
    backgroundColor: appStyles.colorSecondary_9749fa,
  },
  statusBadgeTextLive: {
    color: appStyles.colorWhite_ff,
  },
  textContainer: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    paddingLeft: 16,
    paddingRight: 8,
  },
  touchableOpacity: { alignItems: "center", width: "100%" },
});

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Platform, View, StyleSheet } from "react-native";
import YoutubeIframe from "react-native-youtube-iframe";

import { Avatar, AppText, Icon } from "#components";
import { getDateView, getDayOfTheWeek } from "#utils";
import { useGetTheme } from "#hooks";
import { appStyles } from "#styles";
import LinearGradient from "../../components/LinearGradient";

/**
 * ProviderDetails
 *
 * ProviderDetails block
 *
 * @return {jsx}
 */
export const ProviderDetails = ({
  provider,
  image,
  t,
  buttonComponent,
  currencySymbol,
  activeCoupon,
}) => {
  const { colors, isDarkMode, isHighContrast } = useGetTheme();
  const [isVideoShown, setVideoShown] = useState(false);

  const isLightTheme = colors.background === appStyles.colorWhite_ff;

  // Match ArticleView liquid glass background
  const glassGradient = useMemo(
    () => ({
      degrees: 145,
      locations: [0, 100],
      colors:
        isLightTheme && !isHighContrast
          ? Platform.OS === "android"
            ? ["#ffffff", "#f5f8ff"]
            : ["rgba(255, 255, 255, 0.99)", "rgba(245, 248, 255, 0.85)"]
          : colors.cardMediaGradient,
    }),
    [isLightTheme, isHighContrast, colors.cardMediaGradient]
  );

  useEffect(() => {
    setTimeout(() => {
      setVideoShown(true);
    }, 1000);
    return () => {
      setVideoShown(false);
    };
  }, []);

  const allOptionsToString = (option) => {
    return provider[option]?.join(", ");
  };

  const renderSpecializations = useCallback(() => {
    if (provider) {
      return provider.specializations.map((x) => t(x))?.join(", ");
    }
  }, [provider]);

  const renderWorkWith = useCallback(() => {
    if (provider) {
      return provider.workWith
        .map((x) => t(x.topic.replaceAll("-", "_")))
        ?.join(", ");
    }
  }, [provider]);

  const renderLanguages = useCallback(() => {
    if (provider) {
      if (typeof provider.languages?.[0] === "object") {
        return provider.languages
          .map((x) => {
            return x.name === "English"
              ? x.name
              : `${x.name} (${x.local_name})`;
          })
          ?.join(", ");
      }
      return provider.languages?.map((x) => t(x))?.join(", ");
    }
  }, [provider, t]);

  const getSlotDisplay = () => {
    if (!provider?.earliestAvailableSlot) return null;
    const earliestSlot = new Date(provider.earliestAvailableSlot);
    const dayOfWeek = t(getDayOfTheWeek(earliestSlot));
    const dateText = `${dayOfWeek} ${getDateView(earliestSlot).slice(0, 5)}`;
    const startHour = earliestSlot.getHours();
    const endHour = startHour + 1;
    const timeText = `${startHour < 10 ? `0${startHour}` : startHour}:00 - ${
      endHour < 10 ? `0${endHour}` : endHour
    }:00`;
    return { dateText, timeText };
  };

  const slotDisplay = getSlotDisplay();
  const price = provider?.consultationPrice;
  const isFree = !price || price === 0 || !!activeCoupon;

  const educationText =
    provider?.education?.length > 0 ? provider.education.join(", ") : null;

  const displayName = provider?.patronym
    ? `${provider.name} ${provider.patronym} ${provider.surname}`
    : `${provider?.name} ${provider?.surname}`;

  const dividerColor =
    colors.cardMediaSeparator || (isDarkMode ? "#344054" : "#eaecf0");
  const iconColor = isHighContrast
    ? colors.text
    : colors.textSecondary || appStyles.colorGray_66768d;

  const Section = ({ iconName, title, children, isLast = false }) => {
    return (
      <View
        style={[
          styles.section,
          { borderBottomColor: dividerColor },
          isLast && styles.sectionLast,
        ]}
      >
        <View style={styles.sectionHeader}>
          <Icon name={iconName} size="md" color={iconColor} />
          <AppText style={[styles.sectionTitle, { color: iconColor }]}>
            {title}
          </AppText>
        </View>
        <View style={styles.sectionContent}>{children}</View>
      </View>
    );
  };

  return (
    <LinearGradient
      gradient={glassGradient}
      style={[
        styles.glassCard,
        isLightTheme && !isHighContrast
          ? styles.liquidGlassShadowLight
          : appStyles.cardMediaShadowDark,
        { borderColor: colors.cardMediaGradientBorder },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerProviderInfo}>
          <Avatar image={image ? { uri: image } : null} style={styles.avatar} />
          <View style={styles.headerTextContainer}>
            <AppText
              namedStyle="h3"
              style={[
                styles.providerName,
                { color: colors.tabUnderlinedBorder || "#6a4ffb" },
              ]}
            >
              {displayName}
            </AppText>
            <AppText
              namedStyle="smallText"
              style={[styles.specializations, { color: colors.text }]}
            >
              {renderSpecializations()}
            </AppText>
            <View style={styles.badges}>
              {isFree ? (
                <View style={styles.badgeFree}>
                  <AppText namedStyle="smallText" style={styles.badgeFreeText}>
                    {activeCoupon ? t("coupon") : t("free")}
                  </AppText>
                </View>
              ) : (
                <View style={styles.badgePrice}>
                  <AppText namedStyle="smallText" style={styles.badgePriceText}>
                    {price}
                    {currencySymbol}
                  </AppText>
                </View>
              )}
            </View>
          </View>
        </View>

        {buttonComponent ? (
          <View style={styles.headerActions}>{buttonComponent}</View>
        ) : null}
      </View>

      <View style={[styles.sections, { borderTopColor: dividerColor }]}>
        {slotDisplay ? (
          <Section iconName="calendar" title={t("earliest_slot_label")}>
            <AppText style={[styles.sectionText, { color: colors.text }]}>
              {slotDisplay.dateText}, {slotDisplay.timeText}
            </AppText>
          </Section>
        ) : null}

        {provider?.totalConsultations > 0 ? (
          <Section
            iconName="consultation"
            title={t("done_consultations_label")}
          >
            <AppText style={[styles.sectionText, { color: colors.text }]}>
              {provider.totalConsultations} {t("consultations")}
            </AppText>
          </Section>
        ) : null}

        {renderLanguages() ? (
          <Section iconName="globe" title={t("languages_label")}>
            <AppText style={[styles.sectionText, { color: colors.text }]}>
              {renderLanguages()}
            </AppText>
          </Section>
        ) : null}

        {educationText ? (
          <Section iconName="read-book" title={t("education_label")}>
            <AppText style={[styles.sectionText, { color: colors.text }]}>
              {educationText}
            </AppText>
          </Section>
        ) : null}

        {provider?.description ? (
          <Section iconName="document" title={t("description_label")}>
            <AppText style={[styles.sectionText, { color: colors.text }]}>
              {provider.description}
            </AppText>
          </Section>
        ) : null}

        {renderWorkWith() ? (
          <Section iconName="community" title={t("work_with_label")} isLast>
            <AppText style={[styles.sectionText, { color: colors.text }]}>
              {renderWorkWith()}
            </AppText>
          </Section>
        ) : (
          <View style={{ borderBottomColor: "transparent" }} />
        )}
      </View>

      {provider?.videoLink ? (
        <View style={[styles.videoSection, { borderTopColor: dividerColor }]}>
          <View style={styles.sectionHeader}>
            <Icon name="video" size="md" color={iconColor} />
            <AppText style={[styles.sectionTitle, { color: iconColor }]}>
              {t("video_label")}
            </AppText>
          </View>
          {isVideoShown ? (
            <View style={styles.videoContainer}>
              <YoutubeIframe
                height={230}
                width={appStyles.screenWidth * 0.88}
                play={false}
                videoId={provider.videoId}
              />
            </View>
          ) : null}
        </View>
      ) : null}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flexGrow1: { flexGrow: 1 },
  wrapper: { paddingBottom: 8 },

  glassCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    padding: 16,
    marginTop: 8,
    width: "100%",
  },
  liquidGlassShadowLight: {
    shadowColor: "rgb(95, 108, 145)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },

  header: {
    flexDirection: "column",
    gap: 12,
    width: "100%",
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerProviderInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    minWidth: 0,
  },
  headerTextContainer: { flex: 1, minWidth: 0 },
  headerActions: {
    width: "100%",
    marginTop: 12,
  },
  providerName: {
    fontFamily: appStyles.fontSemiBold,
    textAlign: "left",
  },
  specializations: { opacity: 0.8, marginTop: 2 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  badgeFree: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(3, 152, 85, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(3, 152, 85, 0.3)",
  },
  badgeFreeText: {
    color: "#039855",
    fontFamily: appStyles.fontMedium,
  },
  badgePrice: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(151, 73, 250, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(151, 73, 250, 0.3)",
  },
  badgePriceText: {
    color: appStyles.colorSecondary_9749fa,
    fontFamily: appStyles.fontMedium,
  },

  avatar: { width: 60, height: 60, borderRadius: 12 },

  sections: {
    width: "100%",
    marginTop: 16,
  },
  section: {
    width: "100%",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sectionLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: appStyles.fontSemiBold,
  },
  sectionContent: {
    paddingLeft: 28,
  },
  sectionText: {
    textAlign: "left",
  },

  videoSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  videoContainer: {
    marginTop: 8,
    alignItems: "center",
  },
});

import React from "react";
import { StyleSheet, View, Pressable } from "react-native";

import { Icon } from "../../icons/Icon";
import { AppText } from "../../texts/AppText/AppText";
import { NewButton } from "../../buttons/NewButton/NewButton";
import LinearGradient from "../../LinearGradient";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

/**
 * OrganizationOverview
 *
 * Organization overview card component that displays key organization information
 *
 * @return {jsx}
 */
export const OrganizationOverview = ({
  name,
  specialisations = [],
  address,
  phone,
  onPress,
  onViewDetails,
  t,
  style,
}) => {
  const { colors, isDarkMode, isHighContrast } = useGetTheme();
  const divider = colors.inputBorder || (isDarkMode ? "#344054" : "#cdd8e1");
  const isLightTheme = colors.background === appStyles.colorWhite_ff;

  const formattedSpecialisations =
    specialisations && specialisations.length > 0
      ? specialisations.map((spec) => {
          const name = typeof spec === "string" ? spec : spec.name;
          return t ? t(name) : name;
        })
      : [];

  const specialisationsText = formattedSpecialisations.join(", ");

  const iconColor = isDarkMode ? "#ededed" : appStyles.colorPrimary_20809e;
  const nameColor = "#6A4FFB";
  const iconBadgeBorder = isDarkMode ? divider : "rgba(224, 233, 255, 0.7)";
  const iconBadgeGradient = React.useMemo(
    () => ({
      degrees: 145,
      locations: [0, 100],
      colors:
        isLightTheme && !isHighContrast
          ? ["rgba(255, 255, 255, 0.75)", "rgba(245, 248, 255, 0.6)"]
          : colors.cardMediaGradient || [colors.card, colors.card],
    }),
    [isLightTheme, isHighContrast, colors.cardMediaGradient, colors.card]
  );

  return (
    <Pressable onPress={onPress} style={[styles.touchableOpacity, style]}>
      <View
        style={[
          styles.organizationOverview,
          { backgroundColor: colors.card },
          appStyles.shadow2,
        ]}
      >
        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.iconContainer}>
              <LinearGradient
                gradient={iconBadgeGradient}
                style={[styles.iconWrapper, { borderColor: iconBadgeBorder }]}
              >
                <View style={styles.iconShadow}>
                  <Icon name="organization" size="md" color={iconColor} />
                </View>
              </LinearGradient>
            </View>
            <View style={styles.headerText}>
              <View style={styles.nameRow}>
                <AppText
                  numberOfLines={2}
                  style={[styles.nameText, { color: nameColor }]}
                >
                  {name}
                </AppText>
              </View>
              {formattedSpecialisations.length > 0 && (
                <View style={styles.servicesBadge}>
                  <AppText namedStyle="smallText" style={styles.servicesText}>
                    {t ? t("services") : "Services"}:{" "}
                    {formattedSpecialisations.length}
                  </AppText>
                </View>
              )}
            </View>
          </View>

          {!!specialisationsText && (
            <AppText
              numberOfLines={2}
              style={[styles.typesText, { color: colors.textSecondary }]}
            >
              {specialisationsText}
            </AppText>
          )}

          <View style={[styles.separator, { backgroundColor: divider }]} />

          {(address || phone) && (
            <View style={styles.meta}>
              {!!address && (
                <View style={styles.metaRow}>
                  <Icon name="location" size="md" color="#66768D" />
                  <AppText
                    numberOfLines={2}
                    style={[styles.metaText, { color: colors.textSecondary }]}
                  >
                    {address}
                  </AppText>
                </View>
              )}
              {!!phone && (
                <View style={styles.metaRow}>
                  <Icon name="phone" size="md" color="#66768D" />
                  <AppText
                    numberOfLines={2}
                    style={[styles.metaText, { color: colors.textSecondary }]}
                  >
                    {(phone || "").split("\n").join(" / ")}
                  </AppText>
                </View>
              )}
            </View>
          )}

          <View style={[styles.separator, { backgroundColor: divider }]} />

          <View style={styles.cta}>
            <NewButton
              label={t ? t("view_organization_details") : "View organization"}
              type="outline"
              size="sm"
              onPress={(e) => {
                e?.stopPropagation?.();
                (onViewDetails || onPress)?.();
              }}
              style={styles.ctaBtn}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  touchableOpacity: {
    width: "100%",
    alignItems: "center",
  },
  organizationOverview: {
    padding: 16,
    width: "96%",
    maxWidth: 420,
    borderRadius: 16,
  },
  content: {
    width: "100%",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
  },
  iconContainer: {
    paddingTop: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    ...appStyles.shadow1,
    overflow: "hidden",
  },
  iconShadow: {
    shadowColor: "rgba(16, 24, 40, 0.12)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerText: {
    flex: 1,
    paddingLeft: 12,
    position: "relative",
    paddingTop: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  nameText: {
    fontFamily: appStyles.fontBold,
    fontSize: 16,
    lineHeight: 22,
    flexShrink: 1,
    flexGrow: 1,
    paddingRight: 110,
  },
  servicesBadge: {
    position: "absolute",
    top: -24,
    right: 0,
    backgroundColor: "rgba(151, 107, 255, 0.18)",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 999,
    ...appStyles.shadow1,
  },
  servicesText: {
    color: "#1a2340",
    fontFamily: appStyles.fontMedium,
  },
  separator: {
    height: 1,
    width: "100%",
    marginTop: 12,
  },
  typesText: {
    paddingTop: 4,
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  meta: {
    paddingTop: 12,
    gap: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  metaText: {
    flex: 1,
    fontFamily: appStyles.fontSemiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  cta: {
    paddingTop: 12,
  },
  ctaBtn: {
    width: "100%",
  },
});

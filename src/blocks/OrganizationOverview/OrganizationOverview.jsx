import { useTranslation } from "react-i18next";
import { useCallback, useMemo } from "react";
import { View, StyleSheet, Linking, TouchableOpacity, Platform } from "react-native";
import * as Clipboard from "expo-clipboard";

import { Block, Loading, AppText, Icon } from "#components";
import { useGetOrganizationById, useGetTheme } from "#hooks";
import { appStyles } from "#styles";
import { constructShareUrl, showToast } from "#utils";
import LinearGradient from "../../components/LinearGradient";

export const OrganizationOverview = ({ organizationId }) => {
  const { t } = useTranslation("blocks", {
    keyPrefix: "organization-overview",
  });

  const {
    data: organization,
    isLoading,
    isError,
  } = useGetOrganizationById(organizationId);

  return (
    <Block>
      {isError ? (
        <AppText namedStyle="h3">{t("error_loading_data")}</AppText>
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <Loading size="lg" />
        </View>
      ) : (
        <OrganizationDetails organization={organization} t={t} />
      )}
    </Block>
  );
};

const OrganizationDetails = ({ organization, t }) => {
  const { colors, isHighContrast, isDarkMode } = useGetTheme();
  const { i18n } = useTranslation();

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

  const description = useMemo(() => {
    const language = i18n.language?.toLowerCase();

    if (language === "ro") {
      return organization.descriptionRO || null;
    }

    if (language === "uk") {
      return organization.descriptionUK || null;
    }

    return organization.description || null;
  }, [organization, i18n.language]);

  const renderSpecialisations = useCallback(() => {
    if (organization && organization.specialisations) {
      return organization.specialisations.map((x) => t(x.name))?.join(", ");
    }
    return "";
  }, [organization, t]);

  const renderPaymentMethods = useCallback(() => {
    if (organization && organization.paymentMethods?.length > 0) {
      return organization.paymentMethods.map((x) => t(x.name))?.join(", ");
    }
    return "";
  }, [organization, t]);

  const renderUserInteractions = useCallback(() => {
    if (organization && organization.userInteractions?.length > 0) {
      return organization.userInteractions
        .map((x) => t(x.name + "_interaction"))
        ?.join(", ");
    }
    return "";
  }, [organization, t]);

  const renderPropertyTypes = useCallback(() => {
    if (organization && organization.propertyTypes?.length > 0) {
      return organization.propertyTypes.map((x) => t(x.name))?.join(", ");
    }
    return "";
  }, [organization, t]);

  const handleWebsitePress = useCallback(async () => {
    if (organization.websiteUrl) {
      try {
        await Linking.openURL(organization.websiteUrl);
      } catch (error) {
        console.error("Failed to open URL:", error);
      }
    }
  }, [organization.websiteUrl]);

  const handlePhonePress = useCallback(async () => {
    if (organization.phone) {
      try {
        await Linking.openURL(`tel:${organization.phone}`);
      } catch (error) {
        console.error("Failed to open phone:", error);
      }
    }
  }, [organization.phone]);

  const handleEmailPress = useCallback(async () => {
    if (organization.email) {
      try {
        await Linking.openURL(`mailto:${organization.email}`);
      } catch (error) {
        console.error("Failed to open email:", error);
      }
    }
  }, [organization.email]);

  const handleCopyLink = useCallback(async () => {
    const url = await constructShareUrl({
      contentType: "organization",
      id: organization.organizationId,
    });
    await Clipboard.setStringAsync(url);
    showToast({ message: t("copy_link_success") });
  }, [organization.organizationId, t]);

  if (!organization) {
    return null;
  }

  return (
    <View style={[styles.screen, { paddingBottom: 250 }]}>
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
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.nameRow}>
              <AppText
                namedStyle="h3"
                style={[styles.organizationName, { color: colors.text }]}
              >
                {organization.name}
              </AppText>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={handleCopyLink}
                style={[
                  styles.shareButton,
                  { borderColor: colors.primary || appStyles.colorBlue_3d527b },
                ]}
              >
                <Icon name="share" size="sm" color={colors.text} />
              </TouchableOpacity>
            </View>

            {organization.phone && (
              <View style={styles.informationWithIcon}>
                <Icon name="call" size="md" color={styles.iconMuted.color} />
                <AppText
                  style={styles.informationText}
                  onPress={handlePhonePress}
                >
                  {organization.phone}
                </AppText>
              </View>
            )}

            {organization.email && (
              <View style={styles.informationWithIcon}>
                <Icon
                  name="mail-admin"
                  size="md"
                  color={styles.iconMuted.color}
                />
                <AppText
                  style={styles.informationText}
                  onPress={handleEmailPress}
                >
                  {organization.email}
                </AppText>
              </View>
            )}

            {organization.websiteUrl && (
              <View style={styles.informationWithIcon}>
                <Icon name="globe" size="md" color={styles.iconMuted.color} />
                <AppText
                  style={styles.informationText}
                  onPress={handleWebsitePress}
                >
                  {organization.websiteUrl}
                </AppText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailsColumn}>
            {organization.address && (
              <InfoItem
                label={t("address_label")}
                value={organization.address}
                labelColor={colors.text}
              />
            )}

            {organization.district?.name && (
              <InfoItem
                label={t("sector_label")}
                value={t(organization.district.name)}
                labelColor={colors.text}
              />
            )}

            {renderPaymentMethods() && (
              <InfoItem
                label={t("payment_methods_label")}
                value={renderPaymentMethods()}
                labelColor={colors.text}
              />
            )}

            {renderUserInteractions() && (
              <InfoItem
                label={t("user_interactions_label")}
                value={renderUserInteractions()}
                labelColor={colors.text}
              />
            )}

            {renderPropertyTypes() && (
              <InfoItem
                label={t("property_types_label")}
                value={renderPropertyTypes()}
                labelColor={colors.text}
              />
            )}

            {renderSpecialisations() && (
              <InfoItem
                label={t("offered_services_label")}
                value={renderSpecialisations()}
                labelColor={colors.text}
              />
            )}

            {organization.providers?.length > 0 && (
              <InfoItem
                label={t("providers_label")}
                value={organization.providers
                  .map((provider) => `${provider.name} ${provider.surname}`)
                  .join(", ")}
                labelColor={colors.text}
              />
            )}
          </View>

          <View style={styles.detailsColumn}>
            {description && (
              <InfoItem
                label={t("other_services_label")}
                value={description}
                labelColor={colors.text}
              />
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const InfoItem = ({ label, value, labelColor }) => {
  if (!value) return null;

  return (
    <View style={styles.infoSection}>
      <AppText style={[styles.headingText, { color: labelColor }]}>
        {label}
      </AppText>
      <AppText style={styles.infoText}>{value}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  screen: {
    marginTop: 8,
    paddingBottom: 40,
  },
  glassCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    padding: 16,
    width: "100%",
  },
  liquidGlassShadowLight: {
    shadowColor: "rgb(95, 108, 145)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  headerRow: {
    width: "100%",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  organizationName: {
    fontFamily: appStyles.fontSemiBold,
    flex: 1,
  },
  informationWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconMuted: {
    color: "#66768D",
  },
  informationText: {
    marginLeft: 10,
    flex: 1,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailsColumn: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 280,
  },
  infoSection: {
    marginTop: 16,
  },
  headingText: {
    fontFamily: appStyles.fontBold,
    color: appStyles.colorBlue_3d527b,
    marginBottom: 8,
  },
  infoText: {
    lineHeight: 20,
    marginBottom: 4,
  },
  shareButton: {
    marginLeft: 12,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});

import { useTranslation } from "react-i18next";
import { useCallback, useMemo } from "react";
import { View, StyleSheet, Linking, TouchableOpacity } from "react-native";

import { Block, Loading, AppText, Avatar, Icon } from "#components";
import { useGetOrganizationById, useGetTheme } from "#hooks";
import { appStyles } from "#styles";
import { constructShareUrl } from "#utils";
import Share from "react-native-share";

export const OrganizationOverview = ({ organizationId }) => {
  const { t, i18n } = useTranslation("blocks", {
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
        <AppText namedStyle="h3">{t("error-loading-data")}</AppText>
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
  const { colors } = useGetTheme();
  const { i18n } = useTranslation();

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

  const handleShare = async () => {
    const url = await constructShareUrl({
      contentType: "organization",
      id: organization.organizationId,
    });
    Share.open({
      title: organization.name,
      message: `${t("check_organization")}\n\n${url}`,
    });
  };

  if (!organization) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingBottom: 250 }]}>
      {/* Header Section */}
      <View style={styles.header}>
        {/* <Avatar
          image={organization.image ? { uri: organization.image } : null}
          style={styles.avatar}
        /> */}
        <View style={styles.headerTextContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <AppText
              namedStyle="h3"
              style={[styles.organizationName, { color: colors.text }]}
            >
              {organization.name}
            </AppText>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Icon name="share" size="sm" color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Contact Information */}
      {organization.phone && (
        <View style={styles.contactItem}>
          <Icon name="call" size="md" color="#66768D" />
          <AppText
            style={[styles.contactText, styles.linkText]}
            onPress={handlePhonePress}
          >
            {organization.phone}
          </AppText>
        </View>
      )}

      {organization.email && (
        <View style={styles.contactItem}>
          <Icon name="mail-admin" size="md" color="#66768D" />
          <AppText
            style={[styles.contactText, styles.linkText]}
            onPress={handleEmailPress}
          >
            {organization.email}
          </AppText>
        </View>
      )}

      {organization.websiteUrl && (
        <View style={styles.contactItem}>
          <Icon name="globe" size="md" color="#66768D" />
          <AppText
            style={[styles.contactText, styles.linkText]}
            onPress={handleWebsitePress}
          >
            {organization.websiteUrl}
          </AppText>
        </View>
      )}

      {/* Information Sections */}
      {organization.address && (
        <View style={styles.infoSection}>
          <AppText style={[styles.headingText, { color: colors.text }]}>
            {t("address_label")}
          </AppText>
          <AppText style={styles.infoText}>{organization.address}</AppText>
        </View>
      )}

      {organization.district?.name && (
        <View style={styles.infoSection}>
          <AppText style={[styles.headingText, { color: colors.text }]}>
            {t("district_label")}
          </AppText>
          <AppText style={styles.infoText}>
            {t(organization.district.name)}
          </AppText>
        </View>
      )}

      {/* Updated: Handle multiple payment methods */}
      {renderPaymentMethods() && (
        <View style={styles.infoSection}>
          <AppText style={[styles.headingText, { color: colors.text }]}>
            {t("payment_methods_label")}
          </AppText>
          <AppText style={styles.infoText}>{renderPaymentMethods()}</AppText>
        </View>
      )}

      {/* Updated: Handle multiple user interactions */}
      {renderUserInteractions() && (
        <View style={styles.infoSection}>
          <AppText style={[styles.headingText, { color: colors.text }]}>
            {t("user_interactions_label")}
          </AppText>
          <AppText style={styles.infoText}>{renderUserInteractions()}</AppText>
        </View>
      )}

      {/* Added: Property types section */}
      {renderPropertyTypes() && (
        <View style={styles.infoSection}>
          <AppText style={[styles.headingText, { color: colors.text }]}>
            {t("property_types_label")}
          </AppText>
          <AppText style={styles.infoText}>{renderPropertyTypes()}</AppText>
        </View>
      )}

      {organization.specialisations?.length > 0 && (
        <View style={styles.infoSection}>
          <AppText style={[styles.headingText, { color: colors.text }]}>
            {t("specialisations_label")}
          </AppText>
          <AppText style={styles.infoText}>{renderSpecialisations()}</AppText>
        </View>
      )}

      {organization.providers?.length > 0 && (
        <View style={styles.infoSection}>
          <AppText style={[styles.headingText, { color: colors.text }]}>
            {t("providers_label")}
          </AppText>
          <AppText style={styles.infoText}>
            {organization.providers
              .map((provider) => `${provider.name} ${provider.surname}`)
              .join(", ")}
          </AppText>
        </View>
      )}

      {description && (
        <View style={styles.infoSection}>
          <AppText style={[styles.headingText, { color: colors.text }]}>
            {t("description_label")}
          </AppText>
          <AppText style={styles.infoText}>{description}</AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    marginTop: 24,
    width: "100%",
    marginBottom: 20,
  },
  avatar: {
    width: 66,
    height: 66,
  },
  headerTextContainer: {
    marginLeft: 0,
    flex: 1,
  },
  organizationName: {
    fontFamily: appStyles.fontSemiBold,
    maxWidth: "90%",
  },
  marginTop4: {
    marginTop: 4,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  contactText: {
    marginLeft: 12,
    flex: 1,
  },
  linkText: {
    textDecorationLine: "underline",
    color: "#007AFF", // iOS blue color for links
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
  actionButton: {
    marginLeft: 16,
    borderWidth: 1,
    borderColor: appStyles.colorBlue_3d527b,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});

import { useTranslation } from "react-i18next";
import { useCallback } from "react";
import { View, StyleSheet, Linking } from "react-native";

import { Block, Loading, AppText, Avatar, Icon } from "#components";
import { useGetOrganizationById, useGetTheme } from "#hooks";
import { appStyles } from "#styles";

export const OrganizationOverview = ({ organizationId }) => {
  const { t } = useTranslation("organization-overview");

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

  const renderWorkWith = useCallback(() => {
    if (organization && organization.workWith) {
      return organization.workWith.map((x) => t(x.topic))?.join(", ");
    }
    return "";
  }, [organization, t]);

  const renderSpecialisations = useCallback(() => {
    if (organization && organization.specialisations) {
      return organization.specialisations.map((x) => t(x.name))?.join(", ");
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

  if (!organization) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingBottom: 250 }]}>
      {/* Header Section */}
      <View style={styles.header}>
        <Avatar
          image={organization.image ? { uri: organization.image } : null}
          style={styles.avatar}
        />
        <View style={styles.headerTextContainer}>
          <AppText
            namedStyle="h3"
            style={[styles.organizationName, { color: colors.text }]}
          >
            {organization.name}
          </AppText>
          {organization.unitName && (
            <AppText namedStyle="smallText" style={styles.marginTop4}>
              {organization.unitName}
            </AppText>
          )}
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

      {organization.paymentMethod?.name && (
        <View style={styles.infoSection}>
          <AppText style={[styles.headingText, { color: colors.text }]}>
            {t("payment_method_label")}
          </AppText>
          <AppText style={styles.infoText}>
            {t(organization.paymentMethod.name)}
          </AppText>
        </View>
      )}

      {organization.workWith?.length > 0 && (
        <View style={styles.infoSection}>
          <AppText style={[styles.headingText, { color: colors.text }]}>
            {t("work_with_label")}
          </AppText>
          <AppText style={styles.infoText}>{renderWorkWith()}</AppText>
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

      {organization.description && (
        <View style={styles.infoSection}>
          <AppText style={[styles.headingText, { color: colors.text }]}>
            {t("description_label")}
          </AppText>
          <AppText style={styles.infoText}>{organization.description}</AppText>
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
    marginLeft: 16,
    flex: 1,
  },
  organizationName: {
    fontFamily: "Nunito-SemiBold",
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
    fontFamily: "Nunito-Bold",
    color: appStyles.colorBlue_3d527b,
    marginBottom: 8,
  },
  infoText: {
    lineHeight: 20,
    marginBottom: 4,
  },
});

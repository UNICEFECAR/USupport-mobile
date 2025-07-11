import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  KeyboardAvoidingView,
} from "react-native";
import { useTranslation } from "react-i18next";
import Share from "react-native-share";
import Config from "react-native-config";

import {
  Block,
  Input,
  InteractiveMap,
  Loading,
  AppText,
  OrganizationOverview,
  Avatar,
  ButtonWithIcon,
  AppButton,
  Icon,
} from "#components";
import { useGetOrganizationMetadata, useGetAllOrganizations } from "#hooks";
import { appStyles } from "#styles";
import { constructShareUrl } from "#utils";
import { useGetTheme } from "#hooks";
import { GiveSuggestion } from "../GiveSuggestion";

const { GOOGLE_MAPS_API_KEY, AMAZON_S3_BUCKET } = Config;

/**
 * Organizations
 *
 * Organizations block component that displays a list of organizations with filtering options
 * @returns {JSX.Element}
 */
export const Organizations = ({ navigation, filters, setFilters }) => {
  const { t } = useTranslation("organizations");
  const [mapControls, setMapControls] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  const { data, isLoading } = useGetAllOrganizations({
    search: filters.search,
    workWith: filters.workWith,
    district: filters.district,
    paymentMethod: filters.paymentMethod,
    specialisation: filters.specialisation,
  });

  const { data: metadata, isLoading: isMetadataLoading } =
    useGetOrganizationMetadata();

  const handleChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value,
    });
  };

  const handleOrganizationClick = (organization) => {
    // Check if map controls are available and organization has valid location
    if (
      mapControls &&
      organization.location?.latitude &&
      organization.location?.longitude
    ) {
      // Use map controls to zoom and select the organization (like web version)
      if (mapControls.zoomToLocation) {
        mapControls.zoomToLocation(
          organization.location.latitude,
          organization.location.longitude,
          14 // Zoom level for organization location
        );
      }

      if (mapControls.selectProvider) {
        mapControls.selectProvider(organization);
      }
    } else {
      // Fallback: directly open the backdrop if map controls aren't available
      // This ensures the same behavior as clicking the marker
      setSelectedOrganization(null);
      setTimeout(() => {
        setSelectedOrganization(organization);
      }, 100);
    }
  };

  const handleMapReady = (controls) => {
    console.log("Map controls ready:", controls);
    setMapControls(controls);
  };

  const handleCloseOrganizationCard = () => {
    setSelectedOrganization(null);
  };

  const renderOrganizations = () => {
    if (!data || data.length === 0) {
      return null;
    }

    return data.map((organization) => (
      <OrganizationOverview
        key={organization.organizationId}
        name={organization.name}
        unitName={organization.unitName}
        image={organization.image}
        paymentMethod={organization.paymentMethod}
        specialisations={organization.specialisations}
        address={organization.address}
        onPress={() => handleOrganizationClick(organization)}
        t={t}
      />
    ));
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={64}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView}>
          <Block style={styles.container}>
            <View style={styles.searchContainer}>
              <Input
                value={filters.search}
                onChangeText={(value) => handleChange("search", value)}
                placeholder={t("search_placeholder")}
                style={styles.searchInput}
              />
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Loading />
              </View>
            ) : (
              <>
                <InteractiveMap
                  data={data}
                  onMapReady={handleMapReady}
                  setSelectedMarker={setSelectedOrganization}
                  t={t}
                  googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                  style={styles.map}
                />

                <View style={styles.organizationsContainer}>
                  {renderOrganizations()}
                </View>

                {data && data.length === 0 && (
                  <View style={styles.noDataContainer}>
                    <AppText style={styles.noDataText}>
                      {t("no_data_found")}
                    </AppText>
                  </View>
                )}
              </>
            )}
          </Block>
          <GiveSuggestion
            navigation={navigation}
            style={{ marginBottom: 50 }}
            type="organizations"
          />
        </ScrollView>
      </KeyboardAvoidingView>
      {selectedOrganization && (
        <OrganizationBackdrop
          organization={selectedOrganization}
          onClose={handleCloseOrganizationCard}
          t={t}
          navigation={navigation}
        />
      )}
    </>
  );
};

/**
 * OrganizationBackdrop component - Mobile equivalent of the web MapProvider InfoWindow
 * This shows the organization details when a marker is clicked
 */
const OrganizationBackdrop = ({ organization, onClose, t, navigation }) => {
  const { colors } = useGetTheme();

  const navigateToOrganization = (app) => {
    if (organization.location?.latitude && organization.location?.longitude) {
      const { latitude: lat, longitude: lng } = organization.location;
      let navigationUrl = "";

      if (app === "google") {
        navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
      } else if (app === "waze") {
        navigationUrl = `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`;
      }

      Linking.openURL(navigationUrl).catch((err) =>
        console.error("Failed to open navigation app:", err)
      );
    } else {
      console.log("Organization location is not available for navigation.");
    }
  };

  const handleViewDetails = () => {
    onClose();
    navigation.navigate("OrganizationOverview", {
      organizationId: organization.organizationId,
    });
  };

  const imageURI =
    organization.image && organization.image !== "default"
      ? `${AMAZON_S3_BUCKET}/${organization.image}`
      : null;

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

  return (
    <View style={styles.backdrop}>
      <TouchableOpacity
        style={styles.backdropOverlay}
        onPress={onClose}
        activeOpacity={1}
      />
      <View style={styles.backdropContent}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <AppText style={styles.closeButtonText}>✕</AppText>
        </TouchableOpacity>

        {/* Organization Logo */}
        {imageURI && (
          <View style={styles.avatarContainer}>
            <Avatar image={{ uri: imageURI }} size="md" />
          </View>
        )}

        {/* Organization Name */}
        <AppText style={styles.organizationName}>{organization.name}</AppText>

        {/* Unit Name */}
        {organization.unitName && (
          <AppText style={styles.unitName}>{organization.unitName}</AppText>
        )}

        {/* Payment Method */}
        {organization.paymentMethod.id && (
          <View style={styles.paymentBadge}>
            <AppText style={styles.paymentText}>
              {t(organization.paymentMethod.name)}
            </AppText>
          </View>
        )}

        {/* Specializations */}
        {organization.specialisations &&
          organization.specialisations.length > 0 && (
            <AppText style={styles.specializations}>
              {organization.specialisations
                .map((spec) => t(typeof spec === "string" ? spec : spec.name))
                .join(", ")}
            </AppText>
          )}

        {/* Contact Info */}
        <View style={styles.contactInfo}>
          {organization.phone && (
            <AppText style={styles.contactItem}>
              <AppText style={styles.contactLabel}>{t("phone")}:</AppText>{" "}
              {organization.phone}
            </AppText>
          )}
          {organization.email && (
            <AppText style={styles.contactItem}>
              <AppText style={styles.contactLabel}>{t("email")}:</AppText>{" "}
              {organization.email}
            </AppText>
          )}
          {organization.address && (
            <AppText style={styles.contactItem}>
              <AppText style={styles.contactLabel}>{t("address")}:</AppText>{" "}
              {organization.address}
            </AppText>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Icon name="share" size="sm" color={colors.text} />
          </TouchableOpacity>
          <AppButton
            onPress={handleViewDetails}
            label={t("view_organization_details")}
          />

          {organization.location?.latitude &&
            organization.location?.longitude && (
              <View style={styles.navigationButtonsContainer}>
                <ButtonWithIcon
                  iconName="google-maps"
                  label="Google Maps"
                  onPress={() => navigateToOrganization("google")}
                  type="secondary"
                  style={styles.navigationButton}
                />
                <ButtonWithIcon
                  iconName="waze"
                  label="Waze"
                  onPress={() => navigateToOrganization("waze")}
                  type="secondary"
                  style={styles.navigationButton}
                />
              </View>
            )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
  },
  resetButton: {
    backgroundColor: appStyles.colorSecondary_9749fa,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  filtersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  dropdown: {
    minWidth: "45%",
    flexGrow: 1,
  },
  map: {
    flex: 1,
    minHeight: 400,
    marginBottom: 16,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  noDataText: {
    color: appStyles.colorGray_66768d,
    textAlign: "center",
    fontSize: 16,
  },
  organizationsContainer: {
    paddingVertical: 24,
    gap: 12,
  },
  loadingContainer: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  // Backdrop styles
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  backdropOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdropContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxWidth: 340,
    width: "90%",
    maxHeight: "80%",
    ...appStyles.shadow2,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 16,
    padding: 8,
    zIndex: 1001,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: appStyles.colorGray_66768d,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 12,
    marginTop: 20,
  },
  organizationName: {
    fontSize: 18,
    fontWeight: "bold",
    color: appStyles.colorPrimary_20809e,
    textAlign: "center",
    marginBottom: 8,
    marginTop: 20,
  },
  unitName: {
    fontSize: 14,
    color: appStyles.colorGray_66768d,
    textAlign: "center",
    marginBottom: 12,
  },
  paymentBadge: {
    backgroundColor: appStyles.colorPurple_dac3f6,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 16,
  },
  paymentText: {
    color: appStyles.colorSecondary_9749fa,
    fontSize: 12,
    fontWeight: "600",
  },
  specializations: {
    fontSize: 13,
    color: appStyles.colorGray_66768d,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },
  contactInfo: {
    marginBottom: 24,
  },
  contactItem: {
    fontSize: 13,
    color: appStyles.colorGray_66768d,
    marginBottom: 8,
    lineHeight: 18,
  },
  contactLabel: {
    fontWeight: "600",
    color: appStyles.colorPrimary_20809e,
  },
  actionButtons: {
    gap: 12,
  },
  detailsButton: {
    backgroundColor: appStyles.colorSecondary_9749fa,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  detailsButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  navigationButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  navigationButton: {
    maxWidth: "50%",
    width: "50%",
  },
  actionButton: {
    // width: 40,
    marginLeft: "auto",
    marginRight: "auto",
    borderWidth: 1,
    borderColor: appStyles.colorBlue_3d527b,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});

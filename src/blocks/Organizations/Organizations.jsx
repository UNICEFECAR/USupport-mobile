import React, { useState, useContext, useEffect, useRef } from "react";
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
import { useQueryClient, useMutation } from "@tanstack/react-query";

import {
  AppText,
  Input,
  InteractiveMap,
  Loading,
  OrganizationOverview,
  Avatar,
  Icon,
  TransparentModal,
  NewButton,
  LinearGradient,
  ButtonWithIcon,
} from "#components";
import {
  useGetAllOrganizations,
  useGetClientData,
  useGetLatestBaselineAssessment,
  useCreateBaselineAssessment,
  useGetTheme,
} from "#hooks";
import { appStyles } from "#styles";
import { constructShareUrl } from "#utils";
import { Context, clientSvc, userSvc } from "#services";
import { RequireRegistration, BaselineAssesmentModal } from "#modals";

const { AMAZON_S3_BUCKET } = Config;

/**
 * Organizations
 *
 * Organizations block component that displays a list of organizations with filtering options
 * @returns {JSX.Element}
 */
export const Organizations = ({
  navigation,
  filters,
  setFilters,
  setIsFilterOpen,
  specialisations,
  triggerPersonalization,
  initialFilters,
}) => {
  const { t } = useTranslation("blocks", { keyPrefix: "organizations" });
  const { colors, isHighContrast } = useGetTheme();
  const isLightTheme = colors.background === appStyles.colorWhite_ff;
  const separatorColor = colors.cardMediaSeparator || colors.inputBorder;

  const queryClient = useQueryClient();
  const { isTmpUser } = useContext(Context);

  const [mapControls, setMapControls] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  const [isPersonalizationModalOpen, setIsPersonalizationModalOpen] =
    useState(false);
  const [startPersonalization, setStartPersonalization] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isBaselineAssesmentModalOpen, setIsBaselineAssesmentModalOpen] =
    useState(false);
  const [organizationToZoom, setOrganizationToZoom] = useState(null);

  const [hasAppliedSpecialisations, setHasAppliedSpecialisations] =
    useState(false);
  const scrollViewRef = useRef(null);
  const isMapInteractingRef = useRef(false);

  const clientDataQuery = useGetClientData(!isTmpUser)[0];
  const clientData = clientDataQuery.data;

  const { data: latestAssessment } = useGetLatestBaselineAssessment(!isTmpUser);

  const { data, isLoading } = useGetAllOrganizations({
    search: filters.search,
    district: filters.district,
    paymentMethod: filters.paymentMethod,
    userInteraction: filters.userInteraction,
    specialisations: filters.specialisations,
  });

  useEffect(() => {
    if (
      specialisations?.length > 0 &&
      data &&
      data.length > 0 &&
      !hasAppliedSpecialisations
    ) {
      console.log("APPLY CHANGES");
      setHasAppliedSpecialisations(true);
      handleChange("specialisations", specialisations);
    }
  }, [specialisations, data, hasAppliedSpecialisations]);

  // Auto-trigger personalization when coming from assessment result
  useEffect(() => {
    if (triggerPersonalization && !isTmpUser) {
      personalizationMutation.mutate();
    }
  }, [triggerPersonalization]);

  const createBaselineAssessmentMutation = useCreateBaselineAssessment();

  const personalizationMutation = useMutation({
    mutationFn: async () => {
      return clientSvc.getPersonalizedOrganizations();
    },
    onSuccess: ({ data: specialisations }) => {
      if (specialisations.length) {
        const specialisationIds = specialisations.map(
          (x) => x.organization_specialisation_id
        );
        handleChange("specialisations", specialisationIds);
        setStartPersonalization(true);
      }
    },
  });

  useEffect(() => {
    if (data && data.length && startPersonalization) {
      setOrganizationToZoom(data[0]);
      // handleOrganizationClick(data[0]);
      setStartPersonalization(false);
    }
  }, [startPersonalization, data]);

  const handleChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value,
    });
  };

  const handleResetFilters = () => {
    if (initialFilters) {
      setFilters(initialFilters);
      return;
    }
    setFilters({
      search: "",
      district: "",
      paymentMethod: "",
      userInteraction: "",
      specialisations: [],
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
        phone={organization.phone}
        onPress={() => handleOrganizationClick(organization)}
        onViewDetails={() => {
          navigation.navigate("OrganizationOverview", {
            organizationId: organization.organizationId,
          });
        }}
        t={t}
      />
    ));
  };

  const handlePersonalizeClick = async () => {
    if (isTmpUser) {
      setIsRegistrationModalOpen(true);
      return;
    }
    if (latestAssessment?.status === "completed") {
      personalizationMutation.mutate();
    } else {
      setIsPersonalizationModalOpen(true);
    }
  };

  const handleRegisterRedirection = () => {
    userSvc.logout();
    navigation?.navigate?.("RegisterPreview");
  };

  const handleModalCtaClick = () => {
    setIsPersonalizationModalOpen(false);
    if (!clientData.dataProcessing) {
      setIsBaselineAssesmentModalOpen(true);
    } else if (latestAssessment?.status === "in_progress") {
      navigation.navigate("BaselineAssesment", {
        baselineAssessmentId: latestAssessment.baselineAssessmentId,
      });
    } else {
      createBaselineAssessmentMutation.mutate(undefined, {
        onSuccess: (assessmentData) => {
          queryClient.invalidateQueries({
            queryKey: ["latest-baseline-assessment"],
          });
          navigation.navigate("BaselineAssesment", {
            baselineAssessmentId: assessmentData.baselineAssessmentId,
          });
        },
      });
    }
  };

  // Match ArticleView / CardMedia liquid glass wrapper
  const glassGradient = React.useMemo(
    () => ({
      degrees: 145,
      locations: [0, 100],
      colors:
        isLightTheme && !isHighContrast
          ? ["rgba(255, 255, 255, 0.99)", "rgba(245, 248, 255, 0.85)"]
          : colors.cardMediaGradient,
    }),
    [isLightTheme, isHighContrast, colors.cardMediaGradient]
  );

  return (
    <>
      <TransparentModal
        isOpen={isPersonalizationModalOpen}
        handleClose={() => setIsPersonalizationModalOpen(false)}
        heading={t("personalization")}
        ctaLabel={t("personalization_modal_cta_label")}
        ctaHandleClick={handleModalCtaClick}
      >
        <AppText style={{ paddingBottom: 16 }}>
          {t("personalization_modal_text")}
        </AppText>
      </TransparentModal>
      <RequireRegistration
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        handleRegisterRedirection={handleRegisterRedirection}
      />
      <BaselineAssesmentModal
        open={isBaselineAssesmentModalOpen}
        setOpen={setIsBaselineAssesmentModalOpen}
      />
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={64}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          nestedScrollEnabled={false}
          scrollEventThrottle={16}
        >
          <View style={styles.screen}>
            <LinearGradient
              gradient={glassGradient}
              style={[
                styles.glassCard,
                isLightTheme && !isHighContrast
                  ? styles.liquidGlassShadowLight
                  : appStyles.cardMediaShadowDark,
                {
                  borderColor:
                    isLightTheme && !isHighContrast
                      ? "rgba(224, 233, 255, 0.72)"
                      : colors.cardMediaGradientBorder,
                },
              ]}
            >
              <View style={styles.searchContainer}>
                <Input
                  value={filters.search}
                  onChangeText={(value) => handleChange("search", value)}
                  placeholder={t("search_placeholder")}
                  style={styles.searchInput}
                />
              </View>
              <View style={styles.toolbarActions}>
                <NewButton
                  type="outline"
                  size="sm"
                  label={t("reset_filters")}
                  onPress={handleResetFilters}
                  isFullWidth
                  style={styles.toolbarAction}
                />
                <NewButton
                  type="solid"
                  size="sm"
                  label={t("personalize")}
                  iconName="person"
                  onPress={handlePersonalizeClick}
                  loading={personalizationMutation.isLoading}
                  isFullWidth
                  style={styles.toolbarAction}
                />
                <NewButton
                  type="outline"
                  size="sm"
                  label={t("filter")}
                  iconName="filter"
                  onPress={() => setIsFilterOpen(true)}
                  isFullWidth
                  style={styles.toolbarAction}
                />
              </View>

              <View
                style={[
                  styles.separator,
                  { backgroundColor: separatorColor || "#cdd8e1" },
                ]}
              />

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Loading />
                </View>
              ) : (
                <>
                  <View style={styles.mapWrapper}>
                    <InteractiveMap
                      data={data}
                      onMapReady={handleMapReady}
                      setSelectedMarker={setSelectedOrganization}
                      t={t}
                      style={styles.map}
                      organizationToZoom={organizationToZoom}
                      onInteractionStart={() => {
                        if (!isMapInteractingRef.current) {
                          isMapInteractingRef.current = true;
                          scrollViewRef.current?.setNativeProps({
                            scrollEnabled: false,
                          });
                        }
                      }}
                      onInteractionEnd={() => {
                        if (isMapInteractingRef.current) {
                          isMapInteractingRef.current = false;
                          scrollViewRef.current?.setNativeProps({
                            scrollEnabled: true,
                          });
                        }
                      }}
                    />
                  </View>

                  <View
                    style={[
                      styles.separator,
                      { backgroundColor: separatorColor || "#cdd8e1" },
                    ]}
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
            </LinearGradient>
          </View>
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
        style={[styles.backdropOverlay, { backgroundColor: appStyles.overlay }]}
        onPress={onClose}
        activeOpacity={1}
      />
      <View
        style={[styles.backdropContent, { backgroundColor: colors.background }]}
      >
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <AppText
            style={[styles.closeButtonText, { color: colors.textSecondary }]}
          >
            ✕
          </AppText>
        </TouchableOpacity>

        {/* Organization Logo */}
        {imageURI && (
          <View style={styles.avatarContainer}>
            <Avatar image={{ uri: imageURI }} size="md" />
          </View>
        )}

        {/* Organization Name */}
        <AppText style={[styles.organizationName, { color: colors.text }]}>
          {organization.name}
        </AppText>

        {/* Unit Name */}
        {organization.unitName && (
          <AppText style={[styles.unitName, { color: colors.textSecondary }]}>
            {organization.unitName}
          </AppText>
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
            <AppText
              style={[styles.specializations, { color: colors.textSecondary }]}
            >
              {organization.specialisations
                .map((spec) => t(typeof spec === "string" ? spec : spec.name))
                .join(", ")}
            </AppText>
          )}

        {/* Contact Info */}
        <View style={styles.contactInfo}>
          {organization.phone && (
            <View style={styles.contactContainer}>
              <Icon name="phone" color={appStyles.colorPrimary_20809e} />
              <AppText
                style={[styles.contactItem, { color: colors.textSecondary }]}
              >
                <AppText style={[styles.contactLabel, { color: colors.text }]}>
                  {t("phone")}:
                </AppText>{" "}
                {organization.phone}
              </AppText>
            </View>
          )}
          {organization.email && (
            <View style={styles.contactContainer}>
              <Icon name="mail" color={appStyles.colorPrimary_20809e} />
              <AppText
                style={[styles.contactItem, { color: colors.textSecondary }]}
              >
                <AppText style={[styles.contactLabel, { color: colors.text }]}>
                  {t("email")}:
                </AppText>{" "}
                {organization.email}
              </AppText>
            </View>
          )}
          {organization.address && (
            <View style={styles.contactContainer}>
              <Icon name="location" color={appStyles.colorPrimary_20809e} />
              <AppText
                style={[styles.contactItem, { color: colors.textSecondary }]}
              >
                <AppText style={[styles.contactLabel, { color: colors.text }]}>
                  {t("address")}:
                </AppText>{" "}
                {organization.address}
              </AppText>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Icon name="share" size="sm" color={colors.text} />
          </TouchableOpacity> */}
          <NewButton
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
          <ButtonWithIcon
            iconName="share"
            iconColor={colors.text}
            iconSize="sm"
            label={t("share")}
            onPress={handleShare}
            type="secondary"
            style={[styles.navigationButton, styles.shareButton]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  screen: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  glassCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    padding: 16,
  },
  liquidGlassShadowLight: {
    shadowColor: "rgb(95, 108, 145)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  separator: {
    height: 1,
    width: "100%",
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 16,
    width: "100%",
  },
  toolbarActions: {
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    width: "100%",
    paddingBottom: 16,
    gap: 12,
  },
  toolbarAction: {
    width: "100%",
    minWidth: "100%",
    maxWidth: "100%",
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
  mapWrapper: {
    marginBottom: 16,
  },
  map: {
    flex: 1,
    minHeight: 400,
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
  },
  backdropContent: {
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
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 12,
    marginTop: 20,
  },
  organizationName: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    marginTop: 20,
  },
  unitName: {
    fontSize: 14,
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
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },
  contactContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    paddingBottom: 8,
  },
  contactInfo: {
    marginBottom: 24,
  },
  contactItem: {
    fontSize: 13,
    lineHeight: 18,
  },
  contactLabel: {
    fontWeight: "600",
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
  shareButton: { marginHorizontal: "auto" },
});

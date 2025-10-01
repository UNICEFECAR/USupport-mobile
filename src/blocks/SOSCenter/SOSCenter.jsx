import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { View, StyleSheet } from "react-native";

import { Block, Loading, EmergencyCenter, AppText } from "#components";

import { useEventListener, useAddSosCenterClick } from "#hooks";
import { localStorage, cmsSvc, adminSvc, clientSvc } from "#services";

/**
 * SOSCenter
 *
 * The SOSCenter block
 *
 * @return {jsx}
 */
export const SOSCenter = ({ navigation }) => {
  const { i18n, t } = useTranslation("blocks", { keyPrefix: "sos-center" });

  //--------------------- Country Change Event Listener ----------------------//
  const [currentCountry, setCurrentCountry] = useState();
  useEffect(() => {
    localStorage.getItem("country").then((country) => {
      setCurrentCountry(country || "KZ");
    });
  }, []);

  const handler = useCallback(() => {
    localStorage
      .getItem("country")
      .then((country) => setCurrentCountry(country || "KZ"));
  }, []);

  const IS_RO = currentCountry === "RO";

  // Add event listener
  useEventListener("countryChanged", handler);

  //--------------------- SOS Centers ----------------------//

  const getSOSCenterIds = async () => {
    // Request faq ids from the master DB based for website platform
    const sosCenterIds = await adminSvc.getSOSCenters();

    return sosCenterIds;
  };

  const sosCenterIdsQuerry = useQuery(
    ["sosCenterIds", currentCountry],
    getSOSCenterIds
  );

  const getSOSCenters = async () => {
    let { data } = await cmsSvc.getSOSCenters({
      locale: i18n.language,
      ids: sosCenterIdsQuerry.data,
      populate: true,
    });

    const sosCenters = data.data;

    return sosCenters;
  };

  const {
    data: SOSCentersData,
    isLoading: SOSCentersLoading,
    isFetched: isSOSCentersFetched,
  } = useQuery(
    ["SOSCenters", sosCenterIdsQuerry.data, i18n.language],
    getSOSCenters,
    {
      enabled:
        !sosCenterIdsQuerry.isLoading && sosCenterIdsQuerry.data?.length > 0,
    }
  );

  const getOrganizationSpecializations = async () => {
    const { data } = await clientSvc.getOrganizationSpecializations();
    return data;
  };

  const { data: specializationsData } = useQuery(
    ["organizationSpecializations", currentCountry],
    getOrganizationSpecializations,
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const emergencyServiceSpecialization = specializationsData?.find(
    (specialization) => specialization.name === "emergency_situations"
  );

  const addSosCenterClickMutation = useAddSosCenterClick();

  const handleSosCenterClick = (sosCenter) => {
    const { attributes } = sosCenter;
    let id = sosCenter.id;
    if (attributes.locale !== "en") {
      const englishLocalization = attributes.localizations.data.find(
        (x) => x.attributes.locale === "en"
      );
      if (englishLocalization) {
        id = englishLocalization.id;
      }
    }

    addSosCenterClickMutation.mutate({
      sosCenterId: id,
      isMain: false,
      platform: "client",
    });
  };

  return (
    <Block style={styles.block}>
      {SOSCentersData && (
        <View style={styles.emergencyCenterContainer}>
          {IS_RO && (
            <EmergencyCenter
              onPress={() => {
                navigation.navigate("TabNavigation", {
                  screen: "Consultations",
                  params: {
                    specialisations: [emergencyServiceSpecialization.id],
                  },
                });
              }}
              title={t("other_emergency_services")}
              text={emergencyServiceSpecialization.description}
              showCustomButton
              btnLabelCustom={t("browse")}
            />
          )}
          {SOSCentersData.map((sosCenter, index) => {
            return (
              <EmergencyCenter
                onPress={() => handleSosCenterClick(sosCenter)}
                title={sosCenter.attributes.title}
                text={sosCenter.attributes.text}
                link={sosCenter.attributes.url}
                phone={sosCenter.attributes.phone}
                btnLabelLink={t("button_link")}
                btnLabelCall={t("button_call")}
                image={
                  sosCenter.attributes.image?.data?.attributes?.formats?.medium
                    ?.url
                }
                key={index}
                style={{ marginTop: 20 }}
              />
            );
          })}
        </View>
      )}
      {sosCenterIdsQuerry.data?.length > 0 &&
        !SOSCentersData &&
        SOSCentersLoading && (
          <View style={styles.loadingContainer}>
            <Loading />
          </View>
        )}
      {!SOSCentersData?.length && !SOSCentersLoading && isSOSCentersFetched && (
        <View style={styles.loadingContainer}>
          <AppText className="soscenter__no-results">{t("no_results")}</AppText>
        </View>
      )}
    </Block>
  );
};

const styles = StyleSheet.create({
  block: { paddingBottom: 40 },
  loadingContainer: {
    minHeight: 250,
    alignItems: "center",
    justifyContent: "center",
  },
});

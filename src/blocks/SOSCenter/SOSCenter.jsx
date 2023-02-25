import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { View, StyleSheet } from "react-native";

import { Block, Loading, EmergencyCenter, AppText } from "#components";

import { useEventListener } from "#hooks";
import { localStorage, cmsSvc, adminSvc } from "#services";

/**
 * SOSCenter
 *
 * The SOSCenter block
 *
 * @return {jsx}
 */
export const SOSCenter = () => {
  const { i18n, t } = useTranslation("sos-center");

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

  return (
    <Block style={styles.block}>
      {SOSCentersData && (
        <View style={styles.emergencyCenterContainer}>
          {SOSCentersData.map((sosCenter, index) => {
            return (
              <EmergencyCenter
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

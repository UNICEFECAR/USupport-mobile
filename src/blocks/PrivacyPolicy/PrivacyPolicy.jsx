import React, { useState, useCallback, useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Markdown from "react-native-markdown-display";

import { appStyles } from "#styles";

import { Block, Heading, AppText, Loading } from "#components";

import { useEventListener } from "#hooks";

import { localStorage, cmsSvc } from "#services";

/**
 * PrivacyPolicy
 *
 * PrivacyPolicy block
 *
 * @return {jsx}
 */
export const PrivacyPolicy = ({
  navigation,
  isModal = false,
  handleModalClose,
}) => {
  const { i18n, t } = useTranslation("privacy-policy");

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

  const getPolicies = async () => {
    const { data } = await cmsSvc.getPolicies(
      i18n.language,
      currentCountry,
      "client"
    );

    return data;
  };

  const {
    data: policiesData,
    isLoading: policiesLoading,
    isFetched: isPoliciesFetched,
  } = useQuery(["policies", currentCountry, i18n.language], getPolicies);

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <React.Fragment>
      <Heading
        heading={t("heading")}
        handleGoBack={handleGoBack}
        hasCloseIcon={isModal}
        handleCloseIconPress={handleModalClose}
      />
      <ScrollView>
        <Block style={{ marginTop: 48 }}>
          <View style={styles.privacyContainer}>
            {policiesData && <Markdown style={styles}>{policiesData}</Markdown>}
            {!policiesData && policiesLoading && (
              <View style={styles.loadingContainer}>
                <Loading />
              </View>
            )}
            {!policiesData && !policiesLoading && isPoliciesFetched && (
              <AppText namedStlye="h3" className="privacy-policy__no-results">
                {t("no_results")}
              </AppText>
            )}
          </View>
        </Block>
      </ScrollView>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  privacyContainer: {
    paddingBottom: 28,
  },
  heading2: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: "Nunito_600SemiBold",
    color: appStyles.colorBlue_3d527b,
    marginTop: 32,
    marginBottom: 16,
  },
  paragraph: {
    color: appStyles.colorGray_66768d,
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
    lineHeight: 24,
  },
  loadingContainer: {
    width: "100%",
    height: 250,
    alignItems: "center",
    justifyContent: "center",
  },
});

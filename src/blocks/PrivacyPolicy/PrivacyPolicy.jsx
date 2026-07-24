import React, { useState, useCallback, useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { appStyles } from "#styles";
import { Block, Heading, AppText, Loading, CKRenderer } from "#components";
import { useEventListener, useGetTheme } from "#hooks";
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
  const { i18n, t } = useTranslation("blocks", { keyPrefix: "privacy-policy" });
  const { top: topInset } = useSafeAreaInsets();
  const { isHighContrast } = useGetTheme();

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
      <Block>
        <Heading
          heading={t("heading")}
          handleGoBack={handleGoBack}
          hasCloseIcon={isModal}
          handleCloseIconPress={handleModalClose}
        />
      </Block>
      <ScrollView>
        <Block>
          <View style={styles.privacyContainer}>
            {policiesData && <CKRenderer data={policiesData} />}
            {!policiesData && policiesLoading && (
              <View style={styles.loadingContainer}>
                <Loading />
              </View>
            )}
            {!policiesData && !policiesLoading && isPoliciesFetched && (
              <AppText namedStlye="h3">{t("no_results")}</AppText>
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
    fontFamily: appStyles.fontSemiBold,
    color: appStyles.colorBlue_3d527b,
    marginTop: 32,
    marginBottom: 16,
  },
  paragraph: {
    color: appStyles.colorGray_66768d,
    fontSize: 16,
    fontFamily: appStyles.fontRegular,
    lineHeight: 24,
  },
  loadingContainer: {
    width: "100%",
    height: 250,
    alignItems: "center",
    justifyContent: "center",
  },
  // add table styling for th tr td etc.
  table: {
    borderWidth: 0,
    borderColor: appStyles.colorPrimary_20809e,
  },
  th: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: appStyles.colorPrimary_20809e,
  },
  tr: {
    borderColor: appStyles.colorPrimary_20809e,
  },
  td: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: appStyles.colorPrimary_20809e,
  },
});

const stylesHighContrast = StyleSheet.create({
  heading2: {
    color: "#ffff00",
  },
  paragraph: {
    color: "#ffff00",
  },
  list_item: {
    color: "#ffff00",
  },
});

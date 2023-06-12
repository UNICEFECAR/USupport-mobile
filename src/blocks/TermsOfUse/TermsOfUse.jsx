import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ScrollView, View, StyleSheet } from "react-native";
import Markdown from "react-native-markdown-display";

import { Block, Heading, Loading, AppText } from "#components";

import { appStyles } from "#styles";

import { useEventListener } from "#hooks";

import { localStorage, cmsSvc } from "#services";

/**
 * TermsOfUse
 *
 * TermsOfUse Block
 *
 * @return {jsx}
 */
export const TermsOfUse = ({ navigation }) => {
  const { i18n, t } = useTranslation("terms-of-use");

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

  //--------------------- Terms of Use ----------------------//
  const getTermsOfUse = async () => {
    const { data } = await cmsSvc.getTermsOfUse(
      i18n.language,
      currentCountry,
      "client"
    );

    return data;
  };

  const {
    data: termsOfUseData,
    isLoading: termsOfUseLoading,
    isFetched: isTermsOfUseFetched,
  } = useQuery(["terms-of-use", currentCountry, i18n.language], getTermsOfUse);

  return (
    <ScrollView>
      <Block style={styles.termsOfUse}>
        <Heading
          heading={t("heading")}
          handleGoBack={() => navigation.goBack()}
        />
        <View style={styles.termsOfUse}>
          {termsOfUseData && (
            <Markdown style={styles}>{termsOfUseData}</Markdown>
          )}
          {!termsOfUseData && termsOfUseLoading && (
            <View style={styles.loadingContainer}>
              <Loading />
            </View>
          )}
          {!termsOfUseData && !termsOfUseLoading && isTermsOfUseFetched && (
            <AppText namedStyle="h3">{t("no_results")}</AppText>
          )}
        </View>
      </Block>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  termsOfUse: {
    paddingTop: 24,
  },
  heading1: {
    fontSize: 40,
    lineHeight: 48,
    fontFamily: "Nunito_600SemiBold",
    color: "#3d527b",
  },
  heading2: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: "Nunito_600SemiBold",
    color: "#3d527b",
  },
  heading3: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: "Nunito_600SemiBold",
    color: "#3d527b",
  },
  heading4: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: "Nunito_600SemiBold",
    color: "#3d527b",
  },
  paragraph: {
    color: appStyles.colorGray_66768d,
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
    lineHeight: 24,
  },
  list_item: {
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

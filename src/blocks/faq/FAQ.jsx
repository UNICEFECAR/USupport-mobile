import React, { useState, useCallback, useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { CollapsibleFAQ, Block, Heading, Loading, AppText } from "#components";

import { useEventListener } from "#hooks";

import { localStorage, adminSvc, cmsSvc } from "#services";

/**
 * FAQ
 *
 * FAQ block
 *
 * @return {jsx}
 */
export const FAQ = ({ navigation }) => {
  const { i18n, t } = useTranslation("faq");
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

  //--------------------- FAQs ----------------------//
  const getFAQIds = async () => {
    // Request faq ids from the master DB based for the client platform
    const faqIds = await adminSvc.getFAQs("client");

    return faqIds;
  };

  const faqIdsQuery = useQuery(["faqIds", currentCountry], getFAQIds, {
    enabled: !!currentCountry,
  });

  const getFAQs = async () => {
    let { data } = await cmsSvc.getFAQs({
      locale: i18n.language,
      ids: faqIdsQuery.data,
    });

    const faqs = [];
    data.data.forEach((faq) => {
      faqs.push({
        question: faq.attributes.question,
        answer: faq.attributes.answer,
      });
    });

    return faqs;
  };

  const {
    data: FAQsData,
    isLoading: isFaqLoading,
    isFetched: isFAQsFetched,
  } = useQuery(["FAQs", faqIdsQuery.data, i18n.language], getFAQs, {
    // Run the query when the getCategories and getAgeGroups queries have finished running
    enabled: !faqIdsQuery.isLoading && faqIdsQuery.data?.length > 0,
  });

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <Block>
      <Heading
        heading={t("heading")}
        subheading={t("subheading")}
        handleGoBack={handleGoBack}
      />
      <ScrollView
        style={{ marginTop: 84 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.faqContainer}>
          {isFaqLoading && FAQsData?.length ? (
            <Loading style={styles.loading} />
          ) : (
            <CollapsibleFAQ data={FAQsData} />
          )}
          {((!FAQsData?.length && !isFaqLoading && isFAQsFetched) ||
            faqIdsQuery.data?.length === 0) && (
            <AppText style={styles.noResultText} namedStyle="h3">
              {t("no_results")}
            </AppText>
          )}
        </View>
      </ScrollView>
    </Block>
  );
};

const styles = StyleSheet.create({
  faqContainer: { marginTop: 30, marginBottom: 200 },
  loading: { alignSelf: "center" },
  noResultText: { alignSelf: "center" },
});

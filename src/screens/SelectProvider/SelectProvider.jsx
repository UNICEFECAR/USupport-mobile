import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import { Screen, Heading, Block, Loading, ButtonWithIcon } from "#components";
import { SelectProvider as SelectProviderBlock } from "#blocks";
import { FilterProviders } from "#backdrops";
import { useGetProvidersData } from "#hooks";

/**
 * SelectProvider
 *
 * SelectProvider screen
 *
 * @returns {JSX.Element}
 */
export const SelectProvider = ({ navigation }) => {
  const { t } = useTranslation("select-provider-screen");

  const [providersDataQuery, providersData, setProvidersData] =
    useGetProvidersData();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const closeFilter = () => setIsFilterOpen(false);

  const handleFilterClick = () => {
    setIsFilterOpen(true);
  };

  const checkProviderHasType = (provider, types) => {
    return types
      .map((x) => {
        return provider.specializations.includes(x);
      })
      .some((x) => x === true);
  };

  const handleFilterSave = (data) => {
    const {
      providerTypes,
      providerSex,
      maxPrice,
      language,
      onlyFreeConsultation,
    } = data;
    const initialData = JSON.parse(JSON.stringify(providersDataQuery.data));
    const filteredData = [];
    for (let i = 0; i < initialData.length; i++) {
      const provider = initialData[i];
      const hasType =
        !providerTypes || providerTypes.length === 0
          ? true
          : checkProviderHasType(provider, providerTypes);

      const isDesiredSex =
        !providerSex || providerSex.length === 0
          ? true
          : providerSex.includes(provider.sex);

      const isPriceMatching =
        maxPrice === ""
          ? true
          : provider.price <= Number(maxPrice)
          ? false
          : true;

      const providerLanguages = provider.languages.map((x) => x.language_id);
      const providerHasLanguage = !language
        ? true
        : providerLanguages.includes(language);

      const providesFreeConsultation = !onlyFreeConsultation
        ? true
        : provider.consultationPrice === 0 || !provider.consultationPrice;
      if (
        hasType &&
        isDesiredSex &&
        isPriceMatching &&
        providerHasLanguage &&
        providesFreeConsultation
      ) {
        filteredData.push(provider);
      }
    }
    setProvidersData(filteredData);
    closeFilter();
  };

  return (
    <Screen hasEmergencyButton={false}>
      <ScrollView>
        <Block>
          <Heading
            heading={t("heading")}
            subheading={t("subheading")}
            buttonComponent={
              <ButtonWithIcon
                size="sm"
                color="purple"
                label={t("button_label")}
                iconName="filter"
                iconSize="sm"
                onPress={handleFilterClick}
              />
            }
            handleGoBack={() => navigation.goBack()}
          />
        </Block>
        {providersDataQuery.isLoading && !providersData ? (
          <View style={styles.loadingContainer}>
            <Loading size="lg" />
          </View>
        ) : (
          <SelectProviderBlock
            providers={providersData}
            navigation={navigation}
          />
        )}
      </ScrollView>
      <FilterProviders
        isOpen={isFilterOpen}
        onClose={(data) => handleFilterSave(data)}
        navigation={navigation}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    minHeight: 250,
    alignItems: "center",
    justifyContent: "center",
  },
});

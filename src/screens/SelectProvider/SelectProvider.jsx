import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import {
  AppText,
  Screen,
  Heading,
  Block,
  Loading,
  ButtonWithIcon,
  AppButton,
  TransparentModal,
  Input,
} from "#components";
import { SelectProvider as SelectProviderBlock } from "#blocks";
import { FilterProviders } from "#backdrops";
import { useGetProvidersData, useError } from "#hooks";
import { Context, clientSvc } from "#services";
import { useQueryClient } from "@tanstack/react-query";

/**
 * SelectProvider
 *
 * SelectProvider screen
 *
 * @returns {JSX.Element}
 */
export const SelectProvider = ({ navigation }) => {
  const { t } = useTranslation("select-provider-screen");
  const queryClient = useQueryClient();

  const { activeCoupon, setActiveCoupon } = useContext(Context);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponValue, setCouponValue] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [providersDataQuery, providersData, setProvidersData] =
    useGetProvidersData(activeCoupon);

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
          : provider.consultationPrice <= Number(maxPrice)
          ? true
          : false;

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

  const openCouponModal = () => setIsCouponModalOpen(true);
  const closeCouponModal = () => setIsCouponModalOpen(false);

  const removeCoupon = () => {
    setActiveCoupon(null);
  };

  const handleSubmitCoupon = async () => {
    setIsLoading(true);
    try {
      const { data } = await clientSvc.checkIsCouponAvailable(couponValue);
      if (data?.campaign_id) {
        setActiveCoupon({
          couponValue,
          campaignId: data.campaign_id,
        });
        closeCouponModal();
        queryClient.invalidateQueries(["provider-data"]);
      }
    } catch (err) {
      const { message: errorMessage } = useError(err);
      setCouponError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
    setActiveCoupon(null);
  };

  return (
    <Screen>
      <Heading
        heading={t("heading")}
        subheading={t("subheading")}
        handleGoBack={handleGoBack}
      />
      <ScrollView style={{ marginTop: 112 }}>
        <Block>
          <View style={styles.buttonContainer}>
            <AppButton
              label={
                activeCoupon
                  ? t("remove_coupon_label")
                  : t("button_coupon_label")
              }
              size="sm"
              color="green"
              type="secondary"
              onPress={activeCoupon ? removeCoupon : openCouponModal}
              style={{ marginRight: 8 }}
            />
            <ButtonWithIcon
              size="sm"
              color="purple"
              label={t("button_label")}
              iconName="filter"
              iconSize="sm"
              onPress={handleFilterClick}
            />
          </View>
        </Block>
        {providersDataQuery.isFetching ||
        (providersDataQuery.isLoading && !providersData) ? (
          <View style={styles.loadingContainer}>
            <Loading size="lg" />
          </View>
        ) : (
          <SelectProviderBlock
            providers={providersData}
            navigation={navigation}
            activeCoupon={activeCoupon}
          />
        )}
      </ScrollView>
      <TransparentModal
        isOpen={isCouponModalOpen}
        handleClose={closeCouponModal}
        heading={t("modal_coupon_heading")}
        ctaLabel={t("modal_coupon_button_label")}
        ctaHandleClick={handleSubmitCoupon}
        isCtaLoading={isLoading}
        errorMessage={couponError}
      >
        <AppText namedStyle="text">{t("coupon_paragraph")}</AppText>
        <AppText namedStyle="text">{t("coupon_paragraph_two")}</AppText>
        <Input
          label={t("modal_coupon_input_label")}
          placeholder={t("modal_coupon_input_placeholder")}
          value={couponValue}
          style={{ marginVertical: 26 }}
          onChange={(value) => setCouponValue(value)}
        />
      </TransparentModal>
      <FilterProviders
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onSave={handleFilterSave}
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
  buttonContainer: {
    justifyContent: "flex-end",
    flexDirection: "row",
    paddingTop: 16,
  },
});

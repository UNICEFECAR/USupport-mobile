import React, { useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import {
  AppText,
  Screen,
  Heading,
  ButtonWithIcon,
  AppButton,
  TransparentModal,
  Input,
  Toggle,
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

  const initialFilters = {
    providerTypes: [],
    providerSex: [],
    maxPrice: "",
    language: null,
    onlyFreeConsultation: false,
    availableAfter: "",
    availableBefore: "",
  };
  const [allFilters, setAllFilters] = useState({
    ...initialFilters,
  });

  const onSuccess = () => {
    setIsFiltering(false);
  };
  const providersQuery = useGetProvidersData(
    activeCoupon,
    allFilters,
    onSuccess
  );
  const [providersData, setProvidersData] = useState();

  useEffect(() => {
    if (providersQuery.data) {
      setProvidersData(providersQuery.data.pages.flat());
    }
  }, [providersQuery.data]);

  const closeFilter = () => setIsFilterOpen(false);

  const handleFilterClick = () => {
    setIsFilterOpen(true);
  };

  // Set this to true when the filters have been changed and set
  // it back to false when the providers data has been fetched
  const [isFiltering, setIsFiltering] = useState(false);
  const handleFilterSave = (data) => {
    setIsFiltering(true);

    setAllFilters((prev) => ({ ...prev, ...data }));

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
      <View style={{ marginTop: 90 }} />

      <SelectProviderBlock
        providers={providersData}
        navigation={navigation}
        activeCoupon={activeCoupon}
        providersQuery={providersQuery}
        isFiltering={isFiltering}
        setIsFiltering={setIsFiltering}
        HeaderComponent={
          <>
            <View style={styles.buttonContainer}>
              <ButtonWithIcon
                size="sm"
                color="purple"
                label={t("button_label")}
                iconName="filter"
                iconSize="sm"
                onPress={handleFilterClick}
              />
            </View>
            <FiltersBlock
              handleSave={handleFilterSave}
              t={t}
              activeCoupon={activeCoupon}
              removeCoupon={removeCoupon}
              openCouponModal={openCouponModal}
              allFilters={allFilters}
              setAllFilters={setAllFilters}
            />
          </>
        }
      />
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
        allFilters={allFilters}
        setAllFilters={setAllFilters}
      />
    </Screen>
  );
};

const FiltersBlock = ({
  handleSave,
  activeCoupon,
  removeCoupon,
  openCouponModal,
  allFilters,
  setAllFilters,
  t,
}) => {
  const [data, setData] = useState({
    maxPrice: "",
    onlyFreeConsultation: false,
  });

  useEffect(() => {
    setData({ ...allFilters });
  }, [allFilters]);

  const handleChange = (field, val) => {
    const newData = { ...data };
    newData[field] = val;
    setAllFilters(newData);
    handleSave(newData);
  };

  return (
    <View style={{ paddingBottom: 20 }}>
      <AppButton
        label={
          activeCoupon ? t("remove_coupon_label") : t("button_coupon_label")
        }
        size="sm"
        color="green"
        onPress={activeCoupon ? removeCoupon : openCouponModal}
      />
      <Input
        type="number"
        label={t("max_price")}
        placeholder={t("max_price")}
        value={allFilters.maxPrice}
        onChange={(e) => handleChange("maxPrice", e)}
        style={{ marginTop: 16 }}
      />
      <Toggle
        isToggled={allFilters.onlyFreeConsultation}
        handleToggle={(val) => handleChange("onlyFreeConsultation", val)}
        label={t("providers_free_consultation_label")}
        wrapperStyles={{
          marginTop: 16,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    minHeight: 250,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    paddingTop: 16,
    paddingBottom: 16,
  },
});

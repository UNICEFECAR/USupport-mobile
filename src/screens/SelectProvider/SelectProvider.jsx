import React, {
  useMemo,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { AppText, Screen, Heading, TransparentModal, Input } from "#components";

import { SelectProvider as SelectProviderBlock } from "#blocks";

import { FilterProviders } from "#backdrops";

import { useGetProvidersData, useError } from "#hooks";

import {
  Context,
  clientSvc,
  localStorage,
  countrySvc,
  languageSvc,
} from "#services";

const fetchCountry = async () => {
  const { data } = await countrySvc.getActiveCountries();
  const currentCountryId = await localStorage.getItem("country_id");
  const currentCountry = data.find((x) => x.country_id === currentCountryId);
  return currentCountry?.alpha2 === "KZ" ? true : false;
};

/**
 * SelectProvider
 *
 * SelectProvider screen
 *
 * @returns {JSX.Element}
 */
export const SelectProvider = ({ navigation }) => {
  const { t } = useTranslation("screens", {
    keyPrefix: "select-provider-screen",
  });
  const queryClient = useQueryClient();

  const { activeCoupon, setActiveCoupon, country, selectedCountry } =
    useContext(Context);
  const [headingHeight, setHeadingHeight] = useState(0);

  const { data: isKzCountry } = useQuery(["country-min-price"], fetchCountry);

  // Determine the default billing type from selectedCountry (paid / coupon / free)
  const getDefaultBillingType = useCallback(() => {
    if (!selectedCountry) return null;
    const {
      hasPayments,
      hasCoupons,
      hasFreeConsultations,
      defaultBillingType,
    } = selectedCountry;
    if (defaultBillingType) {
      if (defaultBillingType === "paid" && hasPayments) return "paid";
      if (defaultBillingType === "coupon" && hasCoupons) return "coupon";
      if (defaultBillingType === "free" && hasFreeConsultations) return "free";
    }
    if (hasPayments) return "paid";
    if (hasCoupons) return "coupon";
    if (hasFreeConsultations) return "free";
    return null;
  }, [selectedCountry]);

  const [selectedBillingType, setSelectedBillingType] = useState(null);

  // Set default billing type when country is loaded (only once)
  useEffect(() => {
    if (!selectedCountry || selectedBillingType !== null) return;
    const defaultType = getDefaultBillingType();
    if (defaultType) setSelectedBillingType(defaultType);
  }, [selectedCountry, getDefaultBillingType, selectedBillingType]);

  const defaultCouponCode = selectedCountry?.defaultCouponCode;
  const defaultCouponQuery = useQuery(
    ["default-coupon", defaultCouponCode],
    () =>
      clientSvc
        .checkIsCouponAvailable(defaultCouponCode)
        .then((res) => res.data),
    { enabled: !!defaultCouponCode }
  );

  // Skip re-applying default when user explicitly removed the coupon (e.g. switched to free then back to coupon).
  const userRemovedCouponRef = useRef(false);

  // On coupon tab with no coupon set yet: apply default from query. Skip if user explicitly removed the coupon.
  useEffect(() => {
    if (selectedBillingType !== "coupon") return;
    if (userRemovedCouponRef.current) return;
    const data = defaultCouponQuery.data;
    if (!defaultCouponCode || !data?.campaign_id) return;
    setActiveCoupon((current) => {
      if (current) return current;
      return { couponValue: defaultCouponCode, campaignId: data.campaign_id };
    });
  }, [
    selectedBillingType,
    defaultCouponCode,
    defaultCouponQuery.data,
    setActiveCoupon,
  ]);

  // When user leaves the coupon tab, clear activeCoupon in context so ProviderOverview and others see null.
  // activeCoupon in context should only be set while on the coupon tab.
  useEffect(() => {
    if (selectedBillingType !== "coupon") {
      setActiveCoupon(null);
    }
  }, [selectedBillingType, setActiveCoupon]);

  // Use coupon only when on coupon tab; when on paid/free, pass null so providers query doesn't use it
  const effectiveActiveCoupon =
    selectedBillingType === "coupon" ? activeCoupon : null;

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponValue, setCouponValue] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showCoupon, setShowCoupon] = useState(null);
  const [showPrices, setShowPrices] = useState(true);

  useEffect(() => {
    if (selectedCountry) {
      setShowCoupon(selectedCountry.hasCoupons ?? country !== "KZ");
      setShowPrices(
        selectedCountry.hasPayments !== false &&
          country !== "KZ" &&
          country !== "PL"
      );
    } else {
      localStorage.getItem("country").then((countryCode) => {
        setShowCoupon(countryCode !== "KZ");
        setShowPrices(countryCode !== "KZ" && countryCode !== "PL");
      });
    }
  }, [selectedCountry, country]);

  const { data: languages } = useQuery(["languages"], async () => {
    const res = await languageSvc.getActiveLanguages();
    const data = res.data?.map((x) => {
      return {
        language_id: x.language_id,
        value: x.alpha2,
        name: x.name === "English" ? "English" : `${x.name} (${x.local_name})`,
      };
    });
    return data.sort((a, b) => a.name.localeCompare(b.name)) || [];
  });

  const initialFilters = useMemo(() => {
    return {
      providerTypes: [],
      providerSex: [],
      maxPrice: "",
      language: null,
      onlyFreeConsultation: isKzCountry || false,
      availableAfter: "",
      availableBefore: "",
    };
  }, [isKzCountry]);

  const onRefresh = () => {
    queryClient.invalidateQueries(["all-providers-data"]);
  };

  const [allFilters, setAllFilters] = useState({
    ...initialFilters,
  });

  useEffect(() => {
    if (isKzCountry) {
      setAllFilters((prev) => ({
        ...prev,
        onlyFreeConsultation: true,
      }));
    }
  }, [isKzCountry]);

  const onSuccess = () => {
    setIsFiltering(false);
  };
  const providersQuery = useGetProvidersData(
    effectiveActiveCoupon,
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
    if (JSON.stringify(data) !== JSON.stringify(allFilters)) {
      setIsFiltering(true);
    }

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
        queryClient.invalidateQueries(["all-providers-data"]);
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
        onLayout={(e) => {
          setHeadingHeight(e.nativeEvent.layout.height);
        }}
        handleGoBack={handleGoBack}
      />
      <View style={{ marginTop: headingHeight + 8 }} />

      <SelectProviderBlock
        providers={providersData}
        navigation={navigation}
        activeCoupon={effectiveActiveCoupon}
        setActiveCoupon={setActiveCoupon}
        onCouponRemoved={() => {
          userRemovedCouponRef.current = true;
        }}
        providersQuery={providersQuery}
        isFiltering={isFiltering}
        setIsFiltering={setIsFiltering}
        onRefresh={onRefresh}
        selectedBillingType={selectedBillingType}
        setSelectedBillingType={setSelectedBillingType}
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
        isToggleDisabled={!showPrices}
        languages={languages || []}
        initialFilters={initialFilters}
      />
    </Screen>
  );
};

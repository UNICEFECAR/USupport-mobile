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

export const SelectProvider = ({ navigation, route }) => {
  const { t } = useTranslation("screens", {
    keyPrefix: "select-provider-screen",
  });
  const queryClient = useQueryClient();

  const urlCoupon = route?.params?.coupon?.trim?.() || null;

  const { activeCoupon, setActiveCoupon, country, selectedCountry } =
    useContext(Context);
  const [headingHeight, setHeadingHeight] = useState(0);

  const { data: isKzCountry } = useQuery(["country-min-price"], fetchCountry);

  // Determine the default billing type based on country settings (or URL coupon)
  const getDefaultBillingType = useCallback(() => {
    if (!selectedCountry) return null;
    const {
      hasPayments,
      hasCoupons,
      hasFreeConsultations,
      defaultBillingType,
    } = selectedCountry;

    // If URL has a coupon param, show the coupon tab (so user sees the coupon form)
    if (urlCoupon && hasCoupons) return "coupon";

    // If defaultBillingType is set and the corresponding option is available, use it
    if (defaultBillingType) {
      if (defaultBillingType === "paid" && hasPayments) return "paid";
      if (defaultBillingType === "coupon" && hasCoupons) return "coupon";
      if (defaultBillingType === "free" && hasFreeConsultations) return "free";
    }

    // Fallback to first available option
    if (hasPayments) return "paid";
    if (hasCoupons) return "coupon";
    if (hasFreeConsultations) return "free";

    return null;
  }, [selectedCountry, urlCoupon]);

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
    {
      // Only use default coupon when there is no coupon in the URL
      enabled: !!defaultCouponCode && !urlCoupon,
    }
  );

  // Skip re-applying URL/default when user explicitly removed the coupon (e.g. switched to free then back to coupon).
  const userRemovedCouponRef = useRef(false);

  useEffect(() => {
    userRemovedCouponRef.current = false;
  }, [urlCoupon]);

  // Validate URL coupon if present
  const urlCouponQuery = useQuery(
    ["url-coupon", urlCoupon],
    () => clientSvc.checkIsCouponAvailable(urlCoupon).then((res) => res.data),
    { enabled: !!urlCoupon, retry: false }
  );

  const safeUrlCouponError = urlCouponQuery.error ?? {
    response: { data: { error: { message: null } } },
  };
  const urlCouponErrorData = useError(safeUrlCouponError);
  const [urlCouponErrorDismissed, setUrlCouponErrorDismissed] =
    useState(false);
  const urlCouponErrorMessage =
    !urlCouponErrorDismissed &&
    urlCoupon &&
    urlCouponQuery.isFetched &&
    !urlCouponQuery.data?.campaign_id
      ? urlCouponErrorData?.message || t("coupon_not_found_error")
      : null;

  useEffect(() => {
    setUrlCouponErrorDismissed(false);
  }, [urlCoupon]);

  // On coupon tab: apply URL coupon if valid; if URL coupon invalid, clear activeCoupon so input shows URL coupon.
  // Only use country default when there is no URL coupon and user hasn't explicitly removed coupon.
  // If user explicitly removed the coupon (e.g. switched to free then back to coupon), do not re-apply URL or default.
  useEffect(() => {
    if (selectedBillingType !== "coupon") return;

    setActiveCoupon((current) => {
      // User explicitly removed coupon – keep removed state when switching back to coupon tab
      if (userRemovedCouponRef.current) {
        return current;
      }

      // URL coupon takes precedence
      if (urlCoupon) {
        if (urlCouponQuery.data?.campaign_id) {
          return {
            couponValue: urlCoupon,
            campaignId: urlCouponQuery.data.campaign_id,
          };
        }
        // URL coupon invalid – clear so input shows only urlCoupon
        if (urlCouponQuery.isFetched) {
          return null;
        }
        // Still validating URL coupon – keep current
        return current;
      }

      // No URL coupon: apply country default if available
      const data = defaultCouponQuery.data;
      if (!defaultCouponCode || !data?.campaign_id) return current;

      if (current) return current;
      return {
        couponValue: defaultCouponCode,
        campaignId: data.campaign_id,
      };
    });
  }, [
    selectedBillingType,
    defaultCouponCode,
    defaultCouponQuery.data,
    urlCoupon,
    urlCouponQuery.data,
    urlCouponQuery.isFetched,
    setActiveCoupon,
  ]);

  // Use coupon only when on coupon tab; when on paid/free, pass null so providers query doesn't use it
  const effectiveActiveCoupon =
    selectedBillingType === "coupon" ? activeCoupon : null;

  // On coupon tab with no coupon set yet: apply default from query. Skip if user explicitly removed the coupon.
  // (Kept for backwards compatibility when there is no URL coupon; logic above already handles this case.)
  useEffect(() => {
    if (selectedBillingType !== "coupon") return;
    if (userRemovedCouponRef.current) return;
    if (urlCoupon) return;
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
    urlCoupon,
    setActiveCoupon,
  ]);

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
        urlCoupon={urlCoupon}
        urlCouponErrorMessage={urlCouponErrorMessage}
        onUrlCouponErrorDismiss={() => setUrlCouponErrorDismissed(true)}
        providersQuery={providersQuery}
        isFiltering={isFiltering}
        setIsFiltering={setIsFiltering}
        onRefresh={onRefresh}
        selectedBillingType={selectedBillingType}
        setSelectedBillingType={setSelectedBillingType}
        handleFilterClick={handleFilterClick}
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

import React, { useContext, useMemo, useState, useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import {
  AppText,
  ProviderOverview,
  Loading,
  Input,
  NewButton,
  Icon,
} from "#components";

import { Context, clientSvc } from "#services";
import { useError, useGetTheme } from "#hooks";
import { isPeerSupportProvider } from "#utils";
import { appStyles } from "#styles";

export const PROVIDER_CATEGORIES = {
  PROVIDERS: "providers",
  U_FRIEND: "u-friend",
};

export const SelectProvider = ({
  providers,
  providerCategory = PROVIDER_CATEGORIES.PROVIDERS,
  setProviderCategory,
  showCategoryTabs = false,
  navigation,
  activeCoupon,
  setActiveCoupon,
  onCouponRemoved,
  urlCoupon,
  urlCouponErrorMessage,
  onUrlCouponErrorDismiss,
  providersQuery,
  HeaderComponent,
  isFiltering,
  selectedBillingType,
  setSelectedBillingType,
  handleFilterClick,
  hasActiveCampaign,
  filterButtonLabel,
}) => {
  const { t } = useTranslation("blocks", { keyPrefix: "select-provider" });
  const tScreen = useTranslation("screens", {
    keyPrefix: "select-provider-screen",
  }).t;
  const { currencySymbol, selectedCountry } = useContext(Context);
  const { colors, isDarkMode } = useGetTheme();
  const isUFriendCategory =
    showCategoryTabs && providerCategory === PROVIDER_CATEGORIES.U_FRIEND;

  const [couponValue, setCouponValue] = useState(
    () =>
      activeCoupon?.couponValue ||
      urlCoupon ||
      selectedCountry?.defaultCouponCode ||
      ""
  );
  const [couponError, setCouponError] = useState("");
  const [isLoadingCoupon, setIsLoadingCoupon] = useState(false);
  const [userRemovedCoupon, setUserRemovedCoupon] = useState(false);

  useEffect(() => {
    if (activeCoupon) {
      setUserRemovedCoupon(false);
    }

    const value =
      activeCoupon?.couponValue ??
      (userRemovedCoupon ? "" : urlCoupon) ??
      selectedCountry?.defaultCouponCode ??
      "";
    setCouponValue(value);
  }, [
    activeCoupon?.couponValue,
    urlCoupon,
    selectedCountry?.defaultCouponCode,
    userRemovedCoupon,
  ]);

  useEffect(() => {
    setUserRemovedCoupon(false);
  }, [urlCoupon]);

  const billingTabs = useMemo(() => {
    if (!selectedCountry) return [];

    const tabs = [];
    const { hasPayments, hasCoupons, hasFreeConsultations } = selectedCountry;

    if (hasPayments) {
      tabs.push({
        label: t("tab_paid"),
        value: "paid",
        isSelected: selectedBillingType === "paid",
      });
    }
    if (hasCoupons && hasActiveCampaign) {
      tabs.push({
        label: t("tab_coupon"),
        value: "coupon",
        isSelected: selectedBillingType === "coupon",
      });
    }
    if (hasFreeConsultations) {
      tabs.push({
        label: t("tab_free"),
        value: "free",
        isSelected: selectedBillingType === "free",
      });
    }
    return tabs;
  }, [selectedCountry, selectedBillingType, t, hasActiveCampaign]);

  const categoryTabs = [
    {
      value: PROVIDER_CATEGORIES.PROVIDERS,
      label: t("tab_providers"),
      iconName: "two-people",
    },
    {
      value: PROVIDER_CATEGORIES.U_FRIEND,
      label: t("tab_u_friend"),
      iconName: "heart",
    },
  ];

  const handleProviderClick = (providerId) => {
    navigation.push("ProviderOverview", {
      providerId,
      billingType: selectedBillingType,
    });
  };

  const handleBookSessionClick = (providerId) => {
    navigation.push("ProviderOverview", {
      providerId,
      billingType: selectedBillingType,
      openSchedule: true,
    });
  };

  const handleSubmitCoupon = async () => {
    setIsLoadingCoupon(true);
    setCouponError("");
    try {
      const { data } = await clientSvc.checkIsCouponAvailable(couponValue);
      if (data?.campaign_id) {
        setActiveCoupon({
          couponValue,
          campaignId: data.campaign_id,
        });
        setCouponError("");
      }
    } catch (err) {
      const errData = useError(err);
      const errorMessage =
        errData?.message ?? err?.message ?? t("error_invalid_coupon");
      setCouponError(errorMessage);
    } finally {
      setIsLoadingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setUserRemovedCoupon(true);
    setActiveCoupon(null);
    setCouponValue("");
    setCouponError("");
    onCouponRemoved?.();
    onUrlCouponErrorDismiss?.();
  };

  const isCouponTabSelected =
    selectedBillingType === "coupon" && !!hasActiveCampaign;
  const showProvidersList = !isCouponTabSelected || activeCoupon;
  // "Providers" are everyone without the peer_support specialization,
  // "U-Friend" are the peer_support ones
  const listData = useMemo(() => {
    if (!showProvidersList || isFiltering) return [];
    if (!showCategoryTabs) return providers || [];
    return (providers || []).filter(
      (provider) =>
        isPeerSupportProvider(provider.specializations) === isUFriendCategory
    );
  }, [
    providers,
    showProvidersList,
    isFiltering,
    showCategoryTabs,
    isUFriendCategory,
  ]);

  // The category split happens on the client, so when a loaded page has no
  // providers for the selected category keep loading until we find some
  useEffect(() => {
    if (
      showProvidersList &&
      !isFiltering &&
      listData.length === 0 &&
      providersQuery.hasNextPage &&
      !providersQuery.isFetching
    ) {
      providersQuery.fetchNextPage();
    }
  }, [
    listData.length,
    showProvidersList,
    isFiltering,
    providersQuery.hasNextPage,
    providersQuery.isFetching,
  ]);

  const renderCouponInput = () => (
    <View style={styles.couponSection}>
      <View style={styles.couponHeader}>
        <AppText namedStyle="text" style={styles.couponText}>
          {tScreen("coupon_paragraph")}
        </AppText>
        <AppText namedStyle="text" style={styles.couponText}>
          {tScreen("coupon_paragraph_two")}
        </AppText>
      </View>
      <Input
        label={tScreen("modal_coupon_input_label")}
        placeholder={tScreen("modal_coupon_input_placeholder")}
        value={couponValue}
        onChange={(value) => {
          setCouponValue(value);
          if (value === "" && urlCoupon) {
            setUserRemovedCoupon(true);
            onUrlCouponErrorDismiss?.();
          }
        }}
        errorMessage={
          activeCoupon ? null : urlCouponErrorMessage || couponError
        }
        style={styles.couponInput}
        autoCapitalize="none"
      />
      {selectedCountry?.defaultCouponCode && !urlCoupon && (
        <AppText style={styles.couponNote} namedStyle="smallText">
          {t("coupon_note")}
        </AppText>
      )}
      <View style={styles.couponButtons}>
        <NewButton
          label={tScreen("modal_coupon_button_label")}
          onPress={handleSubmitCoupon}
          loading={isLoadingCoupon}
          disabled={!couponValue || isLoadingCoupon}
          size="md"
        />
        {(activeCoupon || (urlCoupon && !userRemovedCoupon)) && (
          <NewButton
            label={tScreen("remove_coupon_label")}
            onPress={handleRemoveCoupon}
            type="red"
            size="md"
          />
        )}
      </View>
    </View>
  );

  const renderListContent = () => {
    if (
      (providersQuery.isFetching || providersQuery.isRefetching) &&
      !providersQuery.isFetchingNextPage
    ) {
      return (
        <View style={styles.loadingContainer}>
          <Loading size="lg" />
        </View>
      );
    }

    if (isCouponTabSelected && !activeCoupon) {
      return (
        <View style={styles.emptyContainer}>
          <AppText namedStyle="text">
            {t("enter_coupon_to_see_providers")}
          </AppText>
        </View>
      );
    }

    if (listData.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <AppText namedStyle="h3" style={styles.centeredText}>
            {isUFriendCategory ? t("no_u_friends") : t("no_match")}
          </AppText>
        </View>
      );
    }

    return listData.map((provider) => (
      <ProviderOverview
        key={provider.providerDetailId}
        currencySymbol={currencySymbol}
        earliestAvailableSlot={provider.earliestAvailableSlot}
        earliestAvailableSlotDurationMinutes={
          provider.earliestAvailableSlotDurationMinutes
        }
        freeLabel={selectedBillingType === "free" ? t("free") : t("coupon")}
        viewProfileLabel={t("view_profile")}
        bookSessionLabel={t("book_session")}
        image={provider.image}
        name={provider.name}
        onPress={() => handleProviderClick(provider.providerDetailId)}
        handleViewProfile={() => handleProviderClick(provider.providerDetailId)}
        handleBookSession={() =>
          handleBookSessionClick(provider.providerDetailId)
        }
        patronym={provider.patronym}
        price={
          selectedBillingType === "free"
            ? 0
            : activeCoupon
              ? null
              : provider.consultationPrice
        }
        provider={provider}
        specializationKeys={provider.specializations}
        surname={provider.surname}
        style={styles.providerItem}
        t={t}
      />
    ));
  };

  const segmentBackground = isDarkMode
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(106, 79, 251, 0.12)";
  const chipBorderColor = isDarkMode
    ? "rgba(255, 255, 255, 0.2)"
    : "rgba(106, 79, 251, 0.24)";
  const activeColor = isDarkMode
    ? colors.tabUnderlinedBorder || appStyles.colorPurple_c39af9
    : appStyles.colorPurple;

  const renderCategoryTabs = () => (
    <View
      style={[styles.segmented, { backgroundColor: segmentBackground }]}
      accessibilityRole="tablist"
    >
      {categoryTabs.map((tab) => {
        const isSelected = tab.value === providerCategory;
        const color = isSelected ? activeColor : colors.textSecondary;
        return (
          <Pressable
            key={tab.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => setProviderCategory?.(tab.value)}
            style={[
              styles.segment,
              isSelected && [
                styles.segmentSelected,
                { backgroundColor: colors.card },
              ],
            ]}
          >
            <Icon name={tab.iconName} size="md" color={color} />
            <AppText
              namedStyle="text"
              style={[styles.segmentText, { color }]}
            >
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );

  const renderBillingChips = () => (
    <View style={styles.chipsRow}>
      <View style={styles.chips}>
        {billingTabs.length > 1 &&
          billingTabs.map((tab) => (
            <Pressable
              key={tab.value}
              accessibilityRole="button"
              accessibilityState={{ selected: tab.isSelected }}
              onPress={() => setSelectedBillingType?.(tab.value)}
              style={[
                styles.chip,
                tab.isSelected
                  ? { backgroundColor: activeColor, borderColor: activeColor }
                  : {
                      backgroundColor: colors.card,
                      borderColor: chipBorderColor,
                    },
              ]}
            >
              <AppText
                namedStyle="text"
                style={[
                  styles.chipText,
                  {
                    color: tab.isSelected
                      ? appStyles.colorWhite_ff
                      : colors.text,
                  },
                ]}
              >
                {tab.label}
              </AppText>
            </Pressable>
          ))}
      </View>
      {!!handleFilterClick && (
        <Pressable
          accessibilityRole="button"
          onPress={handleFilterClick}
          style={[
            styles.filterButton,
            { backgroundColor: colors.card, borderColor: activeColor },
          ]}
        >
          <Icon name="filter" size="sm" color={activeColor} />
          <AppText
            namedStyle="text"
            style={[styles.chipText, { color: activeColor }]}
          >
            {filterButtonLabel || t("filters")}
          </AppText>
        </Pressable>
      )}
    </View>
  );

  const isLoadingList =
    (providersQuery.isFetching || providersQuery.isRefetching) &&
    !providersQuery.isFetchingNextPage;

  // Without the category tabs the list isn't limited to psychologists,
  // so it keeps the generic "Available providers" heading
  const sectionTitle = isUFriendCategory
    ? t("available_u_friends")
    : showCategoryTabs
      ? t("available_psychologists")
      : t("available_providers");

  return (
    <View style={styles.root}>
      {HeaderComponent}
      {showCategoryTabs && renderCategoryTabs()}
      {renderBillingChips()}
      <AppText
        namedStyle="smallText"
        style={[styles.connectText, { color: colors.textSecondary }]}
      >
        {t("connect_by")}
      </AppText>
      {isCouponTabSelected && renderCouponInput()}

      {showProvidersList && !isLoadingList && (
        <View style={styles.sectionHeader}>
          <AppText namedStyle="h3" style={styles.sectionTitle}>
            {sectionTitle}
          </AppText>
          <AppText
            namedStyle="text"
            style={[styles.sectionCount, { color: colors.textSecondary }]}
          >
            {t("available_count", { count: listData.length })}
          </AppText>
        </View>
      )}

      {renderListContent()}

      {providersQuery.isFetchingNextPage && (
        <View style={styles.loadingContainer}>
          <Loading size="lg" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  segmented: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 4,
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  segmentSelected: {
    ...appStyles.shadow1,
  },
  segmentText: {
    paddingTop: 0,
    fontFamily: appStyles.fontSemiBold,
  },
  chipsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 20,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    flexShrink: 1,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    ...appStyles.shadow1,
  },
  chipText: {
    paddingTop: 0,
    fontFamily: appStyles.fontMedium,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    ...appStyles.shadow1,
  },
  connectText: {
    marginTop: 12,
    textAlign: "left",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    flexShrink: 1,
    textAlign: "left",
  },
  sectionCount: {
    paddingTop: 0,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  centeredText: {
    textAlign: "center",
  },
  couponSection: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 0,
    marginBottom: 8,
  },
  couponHeader: {
    marginBottom: 16,
  },
  couponText: {
    marginBottom: 6,
  },
  couponInput: {
    marginBottom: 12,
  },
  couponNote: {
    paddingTop: 3,
    fontSize: 12,
    textAlign: "left",
  },
  couponButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  providerItem: {
    marginBottom: 16,
  },
});

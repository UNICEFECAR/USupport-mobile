import React, { useContext, useMemo, useState, useEffect } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import {
  Block,
  AppText,
  ProviderOverview,
  Loading,
  Tabs,
  Input,
  AppButton,
  NewButton,
} from "#components";

import { Context, clientSvc } from "#services";
import { FlashList } from "@shopify/flash-list";
import { useError } from "#hooks";

/**
 * SelectProvider
 *
 * SelectProvider block with billing tabs (paid/coupon/free) and coupon input.
 *
 * @returns {JSX.Element}
 */
export const SelectProvider = ({
  providers,
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
  onRefresh,
  selectedBillingType,
  setSelectedBillingType,
  handleFilterClick,
  hasActiveCampaign,
}) => {
  const { t } = useTranslation("blocks", { keyPrefix: "select-provider" });
  const tScreen = useTranslation("screens", {
    keyPrefix: "select-provider-screen",
  }).t;
  const { currencySymbol, selectedCountry } = useContext(Context);

  // Coupon input state (urlCoupon from URL takes precedence for display when no active coupon yet)
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

  // Keep input in sync when active coupon, URL coupon, or country default changes
  // (don't restore urlCoupon after user clicked Remove).
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

  // Reset "user removed" when URL coupon changes (e.g. navigated to different link)
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

  const handleTabSelect = (index) => {
    const selectedTab = billingTabs[index];
    if (selectedTab && setSelectedBillingType) {
      setSelectedBillingType(selectedTab.value);
    }
  };

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
  const listData = showProvidersList
    ? isFiltering
      ? []
      : providers || []
    : [];

  const renderCouponInput = () => (
    <View style={styles.couponSection}>
      <AppText namedStyle="text" style={styles.couponText}>
        {tScreen("coupon_paragraph")}
      </AppText>
      <AppText namedStyle="text" style={styles.couponText}>
        {tScreen("coupon_paragraph_two")}
      </AppText>
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
      {selectedCountry?.defaultCouponCode && (
        <AppText style={{ paddingTop: 3 }} namedStyle="smallText">
          {t("coupon_note")}
        </AppText>
      )}
      <View style={styles.couponButtons}>
        <AppButton
          label={tScreen("modal_coupon_button_label")}
          onPress={handleSubmitCoupon}
          size="sm"
          color="green"
          loading={isLoadingCoupon}
          disabled={!couponValue || isLoadingCoupon}
        />
        {activeCoupon && (
          <AppButton
            label={tScreen("remove_coupon_label")}
            onPress={handleRemoveCoupon}
            size="sm"
            color="red"
            style={styles.removeCouponButton}
          />
        )}
      </View>
    </View>
  );

  const renderProviderItem = ({ item: provider }) => (
    <ProviderOverview
      currencySymbol={currencySymbol}
      earliestAvailableSlot={provider.earliestAvailableSlot}
      freeLabel={selectedBillingType === "free" ? t("free") : t("coupon")}
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
      specializations={provider.specializations.map((x) => t(x))}
      surname={provider.surname}
      style={styles.providerItem}
      t={t}
    />
  );

  const listHeader = (
    <>
      {HeaderComponent}
      {billingTabs.length > 1 && (
        <Tabs
          tabsStyle={{ paddingHorizontal: 0 }}
          options={billingTabs}
          handleSelect={handleTabSelect}
          t={t}
          style={styles.tabs}
        />
      )}
      {isCouponTabSelected && renderCouponInput()}
      <View style={styles.headingRow}>
        <AppText namedStyle="text" style={styles.chooseProviderText}>
          {t("choose_provider")}
        </AppText>
        <NewButton
          label={t("button_label")}
          iconName="filter"
          iconColor="#ffffff"
          size="sm"
          onPress={handleFilterClick}
          style={styles.filterButton}
        />
      </View>
    </>
  );

  return (
    <Block>
      <View style={styles.providersContainer}>
        <FlashList
          data={listData}
          estimatedItemSize={120}
          keyExtractor={(item) => item.providerDetailId}
          renderItem={renderProviderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={
                providersQuery.isRefetching || providersQuery.isFetching
              }
              onRefresh={onRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            providersQuery.isFetching || providersQuery.isRefetching ? (
              <View style={styles.loadingContainer}>
                <Loading size="lg" />
              </View>
            ) : isCouponTabSelected && !activeCoupon ? (
              <View style={styles.emptyContainer}>
                <AppText namedStyle="text">
                  {t("enter_coupon_to_see_providers")}
                </AppText>
              </View>
            ) : (
              <View style={styles.loadingContainer}>
                <AppText namedStyle="h3">{t("no_match")}</AppText>
              </View>
            )
          }
          ListFooterComponent={
            providersQuery.isFetchingNextPage ? (
              <View style={styles.loadingContainer}>
                <Loading size="lg" />
              </View>
            ) : null
          }
          onEndReachedThreshold={0}
          onEndReached={() => {
            if (showProvidersList) {
              providersQuery.fetchNextPage();
            }
          }}
        />
      </View>
    </Block>
  );
};

const styles = StyleSheet.create({
  providersContainer: {
    paddingBottom: 32,
    height: "100%",
    width: "100%",
  },
  listContent: {
    paddingBottom: 200,
  },
  headingRow: {
    paddingHorizontal: 10,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  chooseProviderText: {
    flex: 1,
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
  tabs: {
    marginLeft: 0,
  },
  couponSection: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  couponText: {
    marginBottom: 8,
  },
  couponInput: {
    marginVertical: 12,
  },
  couponButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  removeCouponButton: {
    marginLeft: 8,
  },
  providerItem: {
    marginBottom: 12,
  },
  filterButton: {
    minWidth: 0,
  },
});

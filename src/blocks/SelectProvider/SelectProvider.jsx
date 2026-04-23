import React, { useContext, useMemo, useState, useEffect } from "react";
import { Platform, RefreshControl, StyleSheet, View } from "react-native";
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
import { useError, useGetTheme } from "#hooks";
import { appStyles } from "#styles";
import LinearGradient from "../../components/LinearGradient";

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
  filterButtonLabel,
}) => {
  const { t } = useTranslation("blocks", { keyPrefix: "select-provider" });
  const tScreen = useTranslation("screens", {
    keyPrefix: "select-provider-screen",
  }).t;
  const { currencySymbol, selectedCountry } = useContext(Context);
  const { colors, isHighContrast } = useGetTheme();
  const isLightTheme = colors.background === appStyles.colorWhite_ff;
  const dividerColor =
    colors.cardMediaSeparator || (isLightTheme ? "#eaecf0" : "#344054");

  // Match ArticleView / ProviderDetails "liquid glass" wrapper
  const glassGradient = useMemo(
    () => ({
      degrees: 145,
      locations: [0, 100],
      colors:
        isLightTheme && !isHighContrast
          ? Platform.OS === "android"
            ? ["#ffffff", "#f5f8ff"]
            : ["rgba(255, 255, 255, 0.99)", "rgba(245, 248, 255, 0.85)"]
          : colors.cardMediaGradient,
    }),
    [isLightTheme, isHighContrast, colors.cardMediaGradient]
  );

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
    <View
      style={[
        styles.headerWrapper,
        {
          borderBottomColor: dividerColor,
        },
      ]}
    >
      {HeaderComponent}
      <View style={styles.headingContent}>
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
        <AppText namedStyle="text" style={styles.chooseProviderText}>
          {t("choose-the-provider")}
        </AppText>
        {!!handleFilterClick && (
          <NewButton
            label={filterButtonLabel || t("button_label")}
            iconName="filter"
            iconColor="#ffffff"
            iconSize="sm"
            size="sm"
            onPress={handleFilterClick}
            style={styles.filterButton}
          />
        )}
      </View>
    </View>
  );

  return (
    <Block style={styles.block}>
      <View style={styles.screen}>
        <LinearGradient
          gradient={glassGradient}
          style={[
            styles.glassCard,
            isLightTheme && !isHighContrast
              ? styles.liquidGlassShadowLight
              : appStyles.cardMediaShadowDark,
            { borderColor: colors.cardMediaGradientBorder },
          ]}
        >
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
        </LinearGradient>
      </View>
    </Block>
  );
};

const styles = StyleSheet.create({
  block: {
    flex: 1,
  },
  screen: {
    flex: 1,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  glassCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    // Allow card shadows inside the list to render outside the container.
    // This wrapper already has its own border/shadow, so we don't need clipping here.
    overflow: "visible",
    padding: 16,
  },
  liquidGlassShadowLight: {
    shadowColor: "rgb(95, 108, 145)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  listContent: {
    paddingBottom: 200,
  },
  headerWrapper: {
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  headingContent: {
    flexDirection: "column-reverse",
    gap: 16,
  },
  chooseProviderText: {
    marginTop: 0,
    textAlign: "left",
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
    marginBottom: 12,
  },
  filterButton: {
    minWidth: 0,
    alignSelf: "flex-start",
    marginTop: 0,
  },
});

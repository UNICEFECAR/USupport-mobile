import React, { useContext } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Block, AppText, ProviderOverview, Loading } from "#components";

import { Context, providerSvc } from "#services";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";

/**
 * SelectProvider
 *
 * SelectProvider block
 *
 * @returns {JSX.Element}
 */
export const SelectProvider = ({
  providers,
  navigation,
  activeCoupon,
  providersQuery,
  HeaderComponent,
  isFiltering,
}) => {
  const { t } = useTranslation("select-provider");
  const { currencySymbol } = useContext(Context);

  const handleProviderClick = (providerId) => {
    navigation.push("ProviderOverview", {
      providerId: providerId,
    });
  };

  const renderProviders = (provider) => {
    return (
      <ProviderOverview
        currencySymbol={currencySymbol}
        earliestAvailableSlot={provider.earliestAvailableSlot}
        freeLabel={t("free")}
        image={provider.image}
        key={provider.providerDetailId}
        name={provider.name}
        onPress={() => handleProviderClick(provider.providerDetailId)}
        patronym={provider.patronym}
        price={activeCoupon ? null : provider.consultationPrice}
        provider={provider}
        specializations={provider.specializations.map((x) => t(x))}
        surname={provider.surname}
        style={{ marginBottom: 12 }}
        t={t}
      />
    );
  };

  return (
    <Block>
      <View style={styles.providersContainer}>
        <FlashList
          data={isFiltering ? [] : providers || []} // If the filters have been changed, make the data empty array in order to show a loading indicator
          estimatedItemSize={10}
          keyExtractor={(item) => item.providerDetailId}
          renderItem={({ item }) => renderProviders(item)}
          contentContainerStyle={{
            paddingBottom: 200,
          }}
          ListHeaderComponent={HeaderComponent}
          ListEmptyComponent={
            providersQuery.isFetching || providersQuery.isRefetching ? (
              <View style={styles.loadingContainer}>
                <Loading size="lg" />
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
            providersQuery.fetchNextPage();
          }}
        />
      </View>
    </Block>
  );
};

const styles = StyleSheet.create({
  providersContainer: {
    paddingVertical: 32,
    height: "100%",
    width: "100%",
  },
  loadingContainer: {
    alignItems: "center",
  },
});

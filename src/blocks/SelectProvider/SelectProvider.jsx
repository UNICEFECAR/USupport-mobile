import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Block, AppText, ProviderOverview } from "#components";

import { Context } from "#services";

/**
 * SelectProvider
 *
 * SelectProvider block
 *
 * @returns {JSX.Element}
 */
export const SelectProvider = ({ providers, navigation, activeCoupon }) => {
  const { t } = useTranslation("select-provider");
  const { currencySymbol } = useContext(Context);

  const handleProviderClick = (providerId) => {
    navigation.push("ProviderOverview", {
      providerId: providerId,
    });
  };

  const renderProviders = () => {
    if (providers?.length === 0) return <AppText>{t("no_match")}</AppText>;
    return providers?.map((provider, index) => {
      return (
        <ProviderOverview
          currencySymbol={currencySymbol}
          earliestAvailableSlot={provider.earliestAvailableSlot}
          freeLabel={t("free")}
          image={provider.image}
          key={index}
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
    });
  };

  return (
    <Block>
      <View style={styles.providersContainer}>{renderProviders()}</View>
    </Block>
  );
};

const styles = StyleSheet.create({
  providersContainer: {
    display: "flex",
    alignItems: "center",
    paddingVertical: 32,
  },
});

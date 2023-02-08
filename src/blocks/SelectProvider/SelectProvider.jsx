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
export const SelectProvider = ({ providers, navigation }) => {
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
          provider={provider}
          name={provider.name}
          patronym={provider.patronym}
          surname={provider.surname}
          specializations={provider.specializations.map((x) => t(x))}
          price={provider.consultationPrice}
          t={t}
          earliestAvailableSlot={provider.earliestAvailableSlot}
          onPress={() => handleProviderClick(provider.providerDetailId)}
          image={provider.image}
          freeLabel={t("free")}
          key={index}
          currencySymbol={currencySymbol}
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

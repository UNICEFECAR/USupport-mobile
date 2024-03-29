import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { Block, Loading, AppButton } from "#components";

import { ProviderDetails } from "../ProviderDetails/ProviderDetails";

import { useGetProviderDataById } from "#hooks";

import { Context } from "#services";

import Config from "react-native-config";
const { AMAZON_S3_BUCKET } = Config;

/**
 * ProviderOverview
 *
 * ProviderOverview block
 *
 * @return {jsx}
 */
export const ProviderOverview = ({ providerId }) => {
  const { t } = useTranslation("provider-overview");
  const { currencySymbol, activeCoupon } = useContext(Context);

  const { data: provider, isLoading } = useGetProviderDataById(
    providerId,
    activeCoupon?.campaignId
  );

  const image = AMAZON_S3_BUCKET + "/" + (provider?.image || "default");

  return (
    <Block style={styles.block}>
      {isLoading && !provider ? (
        <View style={styles.loadingContainer}>
          <Loading size="lg" />
        </View>
      ) : (
        <ProviderDetails
          provider={provider}
          t={t}
          image={image}
          currencySymbol={currencySymbol}
        />
      )}
    </Block>
  );
};

const styles = StyleSheet.create({
  block: {
    position: "relative",
    flexGrow: 1,
  },
  loadingContainer: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
});

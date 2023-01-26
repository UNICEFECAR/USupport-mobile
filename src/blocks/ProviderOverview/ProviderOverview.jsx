import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { Block, Loading, AppButton } from "#components";

import { ProviderDetails } from "../ProviderDetails/ProviderDetails";

import { useGetProviderDataById } from "#hooks";

import { AMAZON_S3_BUCKET } from "@env";

/**
 * ProviderOverview
 *
 * ProviderOverview block
 *
 * @return {jsx}
 */
export const ProviderOverview = ({ providerId }) => {
  const { t } = useTranslation("provider-overview");

  const { data: provider } = useGetProviderDataById(providerId);

  const image = AMAZON_S3_BUCKET + "/" + (provider?.image || "default");

  return (
    <Block style={styles.block}>
      {!provider ? (
        <View style={styles.loadingContainer}>
          <Loading size="lg" />
        </View>
      ) : (
        <ProviderDetails provider={provider} t={t} image={image} />
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

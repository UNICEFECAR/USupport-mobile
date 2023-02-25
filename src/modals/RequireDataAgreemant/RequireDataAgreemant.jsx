import React from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { TransparentModal, AppText } from "#components";

import { appStyles } from "#styles";

import { mascotHappyBlue } from "#assets";

import { clientSvc } from "#services";

import { showToast } from "../../utils/showToast";

import { WEBSITE_URL } from "@env";

/**
 * RequireDataAgreement
 *
 * The RequireDataAgreement modal
 *
 * @return {jsx}
 */
export const RequireDataAgreement = ({
  isOpen,
  onClose,
  onSuccess = () => {},
}) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("require-data-agreement");
  const navigation = useNavigation();

  const updateDataProcessing = async () => {
    await clientSvc.changeDataProcessingAgreement(true);
    return true;
  };
  const updateDataProcessingMutation = useMutation(updateDataProcessing, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-data"] });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      showToast({
        message: errorMessage,
        type: "error",
      });
    },
  });

  const handleGivePermission = () => {
    updateDataProcessingMutation.mutate();
  };

  return (
    <TransparentModal
      classes="require-data-agreement"
      heading={t("heading")}
      isOpen={isOpen}
      closeModal={onClose}
      ctaLabel={t("give_permission")}
      ctaHandleClick={handleGivePermission}
      isCtaLoading={updateDataProcessingMutation.isLoading}
      secondaryCtaLabel={t("cancel")}
      secondaryCtaHandleClick={onClose}
      secondaryCtaType="secondary"
    >
      <Image source={mascotHappyBlue} alt="Mascot" style={styles.image} />
      <AppText style={styles.text}>{t("text")}</AppText>
      <AppText>{t("text_2")}</AppText>
      <TouchableOpacity
        onPress={() => {
          Linking.openURL(`${WEBSITE_URL}/terms-of-use`);
        }}
      >
        <AppText style={styles.termsAndConditionsText}>
          {t("terms_and_conditions")}
        </AppText>
      </TouchableOpacity>
    </TransparentModal>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 160,
    height: 160,
    resizeMode: "contain",
    alignSelf: "center",
  },
  text: { marginVertical: 8 },
  termsAndConditionsText: {
    marginBottom: 10,
    color: appStyles.colorPrimary_20809e,
    fontFamily: appStyles.fontSemiBold,
  },
});

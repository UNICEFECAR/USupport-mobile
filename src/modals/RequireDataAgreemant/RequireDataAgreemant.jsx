import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image, StyleSheet, TouchableOpacity, Modal } from "react-native";

import { TransparentModal, AppText, Screen } from "#components";
import { PrivacyPolicy } from "../../blocks/PrivacyPolicy";
import { appStyles } from "#styles";
import { mascotHappyBlue } from "#assets";
import { clientSvc } from "#services";
import { showToast } from "../../utils/showToast";
import { useGetTheme } from "#hooks";

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
  onGivePermission,
  isLoading,
  onSuccess = () => {},
}) => {
  const { colors } = useGetTheme();
  const queryClient = useQueryClient();
  const { t } = useTranslation("require-data-agreement");

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
    if (onGivePermission) {
      onGivePermission();
    } else {
      updateDataProcessingMutation.mutate();
    }
  };

  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);

  return (
    <React.Fragment>
      <TransparentModal
        classes="require-data-agreement"
        heading={t("heading")}
        isOpen={isOpen}
        handleClose={onClose}
        ctaLabel={t("give_permission")}
        ctaHandleClick={handleGivePermission}
        isCtaLoading={updateDataProcessingMutation.isLoading || isLoading}
        secondaryCtaLabel={t("cancel")}
        secondaryCtaHandleClick={onClose}
        secondaryCtaType="secondary"
      >
        {isPrivacyPolicyOpen && (
          <Modal open={isPrivacyPolicyOpen} animationType="slide">
            <Screen>
              <PrivacyPolicy
                isModal
                handleModalClose={() => setIsPrivacyPolicyOpen(false)}
              />
            </Screen>
          </Modal>
        )}
        <Image source={mascotHappyBlue} alt="Mascot" style={styles.image} />
        <AppText style={styles.text}>{t("text")}</AppText>
        <AppText style={{ color: colors.textSecondary }}>{t("text_2")}</AppText>
        <TouchableOpacity
          onPress={() => {
            setIsPrivacyPolicyOpen(true);
          }}
        >
          <AppText style={styles.termsAndConditionsText}>
            {t("privacy_policy")}
          </AppText>
        </TouchableOpacity>
      </TransparentModal>
    </React.Fragment>
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

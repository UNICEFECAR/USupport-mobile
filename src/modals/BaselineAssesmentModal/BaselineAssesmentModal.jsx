import React, { useState, useEffect } from "react";
import { useTranslation, Trans } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { View, ScrollView, Pressable, Linking } from "react-native";

import { clientSvc } from "#services";
import { constructWebsiteUrl } from "#utils";
import { useCreateBaselineAssessment, useGetClientData } from "#hooks";
import { TransparentModal, AppText, Toggle } from "#components";

import { appStyles } from "#styles";

/**
 * BaselineAssesmentModal
 *
 * The BaselineAssesment modal
 *
 * @return {jsx}
 */
export const BaselineAssesmentModal = ({ navigation, setOpen, open }) => {
  const { t } = useTranslation("modals", {
    keyPrefix: "baseline-assesment-modal",
  });

  const queryClient = useQueryClient();
  const websiteUrl = constructWebsiteUrl("privacy-policy");
  const createBaselineAssessmentMutation = useCreateBaselineAssessment();

  const clientDataQuery = useGetClientData()[0];
  const clientData = clientDataQuery.data;

  const [isOpen, setIsOpen] = useState(false);
  const [dataProcessing, setDataProcessing] = useState(false);

  const onClose = () => {
    setIsOpen(false);
    setOpen(false);
  };

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  useEffect(() => {
    if (clientData) {
      setDataProcessing(clientData.dataProcessing);
      if (!clientData.hasCheckedBaselineAssessment) {
        setIsOpen(true);
      }
    }
  }, [clientData]);

  const handleCtaClick = () => {
    createBaselineAssessmentMutation.mutate(undefined, {
      onSuccess: (assessmentData) => {
        queryClient.invalidateQueries({
          queryKey: ["baseline-assessments"],
        });
        queryClient.invalidateQueries({
          queryKey: ["latest-baseline-assessment"],
        });
        onClose();
        navigation.navigate("BaselineAssesment", {
          baselineAssessmentId: assessmentData.baselineAssessmentId,
        });
      },
    });
    updateClientHasCheckedBaselineAssessmentMutation.mutate(true);
  };

  const updateClientHasCheckedBaselineAssessmentMutation = useMutation(
    clientSvc.updateClientHasCheckedBaselineAssessment,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["client-data"] });
      },
      onError: (err) => {
        console.log(err);
      },
    }
  );

  const updateDataProcessing = async (value) => {
    const res = await clientSvc.changeDataProcessingAgreement(value);
    return res.data.data_processing;
  };

  const updateDataProcessingMutation = useMutation(updateDataProcessing, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-data"] });
    },
    onError: () => {
      setDataProcessing((prev) => !prev); // Revert the optimistic update
    },
  });

  const handleToggleClick = () => {
    setDataProcessing(!dataProcessing);
    updateDataProcessingMutation.mutate(true);
  };

  const handleSecondaryCtaClick = () => {
    updateClientHasCheckedBaselineAssessmentMutation.mutate(true);
    onClose();
  };

  return (
    <TransparentModal
      heading={t("heading")}
      ctaLabel={t("cta_label")}
      ctaHandleClick={handleCtaClick}
      secondaryCtaLabel={t("secondary_cta_label")}
      secondaryCtaHandleClick={handleSecondaryCtaClick}
      secondaryCtaType="secondary"
      isCtaLoading={createBaselineAssessmentMutation.isLoading}
      isCtaDisabled={!dataProcessing || clientDataQuery.isLoading}
      isOpen={isOpen}
      handleClose={onClose}
      style={{
        maxHeight: appStyles.screenHeight * 0.85,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 12,
        }}
      >
        {/* Wrap into Pressable to prevent scrolling issues */}
        <Pressable onPress={() => {}}>
          <AppText>{t("paragraph_1")}</AppText>
          <AppText>{t("paragraph_2")}</AppText>
          <AppText>{t("paragraph_3")}</AppText>
          <AppText>{t("paragraph_3")}</AppText>
        </Pressable>
      </ScrollView>
      <View style={{ marginBottom: 18, paddingTop: 12 }}>
        <AppText>
          <Trans
            i18nKey="consent"
            values={{}}
            components={[
              <AppText
                onPress={() => Linking.openURL(websiteUrl)}
                style={{ textDecorationLine: "underline" }}
              />,
            ]}
          >
            {t("consent")}
          </Trans>
        </AppText>
        <Toggle value={dataProcessing} onValueChange={handleToggleClick} />
      </View>
    </TransparentModal>
  );
};

import React, { useState, useEffect } from "react";
import { useTranslation, Trans } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { View, ScrollView, Pressable, Linking } from "react-native";

import { clientSvc } from "#services";
import { constructWebsiteUrl } from "#utils";
import { useCreateScreeningSession, useGetClientData } from "#hooks";
import { TransparentModal, AppText, Toggle } from "#components";

import { appStyles } from "#styles";

/**
 * BaselineAssesmentModal
 *
 * The BaselineAssesment modal
 *
 * @return {jsx}
 */
export const BaselineAssesmentModal = ({ navigation }) => {
  const { t } = useTranslation("baseline-assesment-modal");

  const queryClient = useQueryClient();
  const websiteUrl = constructWebsiteUrl("privacy-policy");
  const createScreeningSessionMutation = useCreateScreeningSession();

  const clientDataQuery = useGetClientData()[0];
  const clientData = clientDataQuery.data;

  const [isOpen, setIsOpen] = useState(false);
  const [dataProcessing, setDataProcessing] = useState(false);
  const onClose = () => setIsOpen(false);

  useEffect(() => {
    if (clientData) {
      console.log(clientData.hasCheckedBaselineAssessment);
      setDataProcessing(clientData.dataProcessing);
      setIsOpen(clientData.hasCheckedBaselineAssessment);
    }
  }, [clientData]);

  const handleCtaClick = () => {
    createScreeningSessionMutation.mutate(undefined, {
      onSuccess: (sessionData) => {
        onClose();
        navigation.navigate("BaselineAssesment", {
          sessionId: sessionData.screeningSessionId,
        });
      },
    });
    updateClientHasCheckedBaselineAssessmentMutation.mutate(true);
  };

  const updateClientHasCheckedBaselineAssessmentMutation = useMutation(
    clientSvc.updateClientHasCheckedBaselineAssessment,
    {
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
      isCtaLoading={createScreeningSessionMutation.isLoading}
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
          <AppText>
            {t("paragraph_1")}
            <AppText>{t("paragraph_2")}</AppText>
            <AppText>{t("paragraph_3")}</AppText>
            <AppText>{t("paragraph_3")}</AppText>
          </AppText>
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

import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, ScrollView } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import { Screen, Block, Heading, AppButton } from "#components";
import { ProviderOverview as ProviderOverviewBlock } from "#blocks";
import { SelectConsultation, ConfirmConsultation } from "#backdrops";
import {
  useGetClientData,
  useBlockSlot,
  useScheduleConsultation,
} from "#hooks";

/**
 * ProviderOverview
 *
 * ProviderOverview screen
 *
 * @return {jsx}
 */
export const ProviderOverview = ({ navigation, route }) => {
  const { t } = useTranslation("provider-overview-scren");
  const queryClient = useQueryClient();

  const providerId = route.params.providerId;

  if (!providerId) navigation.navigate("SelectProvider");

  const clientData = useGetClientData()[1];

  const [blockSlotError, setBlockSlotError] = useState();
  const [consultationId, setConsultationId] = useState();

  const consultationPrice = useRef();
  const selectedSlot = useRef();

  // Modal state variables
  const [isScheduleBackdropOpen, setIsScheduleBackdropOpen] = useState(false);
  const [isConfirmBackdropOpen, setIsConfirmBackdropOpen] = useState(false);
  const [isRequireDataAgreementOpen, setIsRequireDataAgreementOpen] =
    useState(false);

  // Open modals
  const openScheduleBackdrop = () => {
    if (!clientData.dataProcessing) {
      openRequireDataAgreement();
    } else {
      setIsScheduleBackdropOpen(true);
    }
  };
  const openConfirmConsultationBackdrop = () => setIsConfirmBackdropOpen(true);
  const openRequireDataAgreement = () => setIsRequireDataAgreementOpen(true);

  // Close modals
  const closeConfirmConsultationBackdrop = () =>
    setIsConfirmBackdropOpen(false);
  const closeScheduleBackdrop = () => setIsScheduleBackdropOpen(false);
  const closeRequireDataAgreement = () => setIsRequireDataAgreementOpen(false);

  const onBlockSlotSuccess = (consultationId) => {
    if (consultationPrice.current && consultationPrice.current > 0) {
      navigation.navigate("Checkout", {
        consultationId,
        selectedSlot: selectedSlot.current,
      });
    } else {
      scheduleConsultationMutation.mutate(consultationId);
    }
  };
  const onBlockSlotError = (error) => {
    setBlockSlotError(error);
  };
  const blockSlotMutation = useBlockSlot(onBlockSlotSuccess, onBlockSlotError);

  const onScheduleConsultationSuccess = (data) => {
    setConsultationId(consultationId);
    closeScheduleBackdrop();
    openConfirmConsultationBackdrop();
    setBlockSlotError(null);
    queryClient.invalidateQueries({ queryKey: ["all-consultations"] });
  };
  const onScheduleConsultationError = (error) => {
    setBlockSlotError(error);
  };
  const scheduleConsultationMutation = useScheduleConsultation(
    onScheduleConsultationSuccess,
    onScheduleConsultationError
  );

  const handleBlockSlot = (slot, price) => {
    selectedSlot.current = slot;
    consultationPrice.current = price;
    blockSlotMutation.mutate({
      slot,
      providerId,
    });
  };

  const isLoading =
    blockSlotMutation.isLoading || scheduleConsultationMutation.isLoading;

  return (
    <Screen hasEmergencyButton={false} style={styles.flexGrow1}>
      <ScrollView contentContainerStyle={styles.flexGrow1}>
        <Block>
          <Heading
            heading={t("heading")}
            subheading={t("subheading")}
            handleGoBack={() => navigation.goBack()}
          />
        </Block>
        <ProviderOverviewBlock
          navigation={navigation}
          openScheduleBackdrop={openScheduleBackdrop}
          providerId={providerId}
        />
      </ScrollView>
      <AppButton
        style={styles.button}
        label={t("button_label")}
        size="lg"
        onPress={openScheduleBackdrop}
      />
      <SelectConsultation
        isOpen={isScheduleBackdropOpen}
        onClose={closeScheduleBackdrop}
        handleBlockSlot={handleBlockSlot}
        providerId={providerId}
        isCtaLoading={isLoading}
        errorMessage={blockSlotError}
      />
      {selectedSlot.current && (
        <ConfirmConsultation
          isOpen={isConfirmBackdropOpen}
          onClose={closeConfirmConsultationBackdrop}
          consultation={{
            startDate: new Date(selectedSlot.current),
            endDate: new Date(
              new Date(selectedSlot.current).setHours(
                new Date(selectedSlot.current).getHours() + 1
              )
            ),
          }}
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  flexGrow1: { flexGrow: 1 },
  button: {
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
    maxWidth: "96%",
  },
});

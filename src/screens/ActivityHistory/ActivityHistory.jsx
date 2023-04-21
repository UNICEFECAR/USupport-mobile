import React, { useState, useRef } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";

import { Screen } from "#components";
import { ActivityHistory as ActivityHistoryBlock } from "#blocks";
import { SelectConsultation, ConfirmConsultation } from "#backdrops";
import { RequireDataAgreement } from "#modals";

import {
  useGetClientData,
  useBlockSlot,
  useScheduleConsultation,
} from "#hooks";

export const ActivityHistory = ({ navigation, route }) => {
  const { t } = useTranslation("activity-history");

  const consultation = route.params?.consultation;
  const providerId = consultation?.providerId;

  if (!consultation || !providerId) return navigation.navigate("Consultations");

  const clientData = useGetClientData()[1];

  const [blockSlotError, setBlockSlotError] = useState();
  // const [consultationId, setConsultationId] = useState();

  const consultationPrice = useRef();
  const selectedSlot = useRef();

  // Modal state variables
  const [isSelectConsultationOpen, setIsSelectConsultationOpen] =
    useState(false);
  const [isConfirmBackdropOpen, setIsConfirmBackdropOpen] = useState(false);
  const [isRequireDataAgreementOpen, setIsRequireDataAgreementOpen] =
    useState(false);

  // Open modals
  const openSelectConsultation = () => {
    if (!clientData.dataProcessing) {
      openRequireDataAgreement();
      // setIsSelectConsultationOpen(true);
    } else {
      setIsSelectConsultationOpen(true);
    }
  };
  const openConfirmConsultationBackdrop = () => setIsConfirmBackdropOpen(true);
  const openRequireDataAgreement = () => setIsRequireDataAgreementOpen(true);

  // Close modals
  const closeConfirmConsultationBackdrop = () =>
    setIsConfirmBackdropOpen(false);
  const closeSelectConsultation = () => setIsSelectConsultationOpen(false);
  const closeRequireDataAgreement = () => setIsRequireDataAgreementOpen(false);

  const onBlockSlotSuccess = (consultationId) => {
    if (consultationPrice.current && consultationPrice.current > 0) {
      navigation.navigate("Checkout", {
        consultationId: consultationId,
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
    // setConsultationId(consultationId);
    closeSelectConsultation();
    openConfirmConsultationBackdrop();
    setBlockSlotError(null);
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
      providerId: providerId,
    });
  };

  const isSelectConsultationLoading =
    blockSlotMutation.isLoading || scheduleConsultationMutation.isLoading;

  return (
    <Screen hasEmergencyButton={false}>
      <ActivityHistoryBlock
        navigation={navigation}
        openSelectConsultation={openSelectConsultation}
        providerId={providerId}
        consultation={consultation}
      />
      <SelectConsultation
        isOpen={isSelectConsultationOpen}
        onClose={closeSelectConsultation}
        handleBlockSlot={handleBlockSlot}
        providerId={providerId}
        isCtaLoading={isSelectConsultationLoading}
        errorMessage={blockSlotError}
      />
      {selectedSlot && (
        <ConfirmConsultation
          isOpen={isConfirmBackdropOpen}
          onClose={closeConfirmConsultationBackdrop}
          consultation={{
            startDate: new Date(selectedSlot),
            endDate: new Date(
              new Date(selectedSlot).setHours(
                new Date(selectedSlot).getHours() + 1
              )
            ),
          }}
        />
      )}
      <RequireDataAgreement
        isOpen={isRequireDataAgreementOpen}
        onClose={closeRequireDataAgreement}
        onSuccess={() => setIsSelectConsultationOpen(true)}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({});

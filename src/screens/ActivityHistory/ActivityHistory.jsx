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

  const [isBlockSlotSubmitting, setIsBlockSlotSubmitting] = useState(false);
  const [blockSlotError, setBlockSlotError] = useState();
  // const [consultationId, setConsultationId] = useState();
  const [selectedSlot, setSelectedSlot] = useState();
  const consultationPrice = useRef();

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
    // setIsBlockSlotSubmitting(false);
    // setConsultationId(consultationId);

    if (consultationPrice.current && consultationPrice.current > 0) {
      navigate(`/checkout`, { state: { consultationId: consultationId } });
    } else {
      scheduleConsultationMutation.mutate({ consultationId });
    }

    // closeSelectConsultation();
    // openConfirmConsultationBackdrop();
  };
  const onBlockSlotError = (error) => {
    setBlockSlotError(error);
    setIsBlockSlotSubmitting(false);
  };
  const blockSlotMutation = useBlockSlot(onBlockSlotSuccess, onBlockSlotError);

  const onScheduleConsultationSuccess = (data) => {
    setIsBlockSlotSubmitting(false);
    // setConsultationId(consultationId);
    closeSelectConsultation();
    openConfirmConsultationBackdrop();
    setBlockSlotError(null);
  };
  const onScheduleConsultationError = (error) => {
    setBlockSlotError(error);
    setIsBlockSlotSubmitting(false);
  };
  const scheduleConsultationMutation = useScheduleConsultation(
    onScheduleConsultationSuccess,
    onScheduleConsultationError
  );

  const handleBlockSlot = (slot, price) => {
    setIsBlockSlotSubmitting(true);
    setSelectedSlot(slot);
    consultationPrice.current = price;
    blockSlotMutation.mutate({
      slot,
      providerId: providerId,
    });
  };

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
        isCtaDisabled={isBlockSlotSubmitting}
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

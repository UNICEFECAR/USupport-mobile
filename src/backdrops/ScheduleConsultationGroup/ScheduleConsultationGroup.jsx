import React, { useState, useRef } from "react";

import { SelectConsultation, ConfirmConsultation } from "#backdrops";
import { RequireDataAgreement } from "#modals";
import { useBlockSlot, useScheduleConsultation } from "#hooks";

/**
 * ScheduleConsultationGroup
 *
 * The ScheduleConsultationGroup backdrop
 *
 * @return {jsx}
 */
export const ScheduleConsultationGroup = ({
  providerId,
  isSelectConsultationOpen,
  setIsSelectConsultationOpen,
  isConfirmBackdropOpen,
  setIsConfirmBackdropOpen,
  isRequireDataAgreementOpen,
  setIsRequireDataAgreementOpen,
  isInDashboard = false,
  navigation,
}) => {
  const [blockSlotError, setBlockSlotError] = useState();

  const consultationPrice = useRef();
  const selectedSlot = useRef();

  const onBlockSlotSuccess = (consultationId) => {
    if (consultationPrice.current && consultationPrice.current > 0) {
      navigation.navigate("Checkout", {
        consultationId: consultationId,
        selectedSlot: selectedSlot.current,
      });
    } else {
      scheduleConsultationMutation.mutate(consultationId);
    }
    setIsSelectConsultationOpen(false);
  };
  const onBlockSlotError = (error) => {
    setBlockSlotError(error);
  };
  const blockSlotMutation = useBlockSlot(onBlockSlotSuccess, onBlockSlotError);

  const handleBlockSlot = (slot, price) => {
    selectedSlot.current = slot;
    consultationPrice.current = price;
    blockSlotMutation.mutate({
      slot,
      providerId: providerId,
    });
  };

  const closeSelectConsultation = () => setIsSelectConsultationOpen(false);

  const openConfirmConsultationBackdrop = () => setIsConfirmBackdropOpen(true);

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

  const closeConfirmConsultationBackdrop = () =>
    setIsConfirmBackdropOpen(false);
  const closeRequireDataAgreement = () => setIsRequireDataAgreementOpen(false);

  const isSelectConsultationLoading =
    blockSlotMutation.isLoading || scheduleConsultationMutation.isLoading;

  return (
    <>
      <SelectConsultation
        isOpen={isSelectConsultationOpen}
        onClose={closeSelectConsultation}
        handleBlockSlot={handleBlockSlot}
        providerId={providerId}
        isCtaLoading={isSelectConsultationLoading}
        errorMessage={blockSlotError}
        isInDashboard={isInDashboard}
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
    </>
  );
};

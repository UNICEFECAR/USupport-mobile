import React, { useState, useRef, useMemo } from "react";

import { SelectConsultation } from "../SelectConsultation";
import { ConfirmConsultation } from "../ConfirmConsultation";
import { RequireDataAgreement } from "#modals";
import { useBlockSlot, useScheduleConsultation } from "#hooks";
import { getConsultationEndDate, parseUTCDate } from "#utils";

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
  isInMyQA = false,
  navigation,
}) => {
  const [blockSlotError, setBlockSlotError] = useState();

  const consultationPrice = useRef();
  const selectedSlot = useRef();
  // The booked slot's own length, for the confirmation's end time.
  const selectedSlotDuration = useRef();

  const onBlockSlotSuccess = (consultationId) => {
    if (consultationPrice.current && consultationPrice.current > 0) {
      navigation.navigate("Checkout", {
        consultationId: consultationId,
        selectedSlot: selectedSlot.current,
        selectedSlotDuration: selectedSlotDuration.current,
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

  const handleBlockSlot = (slot, price, durationMinutes) => {
    selectedSlot.current = slot;
    selectedSlotDuration.current = durationMinutes;
    consultationPrice.current = price;
    blockSlotMutation.mutate({
      slot,
      providerId: providerId,
    });
  };

  const closeSelectConsultation = () => setIsSelectConsultationOpen(false);

  const openConfirmConsultationBackdrop = () => setIsConfirmBackdropOpen(true);

  const onScheduleConsultationSuccess = (data) => {
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

  const time = useMemo(() => {
    return selectedSlot.current?.time
      ? parseUTCDate(selectedSlot.current.time)
      : new Date(selectedSlot.current);
  }, [selectedSlot.current]);

  return (
    <>
      <SelectConsultation
        isOpen={isSelectConsultationOpen}
        onClose={closeSelectConsultation}
        handleBlockSlot={handleBlockSlot}
        providerId={providerId}
        isCtaLoading={isSelectConsultationLoading}
        errorMessage={blockSlotError}
        isInDashboard={isInMyQA}
      />
      {selectedSlot.current ? (
        <ConfirmConsultation
          isOpen={isConfirmBackdropOpen}
          onClose={closeConfirmConsultationBackdrop}
          ctaStyle={isInMyQA ? { marginBottom: 85 } : {}}
          consultation={{
            startDate: time,
            endDate: getConsultationEndDate(
              time,
              selectedSlotDuration.current
            ),
          }}
        />
      ) : null}
      <RequireDataAgreement
        isOpen={isRequireDataAgreementOpen}
        onClose={closeRequireDataAgreement}
        onSuccess={() => setIsSelectConsultationOpen(true)}
      />
    </>
  );
};

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import {
  Screen,
  Block,
  AppButton,
  Heading,
  Backdrop,
  AppText,
} from "#components";
import { Consultations as ConsultationsBlock } from "#blocks";

import {
  useBlockSlot,
  useRescheduleConsultation,
  useGetClientData,
} from "#hooks";

/**
 * Consultations
 *
 * Consultations page
 *
 * @returns {JSX.Element}
 */
export const Consultations = ({ navigation }) => {
  const { t } = useTranslation("consultations-screen");

  const queryClient = useQueryClient();
  const navigate = navigation;

  const clientData = useGetClientData()[1];

  const [selectedConsultation, setSelectedConsultation] = useState();
  const [selectedConsultationProviderId, setSelectedConsultationProviderId] =
    useState();
  const [selectedConsultationId, setSelectedConsultationId] = useState();

  const [isEditConsultationOpen, setIsEditConsultationOpen] = useState(false);
  const openEditConsultation = (consultation) => {
    setSelectedConsultationId(consultation.consultationId);
    setSelectedConsultationProviderId(consultation.providerId);
    setSelectedConsultation(consultation);
    setIsEditConsultationOpen(true);
  };
  const closeEditConsultation = () => setIsEditConsultationOpen(false);

  const [isCancelConsultationOpen, setIsCancelConsultationOpen] =
    useState(false);
  const openCancelConsultation = () => setIsCancelConsultationOpen(true);
  const closeCancelConsultation = () => setIsCancelConsultationOpen(false);

  const [isJoinConsultationOpen, setIsJoinConsultationOpen] = useState(false);
  const openJoinConsultation = (consultation) => {
    setIsJoinConsultationOpen(true);
    setSelectedConsultation(consultation);
  };
  const closeJoinConsultation = () => setIsJoinConsultationOpen(false);

  const [isRequireDataAgreementOpen, setIsRequireDataAgreementOpen] =
    useState(false);
  const openRequireDataAgreement = () => setIsRequireDataAgreementOpen(true);
  const closeRequireDataAgreement = () => setIsRequireDataAgreementOpen(false);

  const [isBlockSlotSubmitting, setIsBlockSlotSubmitting] = useState(false);
  const [blockSlotError, setBlockSlotError] = useState();
  const [consultationId, setConsultationId] = useState();
  const [selectedSlot, setSelectedSlot] = useState();

  // Modal state variables
  const [
    isSelectConsultationBackdropOpen,
    setIsSelectConsultationBackdropOpen,
  ] = useState(false);
  const [isConfirmBackdropOpen, setIsConfirmBackdropOpen] = useState(false);

  // Open modals
  const openSelectConsultation = () => {
    setIsSelectConsultationBackdropOpen(true);
  };

  const openConfirmConsultationBackdrop = () => setIsConfirmBackdropOpen(true);

  // Close modals
  const closeConfirmConsultationBackdrop = () =>
    setIsConfirmBackdropOpen(false);
  const closeSelectConsultationBackdrop = () =>
    setIsSelectConsultationBackdropOpen(false);

  // Schedule consultation logic
  const onRescheduleConsultationSuccess = (data) => {
    setIsBlockSlotSubmitting(false);
    setConsultationId(consultationId);
    closeSelectConsultationBackdrop();
    openConfirmConsultationBackdrop();
    setBlockSlotError(null);

    queryClient.invalidateQueries(["all-consultations"]);
  };
  const onRescheduleConsultationError = (error) => {
    setBlockSlotError(error);
    setIsBlockSlotSubmitting(false);
  };
  const rescheduleConsultationMutation = useRescheduleConsultation(
    onRescheduleConsultationSuccess,
    onRescheduleConsultationError
  );

  // Block slot logic
  const onBlockSlotSuccess = (newConsultationId) => {
    // setIsBlockSlotSubmitting(false);
    // setConsultationId(consultationId);
    rescheduleConsultationMutation.mutate({
      consultationId: selectedConsultationId,
      newConsultationId,
    });

    // closeSelectConsultationBackdrop();
    // openConfirmConsultationBackdrop();
  };
  const onBlockSlotError = (error) => {
    setBlockSlotError(error);
    setIsBlockSlotSubmitting(false);
  };
  const blockSlotMutation = useBlockSlot(onBlockSlotSuccess, onBlockSlotError);

  const handleBlockSlot = (slot) => {
    setIsBlockSlotSubmitting(true);
    setSelectedSlot(slot);
    blockSlotMutation.mutate({
      slot,
      providerId: selectedConsultationProviderId,
    });
  };

  const handleScheduleConsultationClick = () => {
    if (!clientData.dataProcessing) {
      openRequireDataAgreement();
    } else {
      navigation.push("SelectProvider");
    }
  };

  const handleDataAgreementSuccess = () => {
    navigate("/select-provider");
  };
  const [isScheduleBackdropOpen, setIsScheduleBackdropOpen] = useState(false);

  return (
    <Screen>
      <ScrollView>
        <Block>
          <AppButton
            label={t("button_label")}
            size="lg"
            style={styles.button}
            onPress={handleScheduleConsultationClick}
          />
          <Heading
            heading={t("heading")}
            style={{ marginVertical: 20 }}
            handleGoBack={() => navigation.goBack()}
          />
        </Block>
        <ConsultationsBlock
          openJoinConsultation={openJoinConsultation}
          openEditConsultation={openEditConsultation}
          navigation={navigation}
        />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: "center",
  },
});

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, ScrollView } from "react-native";

import { Screen, Block, Heading, AppButton } from "#components";
import { ProviderOverview as ProviderOverviewBlock } from "#blocks";
import { SelectConsultation } from "#backdrops";
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

  const providerId = route.params.providerId;

  if (!providerId) navigation.navigate("SelectProvider");

  const clientData = useGetClientData()[1];

  const [isBlockSlotSubmitting, setIsBlockSlotSubmitting] = useState(false);
  const [blockSlotError, setBlockSlotError] = useState();
  const [consultationId, setConsultationId] = useState();
  const [selectedSlot, setSelectedSlot] = useState();

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
    // setIsBlockSlotSubmitting(false);
    // setConsultationId(consultationId);

    scheduleConsultationMutation.mutate(consultationId);

    // closeScheduleBackdrop();
    // openConfirmConsultationBackdrop();
  };
  const onBlockSlotError = (error) => {
    setBlockSlotError(error);
    setIsBlockSlotSubmitting(false);
  };
  const blockSlotMutation = useBlockSlot(onBlockSlotSuccess, onBlockSlotError);

  const onScheduleConsultationSuccess = (data) => {
    setIsBlockSlotSubmitting(false);
    setConsultationId(consultationId);
    closeScheduleBackdrop();
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

  const handleBlockSlot = (slot) => {
    setIsBlockSlotSubmitting(true);
    setSelectedSlot(slot);
    blockSlotMutation.mutate({
      slot,
      providerId,
    });
  };

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
        isCtaDisabled={isBlockSlotSubmitting}
        errorMessage={blockSlotError}
      />
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

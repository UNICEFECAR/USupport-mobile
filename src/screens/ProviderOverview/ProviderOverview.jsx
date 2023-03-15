import React, {
  useState,
  useRef,
  useContext,
  useCallback,
  useMemo,
} from "react";
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
import { Context } from "#services";
import { parseUTCDate } from "#utils";

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
  const { activeCoupon, setActiveCoupon } = useContext(Context);

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
    if (
      consultationPrice.current &&
      consultationPrice.current > 0 &&
      !selectedSlot.current?.campaign_id
    ) {
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
    if (activeCoupon) {
      setActiveCoupon(null);
    }
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

  const isWithCampaign = useMemo(() => {
    return !!selectedSlot.current?.time;
  }, [selectedSlot.current]);

  const time = useMemo(() => {
    return isWithCampaign
      ? parseUTCDate(selectedSlot.current.time)
      : new Date(selectedSlot.current);
  }, [isWithCampaign, selectedSlot.current]);

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
            startDate: time,
            endDate: new Date(
              new Date(time).setHours(new Date(time).getHours() + 1)
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

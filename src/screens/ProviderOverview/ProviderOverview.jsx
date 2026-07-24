import React, { useState, useRef, useContext, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, ScrollView } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import { Screen, Heading, Block } from "#components";
import { ProviderOverview as ProviderOverviewBlock } from "#blocks";
import { SelectConsultation, ConfirmConsultation } from "#backdrops";
import { RequireDataAgreement } from "#modals";
import {
  useGetClientData,
  useBlockSlot,
  useScheduleConsultation,
  useAddCountryEvent,
} from "#hooks";
import { Context } from "#services";

/**
 * ProviderOverview
 *
 * ProviderOverview screen
 *
 * @return {jsx}
 */
export const ProviderOverview = ({ navigation, route }) => {
  const { t } = useTranslation("screens", {
    keyPrefix: "provider-overview-screen",
  });
  const queryClient = useQueryClient();
  const { activeCoupon, setActiveCoupon } = useContext(Context);
  const addCountryEventMutation = useAddCountryEvent();

  const providerId = route.params.providerId;
  const billingType = route.params.billingType || null;
  const didAutoOpenSchedule = useRef(false);

  const effectiveActiveCoupon = billingType === "coupon" ? activeCoupon : null;

  useEffect(() => {
    if (billingType !== "coupon" && activeCoupon) {
      setActiveCoupon(null);
    }
  }, [billingType, activeCoupon, setActiveCoupon]);

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
      addCountryEventMutation.mutate({
        eventType: "mobile_schedule_button_click",
      });
      setIsScheduleBackdropOpen(true);
    }
  };
  const openConfirmConsultationBackdrop = () => setIsConfirmBackdropOpen(true);
  const openRequireDataAgreement = () => setIsRequireDataAgreementOpen(true);

  useEffect(() => {
    if (didAutoOpenSchedule.current) return;
    if (route?.params?.openSchedule) {
      didAutoOpenSchedule.current = true;
      openScheduleBackdrop();
    }
  }, [route?.params?.openSchedule]);

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
    if (effectiveActiveCoupon) {
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
      ? new Date(selectedSlot.current.time)
      : new Date(selectedSlot.current);
  }, [isWithCampaign, selectedSlot.current]);

  return (
    <Screen hasEmergencyButton={false} style={styles.flexGrow1}>
      <Block>
        <Heading
          heading={t("heading")}
          subheading={t("subheading")}
          handleGoBack={() => navigation.goBack()}
          wrapperStyle={{ paddingTop: 0 }}
        />
      </Block>
      <ScrollView
        contentContainerStyle={[styles.flexGrow1]}
        showsVerticalScrollIndicator={false}
      >
        <ProviderOverviewBlock
          navigation={navigation}
          openScheduleBackdrop={openScheduleBackdrop}
          providerId={providerId}
        />
      </ScrollView>
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
      <RequireDataAgreement
        isOpen={isRequireDataAgreementOpen}
        onClose={closeRequireDataAgreement}
        onSuccess={() => setIsScheduleBackdropOpen(true)}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  flexGrow1: { flexGrow: 1 },
});

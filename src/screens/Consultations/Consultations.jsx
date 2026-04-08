import React, { useContext, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
  Platform,
  KeyboardAvoidingView,
  View,
  Keyboard,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import { Screen, NewButton } from "#components";
import { Consultations as ConsultationsBlock, GiveSuggestion } from "#blocks";

import {
  EditConsultation,
  CancelConsultation,
  SelectConsultation,
  ConfirmConsultation,
  JoinConsultation,
} from "#backdrops";

import { RequireDataAgreement } from "#modals";

import { Context } from "#services";

import {
  useBlockSlot,
  useRescheduleConsultation,
  useGetClientData,
  useKeyboard,
  useAddCountryEvent,
} from "#hooks";

import { parseUTCDate } from "#utils";

/**
 * Consultations
 *
 * Consultations page
 *
 * @returns {JSX.Element}
 */
export const Consultations = ({ navigation }) => {
  const { t } = useTranslation("screens", {
    keyPrefix: "consultations-screen",
  });

  const { isTmpUser, handleRegistrationModalOpen, currencySymbol } =
    useContext(Context);

  const { bottom: bottomInset } = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const addCountryEventMutation = useAddCountryEvent();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef(null);
  const [giveSuggestionLayout, setGiveSuggestionLayout] = useState(null);

  const clientDataQuery = useGetClientData()[0];
  const clientData = clientDataQuery.data;

  const [isKeyboardShown, setIsKeyboardShown] = useState(false);
  useKeyboard(
    true,
    () => setIsKeyboardShown(true),
    () => setIsKeyboardShown(false)
  );

  // Selected consultation data
  const [selectedConsultation, setSelectedConsultation] = useState();
  const [selectedConsultationProviderId, setSelectedConsultationProviderId] =
    useState();
  const [selectedConsultationId, setSelectedConsultationId] = useState();

  // Edit consultation backdrop
  const [isEditConsultationOpen, setIsEditConsultationOpen] = useState(false);
  const openEditConsultation = (consultation) => {
    setSelectedConsultationId(consultation.consultationId);
    setSelectedConsultationProviderId(consultation.providerId);
    setSelectedConsultation(consultation);
    setIsEditConsultationOpen(true);
  };
  const closeEditConsultation = () => setIsEditConsultationOpen(false);

  // Cancel consultation backdrop
  const [isCancelConsultationOpen, setIsCancelConsultationOpen] =
    useState(false);
  const openCancelConsultation = () => setIsCancelConsultationOpen(true);
  const closeCancelConsultation = () => setIsCancelConsultationOpen(false);

  // Join consultation backdrop
  const [isJoinConsultationOpen, setIsJoinConsultationOpen] = useState(false);
  const openJoinConsultation = (consultation) => {
    setIsJoinConsultationOpen(true);
    setSelectedConsultation(consultation);
  };
  const closeJoinConsultation = () => setIsJoinConsultationOpen(false);

  // Require data agreement modal
  const [isRequireDataAgreementOpen, setIsRequireDataAgreementOpen] =
    useState(false);
  const openRequireDataAgreement = () => setIsRequireDataAgreementOpen(true);
  const closeRequireDataAgreement = () => setIsRequireDataAgreementOpen(false);

  // Select consultation backdrop
  const [
    isSelectConsultationBackdropOpen,
    setIsSelectConsultationBackdropOpen,
  ] = useState(false);
  const openSelectConsultation = () => {
    setIsSelectConsultationBackdropOpen(true);
  };
  const closeSelectConsultationBackdrop = () => {
    setIsSelectConsultationBackdropOpen(false);
  };

  // Consultation confirmation backdrop
  const [isConfirmBackdropOpen, setIsConfirmBackdropOpen] = useState(false);
  const openConfirmConsultationBackdrop = () => setIsConfirmBackdropOpen(true);
  const closeConfirmConsultationBackdrop = () =>
    setIsConfirmBackdropOpen(false);

  const [blockSlotError, setBlockSlotError] = useState();
  const [consultationId, setConsultationId] = useState();

  const consultationPrice = useRef();
  const selectedSlot = useRef();

  // Refresh Logic
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["all-consultations"] }),
      queryClient.invalidateQueries({ queryKey: ["client-data"] }),
    ]);
    setRefreshing(false);
  };

  // Schedule consultation logic
  const onRescheduleConsultationSuccess = (data) => {
    setConsultationId(consultationId);
    closeSelectConsultationBackdrop();
    openConfirmConsultationBackdrop();
    setBlockSlotError(null);

    queryClient.invalidateQueries({ queryKey: ["all-consultations"] });
  };
  const onRescheduleConsultationError = (error) => {
    setBlockSlotError(error);
  };
  const rescheduleConsultationMutation = useRescheduleConsultation(
    onRescheduleConsultationSuccess,
    onRescheduleConsultationError
  );

  // Block slot logic
  const onBlockSlotSuccess = (newConsultationId) => {
    rescheduleConsultationMutation.mutate({
      consultationId: selectedConsultationId,
      newConsultationId,
    });
  };
  const onBlockSlotError = (error) => {
    setBlockSlotError(error);
  };
  const blockSlotMutation = useBlockSlot(onBlockSlotSuccess, onBlockSlotError);

  const handleBlockSlot = (slot, price) => {
    consultationPrice.current = price;
    selectedSlot.current = slot;
    blockSlotMutation.mutate({
      slot,
      providerId: selectedConsultationProviderId,
    });
  };

  const handleScheduleConsultationClick = () => {
    if (isTmpUser) {
      handleRegistrationModalOpen();
    } else if (!clientData?.dataProcessing) {
      openRequireDataAgreement();
    } else {
      addCountryEventMutation.mutate({
        eventType: "mobile_schedule_button_click",
      });
      navigation.push("SelectProvider");
    }
  };

  const handleDataAgreementSucess = () => {
    addCountryEventMutation.mutate({
      eventType: "mobile_schedule_button_click",
    });
    navigation.navigate("SelectProvider");
  };

  const isSelectConsultationLoading =
    rescheduleConsultationMutation.isLoading || blockSlotMutation.isLoading;

  const isWithCampaign = useMemo(() => {
    return !!selectedSlot.current?.time;
  }, [selectedSlot.current]);

  const time = useMemo(() => {
    return isWithCampaign
      ? parseUTCDate(selectedSlot.current.time)
      : new Date(selectedSlot.current);
  }, [isWithCampaign, selectedSlot.current]);

  const handleGiveSuggestionFocus = () => {
    if (
      Platform.OS !== "android" ||
      !giveSuggestionLayout ||
      !scrollViewRef.current
    ) {
      return;
    }

    const subscription = Keyboard.addListener("keyboardDidShow", (e) => {
      subscription.remove();
      const keyboardHeight = e.endCoordinates.height;
      const visibleHeight = windowHeight - keyboardHeight;
      const scrollY = Math.max(
        0,
        giveSuggestionLayout.y +
          giveSuggestionLayout.height -
          visibleHeight +
          56
      );
      scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
    });
  };

  return (
    <Screen
      style={[
        styles.screen,
        {
          paddingBottom: isKeyboardShown
            ? 0
            : Platform.OS === "ios"
              ? 50
              : 100 + bottomInset,
        },
      ]}
      hasEmergencyButton={false}
      hasHeaderNavigation
      t={t}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "position" : "height"}
      >
        <ScrollView
          ref={scrollViewRef}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => onRefresh()}
            />
          }
          keyboardShouldPersistTaps="handled"
        >
          <ConsultationsBlock
            openJoinConsultation={openJoinConsultation}
            openEditConsultation={openEditConsultation}
            isTmpUser={isTmpUser}
            navigation={navigation}
            currencySymbol={currencySymbol}
          />
          {/* <View
            onLayout={(e) => setGiveSuggestionLayout(e.nativeEvent.layout)}
            collapsable={false}
          >
            <GiveSuggestion
              navigation={navigation}
              type="consultations"
              onTextareaFocus={handleGiveSuggestionFocus}
            />
          </View> */}
          <View style={{ marginBottom: 85 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <JoinConsultation
        isOpen={isJoinConsultationOpen}
        onClose={closeJoinConsultation}
        consultation={selectedConsultation}
      />
      {selectedConsultationProviderId && (
        <SelectConsultation
          isOpen={isSelectConsultationBackdropOpen}
          onClose={closeSelectConsultationBackdrop}
          handleBlockSlot={handleBlockSlot}
          providerId={selectedConsultationProviderId}
          isCtaLoading={isSelectConsultationLoading}
          errorMessage={blockSlotError}
          isInDashboard
          edit
          campaignId={selectedConsultation?.campaignId}
          couponCode={selectedConsultation?.couponCode}
        />
      )}
      {selectedConsultation ? (
        <>
          <EditConsultation
            isOpen={isEditConsultationOpen}
            onClose={closeEditConsultation}
            openCancelConsultation={openCancelConsultation}
            openSelectConsultation={openSelectConsultation}
            consultation={selectedConsultation}
            currencySymbol={currencySymbol}
          />
          <CancelConsultation
            isOpen={isCancelConsultationOpen}
            onClose={closeCancelConsultation}
            consultation={selectedConsultation}
            currencySymbol={currencySymbol}
            secondaryCtaStyle={{ marginBottom: 85 }}
          />
        </>
      ) : null}
      {selectedSlot.current ? (
        <ConfirmConsultation
          isOpen={isConfirmBackdropOpen}
          onClose={closeConfirmConsultationBackdrop}
          ctaStyle={{ marginBottom: 85 }}
          consultation={{
            startDate: time,
            endDate: new Date(
              new Date(time).setHours(new Date(time).getHours() + 1)
            ),
          }}
        />
      ) : null}
      <RequireDataAgreement
        isOpen={isRequireDataAgreementOpen}
        onClose={closeRequireDataAgreement}
        onSuccess={handleDataAgreementSucess}
      />

      {!isKeyboardShown && (
        <View
          style={{
            bottom: Platform.OS === "ios" ? 70 : bottomInset + 120,
            ...styles.askButton,
          }}
        >
          <NewButton
            label={t("button_label")}
            size="lg"
            isFullWidth
            onPress={handleScheduleConsultationClick}
          />
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  askButton: {
    alignSelf: "center",
    position: "absolute",
    width: "100%",
    paddingHorizontal: 16,
  },
  screen: {
    paddingTop: 48,
  },
});

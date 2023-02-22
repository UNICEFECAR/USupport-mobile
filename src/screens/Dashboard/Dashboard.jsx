import React, { useState, useMemo, useRef, useEffect, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { StyleSheet, ScrollView, View, RefreshControl } from "react-native";
import { useTranslation } from "react-i18next";

import {
  Screen,
  AppText,
  AppButton,
  ConsultationDashboard,
  Loading,
} from "#components";

import {
  ArticlesDashboard,
  MascotHeadingBlock,
  ConsultationsDashboard,
  MoodTracker,
} from "#blocks";

import {
  EditConsultation,
  CancelConsultation,
  JoinConsultation,
  SelectConsultation,
  ConfirmConsultation,
} from "#backdrops";

import { RequireDataAgreement } from "#modals";
import { mascotHappyPurple } from "#assets";
import { appStyles } from "#styles";
import { Context } from "#services";

import {
  useAcceptConsultation,
  useBlockSlot,
  useRescheduleConsultation,
  useGetAllConsultations,
  useScheduleConsultation,
  useGetClientData,
} from "#hooks";

import { ONE_HOUR, showToast } from "#utils";

/**
 * Dashboard
 *
 * Dashboard page
 *
 * @returns {JSX.Element}
 */
export const Dashboard = ({ navigation }) => {
  const { t } = useTranslation("dashboard");

  const { isTmpUser, handleRegistrationModalOpen, currencySymbol } =
    useContext(Context);
  const getClientDataEnabled = isTmpUser === false ? true : false;
  const clientData = useGetClientData(getClientDataEnabled)[1];
  const clientName = clientData
    ? clientData?.name
      ? `${clientData.name} ${clientData.surname}`
      : clientData.nickname
    : "";
  const queryClient = useQueryClient();

  const consultationPrice = useRef();

  // Get the consultations data only if the user is NOT temporary
  const consultationsQuery = useGetAllConsultations(
    isTmpUser === false ? true : false
  );

  const upcomingConsultations = useMemo(() => {
    const currentDateTs = new Date().getTime();
    if (consultationsQuery?.data) {
      return consultationsQuery.data
        ?.filter((consultation) => {
          const endTime = consultation.timestamp + ONE_HOUR;
          return (
            consultation.timestamp >= currentDateTs ||
            (currentDateTs >= consultation.timestamp &&
              currentDateTs <= endTime)
          );
        })
        .sort((a, b) => a.timestamp - b.timestamp);
    }
    return null;
  }, [consultationsQuery.data]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["all-consultations"] }),
      queryClient.invalidateQueries({ queryKey: ["client-data"] }),
      queryClient.invalidateQueries({ queryKey: ["getMoodTrackForToday"] }),
    ]);
    setRefreshing(false);
  };

  const [isRequireDataAgreementOpen, setIsRequireDataAgreementOpen] =
    useState(false);
  const openRequireDataAgreement = () => setIsRequireDataAgreementOpen(true);
  const closeRequireDataAgreement = () => setIsRequireDataAgreementOpen(false);

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
    setSelectedConsultation(consultation);
    setIsJoinConsultationOpen(true);
  };
  const closeJoinConsultation = () => setIsJoinConsultationOpen(false);

  const [isEditingConsultation, setIsEditingConsultation] = useState(true);
  const [blockSlotError, setBlockSlotError] = useState();
  const [consultationId, setConsultationId] = useState();

  const selectedSlot = useRef();

  // Modal state variables
  const [
    isSelectConsultationBackdropOpen,
    setIsSelectConsultationBackdropOpen,
  ] = useState(false);
  const [isConfirmBackdropOpen, setIsConfirmBackdropOpen] = useState(false);

  // Open modals
  const openSelectConsultation = () =>
    setIsSelectConsultationBackdropOpen(true);
  const openConfirmConsultationBackdrop = () => setIsConfirmBackdropOpen(true);

  // Close modals
  const closeConfirmConsultationBackdrop = () =>
    setIsConfirmBackdropOpen(false);
  const closeSelectConsultationBackdrop = () =>
    setIsSelectConsultationBackdropOpen(false);

  // Accept consultation logic

  const onAcceptConsultationSuccess = () => {
    showToast({ message: t("accept_success") });
  };
  const onAcceptConsultationError = (error) => {
    showToast({ message: error, type: "error" });
  };
  const acceptConsultationMutation = useAcceptConsultation(
    onAcceptConsultationSuccess,
    onAcceptConsultationError
  );

  const handleAcceptSuggestion = (consultationId, price, slot) => {
    acceptConsultationMutation.mutate({
      consultationId,
      price,
      slot,
    });
  };

  // Schedule consultation logic
  const onRescheduleConsultationSuccess = () => {
    setConsultationId(consultationId);
    closeSelectConsultationBackdrop();
    openConfirmConsultationBackdrop();
    setBlockSlotError(null);

    queryClient.invalidateQueries(["all-consultations"]);
  };
  const onRescheduleConsultationError = (error) => {
    setBlockSlotError(error);
  };
  const rescheduleConsultationMutation = useRescheduleConsultation(
    onRescheduleConsultationSuccess,
    onRescheduleConsultationError
  );

  const onScheduleConsultationError = (error) => {
    toast(error, { type: "error" });
  };
  const scheduleConsultationMutation = useScheduleConsultation(
    onRescheduleConsultationSuccess,
    onScheduleConsultationError
  );

  // Block slot logic
  const onBlockSlotSuccess = (newConsultationId) => {
    if (isEditingConsultation) {
      rescheduleConsultationMutation.mutate({
        consultationId: selectedConsultationId,
        newConsultationId,
      });
    } else {
      if (consultationPrice.current && consultationPrice.current > 0) {
        navigation.navigate("Checkout", {
          consultationId: consultationId,
          selectedSlot: selectedSlot.current,
        });
      } else {
        scheduleConsultationMutation.mutate(selectedConsultationId);
      }
    }
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
      providerId: selectedConsultationProviderId,
    });
  };
  const handleScheduleConsultation = () => {
    if (!clientData.dataProcessing) {
      openRequireDataAgreement();
    } else {
      navigation.push("SelectProvider");
    }
  };

  const handleDataAgreementSucess = () => navigation.navigate("SelectProvider");
  const isSelectConsultationLoading =
    blockSlotMutation.isLoading || rescheduleConsultationMutation.isLoading;

  return (
    <Screen hasHeaderNavigation t={t} hasEmergencyButton={false}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => onRefresh()}
          />
        }
      >
        <MascotHeadingBlock
          image={mascotHappyPurple}
          style={styles.mascotHeadingBlock}
        >
          {clientData?.isLoading || isTmpUser === null ? (
            <Loading />
          ) : (
            <HeadingBlockContent
              isTmpUser={isTmpUser}
              t={t}
              clientName={clientName}
              upcomingConsultations={upcomingConsultations}
              openJoinConsultation={openJoinConsultation}
              openEditConsultation={openEditConsultation}
              handleScheduleConsultation={handleScheduleConsultation}
              handleAcceptSuggestion={handleAcceptSuggestion}
              handleRegistrationModalOpen={handleRegistrationModalOpen}
            />
          )}
        </MascotHeadingBlock>
        <MoodTracker navigation={navigation} />
        <ArticlesDashboard navigation={navigation} />
        <ConsultationsDashboard
          openJoinConsultation={openJoinConsultation}
          openEditConsultation={openEditConsultation}
          handleAcceptSuggestion={handleAcceptSuggestion}
          handleSchedule={handleScheduleConsultation}
          isTmpUser={isTmpUser}
          handleRegistrationModalOpen={handleRegistrationModalOpen}
          upcomingConsultations={upcomingConsultations}
          isLoading={
            consultationsQuery.isLoading &&
            consultationsQuery.fetchStatus !== "idle"
          }
          t={t}
          navigation={navigation}
        />
      </ScrollView>
      <JoinConsultation
        isOpen={isJoinConsultationOpen}
        onClose={closeJoinConsultation}
        consultation={selectedConsultation}
      />
      <SelectConsultation
        isOpen={isSelectConsultationBackdropOpen}
        onClose={closeSelectConsultationBackdrop}
        handleBlockSlot={handleBlockSlot}
        providerId={selectedConsultationProviderId}
        isCtaLoading={isSelectConsultationLoading}
        errorMessage={blockSlotError}
        isInDashboard
      />
      {selectedConsultation && (
        <>
          <EditConsultation
            isOpen={isEditConsultationOpen}
            onClose={closeEditConsultation}
            openCancelConsultation={openCancelConsultation}
            openSelectConsultation={openSelectConsultation}
            consultation={selectedConsultation}
            currencySymbol={currencySymbol}
            t={t}
          />
          <CancelConsultation
            isOpen={isCancelConsultationOpen}
            onClose={closeCancelConsultation}
            consultation={selectedConsultation}
            currencySymbol={currencySymbol}
            secondaryCtaStyle={styles.marginBottom85}
            t={t}
          />
        </>
      )}
      {selectedSlot.current ? (
        <ConfirmConsultation
          isOpen={isConfirmBackdropOpen}
          onClose={closeConfirmConsultationBackdrop}
          ctaStyle={styles.marginBottom85}
          consultation={{
            startDate: new Date(selectedSlot.current),
            endDate: new Date(
              new Date(selectedSlot.current).setHours(
                new Date(selectedSlot.current).getHours() + 1
              )
            ),
          }}
        />
      ) : null}
      <RequireDataAgreement
        isOpen={isRequireDataAgreementOpen}
        onClose={closeRequireDataAgreement}
        onSuccess={handleDataAgreementSucess}
      />
    </Screen>
  );
};

const HeadingBlockContent = ({
  isTmpUser,
  t,
  clientName,
  handleRegistrationModalOpen,
  upcomingConsultations,
  openJoinConsultation,
  openEditConsultation,
  handleScheduleConsultation,
  handleAcceptSuggestion,
}) => {
  return (
    <View>
      {isTmpUser ? (
        <>
          <AppText namedStyle="h3" style={styles.colorTextBlue}>
            {t("no_registration_heading")}
          </AppText>
          <AppText style={[styles.marginTop16, styles.colorTextBlue]}>
            {t("no_registration_subheading")}
          </AppText>
          <AppButton
            label={t("create_account_button")}
            color="purple"
            size="md"
            onPress={handleRegistrationModalOpen}
            style={[styles.alignSelfStart, styles.marginTop16]}
          />
        </>
      ) : (
        <>
          <AppText namedStyle="h3">{t("welcome", { clientName })}</AppText>
          <AppText style={[styles.marginTop16, appStyles.colorTextBlue]}>
            {t("next_consultation")}
          </AppText>
          <ConsultationDashboard
            consultation={
              upcomingConsultations ? upcomingConsultations[0] : null
            }
            style={styles.marginTop16}
            handleJoin={openJoinConsultation}
            handleEdit={openEditConsultation}
            handleSchedule={handleScheduleConsultation}
            handleAcceptSuggestion={handleAcceptSuggestion}
            t={t}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  marginTop16: { marginTop: 16 },
  mascotHeadingBlock: { paddingTop: 70 },
  alignSelfStart: { alignSelf: "flex-start" },
  colorTextBlue: { color: appStyles.colorBlue_263238 },
  marginBottom85: { marginBottom: 85 },
});

import React, { useState, useMemo, useRef, useContext, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useIsFocused } from "@react-navigation/native";
import {
  StyleSheet,
  ScrollView,
  View,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  useWindowDimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import Config from "react-native-config";

import { Screen } from "#components";

import {
  ArticlesDashboard,
  BaselineAssessmentDashboard,
  ConsultationsDashboard,
  MoodTracker,
} from "#blocks";

import {
  EditConsultation,
  CancelConsultation,
  JoinConsultation,
  SelectConsultation,
  ConfirmConsultation,
  ArticleCategories,
  EmergencySituation,
  UserGuide,
} from "#backdrops";

import { BaselineAssesmentModal, RequireDataAgreement } from "#modals";
import { appStyles } from "#styles";
import { Context } from "#services";

import {
  useAcceptConsultation,
  useBlockSlot,
  useRescheduleConsultation,
  useGetAllConsultations,
  useScheduleConsultation,
  useGetClientData,
  useGetTheme,
  useAddCountryEvent,
} from "#hooks";

import { ONE_HOUR, showToast, parseUTCDate } from "#utils";

const { AMAZON_S3_BUCKET } = Config;

/**
 * Dashboard
 *
 * Dashboard page
 *
 * @returns {JSX.Element}
 */
export const Dashboard = ({ navigation }) => {
  const { t } = useTranslation("screens", { keyPrefix: "dashboard" });
  const { isDarkMode } = useGetTheme();
  const isFocused = useIsFocused();
  const {
    isTmpUser,
    handleRegistrationModalOpen,
    currencySymbol,
    setIsAnonymousRegister,
    country,
  } = useContext(Context);

  const addCountryEventMutation = useAddCountryEvent();
  const getClientDataEnabled = isTmpUser === false ? true : false;
  const clientDataQuery = useGetClientData(getClientDataEnabled)[0];
  const clientData = clientDataQuery.data;
  const clientName = clientData
    ? clientData?.name
      ? `${clientData.name} ${clientData.surname}`
      : clientData.nickname
    : "";
  const queryClient = useQueryClient();
  const consultationPrice = useRef();

  const IS_RO = country === "RO";

  useEffect(() => {
    if (clientData && isFocused && !isTmpUser) {
      if (
        !clientData.sex ||
        !clientData.urbanRural ||
        !clientData.yearOfBirth
      ) {
        setIsAnonymousRegister(!!clientData.accessToken);
        setTimeout(() => {
          navigation.navigate("RegisterAboutYou");
        }, 100);
      }
    }
  }, [clientData, isFocused, isTmpUser]);

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
      queryClient.invalidateQueries({
        queryKey: ["latest-baseline-assessment"],
      }),
    ]);
    setRefreshing(false);
  };

  const [shouldRedirectToSelectProvider, setShouldRedirectToSelectProvider] =
    useState(true);
  const [isRequireDataAgreementOpen, setIsRequireDataAgreementOpen] =
    useState(false);
  const openRequireDataAgreement = (shouldRedirect = true) => {
    setShouldRedirectToSelectProvider(shouldRedirect);
    setIsRequireDataAgreementOpen(true);
  };
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
    if (!clientDataQuery.data) return;
    if (!clientDataQuery.data?.dataProcessing) {
      openRequireDataAgreement(true);
    } else {
      acceptConsultationMutation.mutate({
        consultationId,
        price,
        slot,
      });
    }
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
      openRequireDataAgreement(true);
    } else {
      addCountryEventMutation.mutate({
        eventType: "mobile_schedule_button_click",
      });
      navigation.push("SelectProvider");
    }
  };

  const handleDataAgreementSucess = () => {
    if (shouldRedirectToSelectProvider) {
      addCountryEventMutation.mutate({
        eventType: "mobile_schedule_button_click",
      });
      navigation.navigate("SelectProvider");
    }
  };
  const isSelectConsultationLoading =
    blockSlotMutation.isLoading || rescheduleConsultationMutation.isLoading;

  const isWithCampaign = useMemo(() => {
    return !!selectedSlot.current?.time;
  }, [selectedSlot.current]);

  const time = useMemo(() => {
    return isWithCampaign
      ? parseUTCDate(selectedSlot.current.time)
      : new Date(selectedSlot.current);
  }, [isWithCampaign, selectedSlot.current]);

  const [isArticlesModalOpen, setIsArticlesModalOpen] = useState(false);

  const openArticlesModal = () => setIsArticlesModalOpen(true);
  const [allCategories, setAllCategories] = useState();
  const [selectedCategory, setSelectedCategory] = useState();

  const handleSetCategories = (categories) => {
    setAllCategories(categories);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setIsArticlesModalOpen(false);
  };

  const scrollViewRef = useRef(null);
  const [moodTrackerLayout, setMoodTrackerLayout] = useState(null);
  const { height: windowHeight } = useWindowDimensions();

  const [isBaselineAssesmentModalOpen, setIsBaselineAssesmentModalOpen] =
    useState(false);
  const openBaselineAssesmentModal = () => {
    if (isTmpUser) {
      handleRegistrationModalOpen();
      return;
    }
    setIsBaselineAssesmentModalOpen(true);
  };

  const [isEmergencySituationOpen, setIsEmergencySituationOpen] =
    useState(false);
  const openEmergencySituation = () => {
    setIsEmergencySituationOpen(true);
    closeUserGuide();
  };
  const closeEmergencySituation = () => {
    setIsEmergencySituationOpen(false);
    // openUserGuide();
  };

  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  const openUserGuide = () => setIsUserGuideOpen(true);
  const closeUserGuide = () => setIsUserGuideOpen(false);

  const handleMoodTrackerTextareaFocus = () => {
    if (
      Platform.OS !== "android" ||
      !moodTrackerLayout ||
      !scrollViewRef.current
    )
      return;
    const subscription = Keyboard.addListener("keyboardDidShow", (e) => {
      subscription.remove();
      const keyboardHeight = e.endCoordinates.height;
      const visibleHeight = windowHeight - keyboardHeight;
      const scrollY = Math.max(
        0,
        moodTrackerLayout.y + moodTrackerLayout.height - visibleHeight + 56
      );
      scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
    });
  };

  return (
    <Screen hasHeaderNavigation t={t} hasEmergencyButton={false}>
      {IS_RO && (
        <BaselineAssesmentModal
          open={isBaselineAssesmentModalOpen}
          setOpen={setIsBaselineAssesmentModalOpen}
          navigation={navigation}
          isTmpUser={isTmpUser}
        />
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "position" : "height"}
        style={styles.keyboardAvoid}
        // keyboardVerticalOffset={120}
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
          <View
            onLayout={(e) => setMoodTrackerLayout(e.nativeEvent.layout)}
            collapsable={false}
          >
            <MoodTracker
              navigation={navigation}
              clientData={clientData}
              openRequireDataAgreement={openRequireDataAgreement}
              onTextareaFocus={handleMoodTrackerTextareaFocus}
            />
          </View>
          {!IS_RO && (
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
              currencySymbol={currencySymbol}
              navigation={navigation}
            />
          )}
          {IS_RO && (
            <BaselineAssessmentDashboard
              navigation={navigation}
              openBaselineAssesmentModal={openBaselineAssesmentModal}
              isTmpUser={isTmpUser}
              openEmergencySituation={openEmergencySituation}
            />
          )}
          <ArticlesDashboard
            navigation={navigation}
            openArticlesModal={openArticlesModal}
            handleSetCategories={handleSetCategories}
            handleCategorySelect={handleCategorySelect}
            selectCategory={selectedCategory}
            allCategories={allCategories}
          />
        </ScrollView>
      </KeyboardAvoidingView>
      <ArticleCategories
        isOpen={isArticlesModalOpen}
        onClose={() => setIsArticlesModalOpen(false)}
        allCategories={allCategories}
        handleCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
        handleSetCategories={handleSetCategories}
      />
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
          campaignId={selectedConsultation?.campaignId}
          couponCode={selectedConsultation?.couponCode}
        />
      )}
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
      <EmergencySituation
        isOpen={isEmergencySituationOpen}
        onClose={closeEmergencySituation}
      />
      <UserGuide
        isOpen={isUserGuideOpen}
        onClose={closeUserGuide}
        handleOpenEmergencySituation={() => {
          openEmergencySituation();
        }}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: { flex: 1 },
  alignSelfStart: { alignSelf: "flex-start" },
  colorTextBlue: { color: appStyles.colorBlue_263238 },
  marginBottom85: { marginBottom: 85 },
  marginTop16: { marginTop: 16 },
  imageBackground: {
    width: "100%",
    height: 150,
    borderRadius: 25,
    overflow: "hidden",
    marginTop: 16,
  },
  mapContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    width: "100%",
    backgroundColor: appStyles.overlay,
  },
  mapContainerButton: {
    marginTop: 75,
    backgroundColor: "white",
    padding: 1,
    borderRadius: 20,
  },
});

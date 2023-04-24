import React, { useState } from "react";
import { StyleSheet } from "react-native";

import { Screen } from "#components";
import { ActivityHistory as ActivityHistoryBlock } from "#blocks";
import { ScheduleConsultationGroup } from "#backdrops";

import { useGetClientData } from "#hooks";

export const ActivityHistory = ({ navigation, route }) => {
  const consultation = route.params?.consultation;
  const providerId = consultation?.providerId;

  if (!consultation || !providerId) return navigation.navigate("Consultations");

  const clientData = useGetClientData()[1];

  // const [consultationId, setConsultationId] = useState();

  // Modal state variables
  const [isSelectConsultationOpen, setIsSelectConsultationOpen] =
    useState(false);
  const [isConfirmBackdropOpen, setIsConfirmBackdropOpen] = useState(false);
  const [isRequireDataAgreementOpen, setIsRequireDataAgreementOpen] =
    useState(false);

  const openRequireDataAgreement = () => setIsRequireDataAgreementOpen(true);

  // Open modals
  const openSelectConsultation = () => {
    if (!clientData.dataProcessing) {
      openRequireDataAgreement();
      // setIsSelectConsultationOpen(true);
    } else {
      setIsSelectConsultationOpen(true);
    }
  };

  return (
    <Screen hasEmergencyButton={false}>
      <ActivityHistoryBlock
        navigation={navigation}
        openSelectConsultation={openSelectConsultation}
        providerId={providerId}
        consultation={consultation}
      />
      <ScheduleConsultationGroup
        isSelectConsultationOpen={isSelectConsultationOpen}
        setIsSelectConsultationOpen={setIsSelectConsultationOpen}
        isConfirmBackdropOpen={isConfirmBackdropOpen}
        setIsConfirmBackdropOpen={setIsConfirmBackdropOpen}
        isRequireDataAgreementOpen={isRequireDataAgreementOpen}
        setIsRequireDataAgreementOpen={setIsRequireDataAgreementOpen}
        navigation={navigation}
        providerId={providerId}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({});

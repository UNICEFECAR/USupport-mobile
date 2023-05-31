import React, { useState } from "react";
import { Screen } from "#components";
import { Notifications as NotificationsBlock } from "#blocks";
import { JoinConsultation } from "#backdrops";
import { RequireDataAgreement } from "#modals";

/**
 * Notifications
 *
 * Notifiations screen
 *
 * @returns {JSX.Element}
 */
export const Notifications = ({ navigation }) => {
  const [selectedConsultation, setSelectedConsultation] = useState();

  const [isJoinConsultationOpen, setIsJoinConsultationOpen] = useState(false);
  const openJoinConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setIsJoinConsultationOpen(true);
  };
  const closeJoinConsultation = () => setIsJoinConsultationOpen(false);

  const [isRequireDataAgreementOpen, setIsRequireDataAgreementOpen] =
    useState(false);
  const openRequireDataAgreement = () => setIsRequireDataAgreementOpen(true);
  const closeRequireDataAgreement = () => setIsRequireDataAgreementOpen(false);

  return (
    <Screen>
      <NotificationsBlock
        navigation={navigation}
        openJoinConsultation={openJoinConsultation}
        openRequireDataAgreement={openRequireDataAgreement}
      />
      <JoinConsultation
        isOpen={isJoinConsultationOpen}
        onClose={closeJoinConsultation}
        consultation={selectedConsultation}
      />
      <RequireDataAgreement
        isOpen={isRequireDataAgreementOpen}
        onClose={closeRequireDataAgreement}
      />
    </Screen>
  );
};

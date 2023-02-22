import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Screen } from "#components";
import { Notifications as NotificationsBlock } from "#blocks";
import { JoinConsultation } from "#backdrops";

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

  return (
    <Screen>
      <NotificationsBlock
        navigation={navigation}
        openJoinConsultation={openJoinConsultation}
      />
      <JoinConsultation
        isOpen={isJoinConsultationOpen}
        onClose={closeJoinConsultation}
        consultation={selectedConsultation}
      />
    </Screen>
  );
};

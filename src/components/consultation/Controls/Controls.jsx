import React, { useState } from "react";
import { Trans } from "react-i18next";
import PropTypes from "prop-types";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Icon } from "../../icons";
import { ConsultationInformation } from "../../cards/";

import { ONE_HOUR } from "#utils";
import { appStyles } from "#styles";
import { AppText } from "../../texts";

/**
 * Controls
 *
 * Control component
 *
 * @return {jsx}
 */
export const Controls = ({
  consultation,
  toggleCamera,
  toggleMicrophone,
  toggleChat,
  leaveConsultation,
  handleSendMessage,
  handleClose,
  isCameraOn,
  isMicrophoneOn,
  isRoomConnecting,
  hasUnread,
  style,
  isProviderInSession,
  t,
}) => {
  const [isMicOpen, setIsMicOpen] = useState(isMicrophoneOn);
  const [isCameraOpen, setIsCameraOpen] = useState(isCameraOn);

  const timestamp =
    consultation.timestamp || new Date(consultation.time).getTime();

  const startDate = new Date(timestamp);
  const endDate = new Date(timestamp + ONE_HOUR);

  const handleMicClick = () => {
    if (isRoomConnecting) return;

    const content = isMicOpen
      ? "client_microphone_off"
      : "client_microphone_on";
    handleSendMessage(content, "system");

    setIsMicOpen(!isMicOpen);
    toggleMicrophone();
  };

  const handleCameraClick = () => {
    if (isRoomConnecting) return;

    const content = isCameraOpen ? "client_camera_off" : "client_camera_on";
    handleSendMessage(content, "system");

    setIsCameraOpen(!isCameraOpen);
    toggleCamera();
  };

  const handleChat = () => {
    toggleChat();
  };

  const handleHangUp = () => {
    leaveConsultation();
  };

  const renderAllButtons = () => {
    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleCameraClick}>
          <Icon
            style={styles.button}
            name={!isCameraOpen ? "stop-camera" : "video"}
            size="sm"
            color={appStyles.colorPrimary_20809e}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMicClick}>
          <Icon
            style={styles.button}
            name={!isMicOpen ? "stop-mic" : "microphone"}
            size="sm"
            color={appStyles.colorPrimary_20809e}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleChat}>
          {hasUnread && <View style={styles.unread} />}
          <Icon
            style={styles.button}
            name="comment"
            size="sm"
            color={appStyles.colorPrimary_20809e}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleHangUp}>
          <Icon
            style={[styles.button, styles.buttonHangup]}
            name="hang-up"
            size="sm"
            color={appStyles.colorWhite_ff}
          />
        </TouchableOpacity>
      </View>
    );
  };
  const [isConsultationInformationShown, setConsultationInformationShown] =
    useState(true);
  return (
    <View
      style={[
        styles.container,
        style,
        {
          paddingTop: isConsultationInformationShown ? 16 : 40,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => {
          setConsultationInformationShown(!isConsultationInformationShown);
        }}
        hitSlop={styles.arrowHitSlop}
        style={styles.arrow}
      >
        <Icon
          name={`arrow-chevron-${
            isConsultationInformationShown ? "up" : "down"
          }`}
          size="md"
          color="#000000"
        />
      </TouchableOpacity>
      {isConsultationInformationShown ? (
        <>
          <ConsultationInformation
            startDate={startDate}
            endDate={endDate}
            providerName={consultation.providerName}
            providerImage={consultation.image}
            showPriceBadge={false}
            isProviderInSession={isProviderInSession}
            t={t}
          />
          {consultation.sponsorName ? (
            <AppText style={{ paddingBottom: 12 }}>
              <Trans
                components={[
                  <AppText key="sponsorName" namedStyle="h4" isBold />,
                ]}
              >
                {t("sponsored_by", { sponsorName: consultation.sponsorName })}
              </Trans>
            </AppText>
          ) : null}
        </>
      ) : null}
      {renderAllButtons()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 20,
    maxWidth: 420,
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    width: "95%",
    ...appStyles.shadow2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    width: 55,
    height: 55,
    borderRadius: 55 / 2,
    borderWidth: 1,
    borderColor: appStyles.colorPrimary_20809e,
    padding: 11,
  },
  buttonHangup: {
    backgroundColor: appStyles.colorRed_eb5757,
    borderColor: "transparent",
  },
  arrow: {
    alignSelf: "flex-start",
    position: "absolute",
    top: 10,
    right: 16,
    zIndex: 10,
  },
  arrowHitSlop: { top: 20, bottom: 20, left: 20, right: 20 },
  unread: {
    position: "absolute",
    width: 15,
    height: 15,
    borderRadius: 15 / 2,
    backgroundColor: appStyles.colorRed_eb5757,
    zIndex: 999,
    left: 2,
  },
});

Controls.propTypes = {
  /**
   * Consultation object
   */
  consultation: PropTypes.object.isRequired,

  /**
   * Toggle camera
   */
  toggleCamera: PropTypes.func.isRequired,

  /**
   * Toggle microphone
   * */
  toggleMicrophone: PropTypes.func.isRequired,

  /**
   * Toggle chat
   * */
  toggleChat: PropTypes.func.isRequired,

  /**
   * Leave consultation
   * */
  leaveConsultation: PropTypes.func.isRequired,

  /**
   * Handle send message
   * */
  handleSendMessage: PropTypes.func.isRequired,

  /**
   * Is camera on
   * */
  isCameraOn: PropTypes.bool.isRequired,

  /**
   * Is microphone on
   * */
  isMicrophoneOn: PropTypes.bool.isRequired,

  /**
   * Translation function
   * */
  t: PropTypes.func.isRequired,
};

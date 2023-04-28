import React, { useState } from "react";
import PropTypes from "prop-types";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Icon } from "../../icons";
import { ConsultationInformation } from "../../cards/";

import { ONE_HOUR } from "#utils";
import { appStyles } from "#styles";

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
  style,
  t,
}) => {
  const renderIn = "client";

  const [isMicOpen, setIsMicOpen] = useState(isMicrophoneOn);
  const [isCameraOpen, setIsCameraOpen] = useState(isCameraOn);

  const timestamp =
    consultation.timestamp || new Date(consultation.time).getTime();

  const startDate = new Date(timestamp);
  const endDate = new Date(timestamp + ONE_HOUR);

  const handleMicClick = () => {
    const content = isMicOpen
      ? t("client_microphone_off")
      : t("client_microphone_on");
    handleSendMessage(content, "system");

    setIsMicOpen(!isMicOpen);
    toggleMicrophone();
  };

  const handleCameraClick = () => {
    const content = isCameraOpen
      ? t("client_camera_off")
      : t("client_camera_on");
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
          <Icon
            style={styles.button}
            name="comment"
            size="sm"
            color={appStyles.colorPrimary_20809e}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleHangUp}>
          <Icon
            style={styles.buttonHangup}
            name="hang-up"
            size="sm"
            color={appStyles.colorWhite_ff}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <ConsultationInformation
        startDate={startDate}
        endDate={endDate}
        providerName={consultation.providerName}
        providerImage={consultation.image}
        showPriceBadge={false}
        t={t}
      />
      <TouchableOpacity
        onPress={handleClose}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
        }}
      >
        <Icon name="close-x" size="md" color="#000000" />
      </TouchableOpacity>
      {renderAllButtons()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    backgroundColor: appStyles.colorWhite_ff,
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
    // backgroundColor: appStyles.colorPrimary_20809e,
  },
  buttonHangup: {
    backgroundColor: appStyles.colorRed_eb5757,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 40 / 2,
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

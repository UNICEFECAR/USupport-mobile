import React, { useState } from "react";
import PropTypes from "prop-types";
import { View, StyleSheet } from "react-native";

import { Icon } from "../../icons";
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
  isCameraOn,
  isMicrophoneOn,
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
      ? t(`${renderIn}_microphone_off`)
      : t(`${renderIn}_microphone_on`);
    handleSendMessage(content, "system");

    setIsMicOpen(!isMicOpen);
    toggleMicrophone();
  };

  const handleCameraClick = () => {
    const content = isCameraOpen
      ? t(`${renderIn}_camera_off`)
      : t(`${renderIn}_camera_on`);
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
          <View style={styles.button}>
            <Icon
              name={!isCameraOpen ? "stop-camera" : "video"}
              size="lg"
              color={appStyles.colorPrimary_20809e}
              onClick={toggleCamera}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMicClick}>
          <View style={styles.button}>
            <Icon
              name={!isMicOpen ? "stop-mic" : "microphone"}
              size="lg"
              color={appStyles.colorPrimary_20809e}
              onClick={toggleMicrophone}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleChat}>
          <View style={styles.button}>
            <Icon
              name={"comment"}
              size="lg"
              color={appStyles.colorPrimary_20809e}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleHangUp}>
          <View style={styles.buttonHangup}>
            <Icon name={"hangup"} size="lg" color={appStyles.colorWhite_ff} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ConsultationInformation
        startDate={startDate}
        endDate={endDate}
        providerName={consultation.providerName}
        providerImage={consultation.image}
        showPriceBadge={false}
        t={t}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 420,
    ...appStyles.shadow2,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    width: 54,
    height: 54,
    borderRadius: "50%",
    backgroundColor: appStyles.colorPrimary_20809e,
  },
  buttonHangUp: {
    backgroundColor: appStyles.colorRed_eb5757,
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
    borderRadius: "50%",
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

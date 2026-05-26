import React, { useRef, useCallback, useState, useEffect } from "react";
import { JitsiMeeting as JitsiMeetingRoom } from "@jitsi/react-native-sdk";
import {
  BackHandler,
  StyleSheet,
  Platform,
  View,
  TouchableOpacity,
  Linking,
  AppState,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Camera } from "expo-camera";

import {
  Controls,
  Icon,
  TransparentModal,
  AppText,
  AppButton,
} from "#components";
import { appStyles } from "#styles";

import { baseJitsiConfig, baseJitsiFlags } from "./setup";

export const JitsiMeeting = ({
  displayName,
  joinWithVideo = true,
  joinWithMicrophone = true,
  consultation,
  toggleChat,
  leaveConsultation,
  sendJoinConsultationMessage,
  handleSendMessage,
  hasUnread,
  isProviderInSession,
  cameraGranted,
  microphoneGranted,
  // setIsProviderInSession,
  isChatShown,
  // isKeyboardShown,
  // keyboardHeight,
  t,
}) => {
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const jitsiMeeting = useRef(null);

  const [roomKey, setRoomKey] = useState(1);
  const [isAudioEnabled, setIsAudioEnabled] = useState(
    microphoneGranted && joinWithMicrophone
  );
  const [isVideoEnabled, setIsVideoEnabled] = useState(
    cameraGranted && joinWithVideo
  );
  const [shrinkVideo, setShrinkVideo] = useState(false);
  const [areControlsShown, setAreControlsShown] = useState(true);
  const [isCancelConfirmationOpen, setIsCancelConfirmationOpen] =
    useState(false);
  const [isCameraPermissionModalOpen, setIsCameraPermissionModalOpen] =
    useState(false);
  const [isMicrophonePermissionModalOpen, setIsMicrophonePermissionModalOpen] =
    useState(false);
  const [currentCameraGranted, setCurrentCameraGranted] =
    useState(cameraGranted);
  const [currentMicrophoneGranted, setCurrentMicrophoneGranted] =
    useState(microphoneGranted);
  const [shouldStartVideo, setShouldStartVideo] = useState(false);
  const [shouldStartMicrophone, setShouldStartMicrophone] = useState(false);
  const [showCameraInControls, setShowCameraInControls] = useState(
    !currentCameraGranted ? true : joinWithVideo && currentCameraGranted
  );

  const appStateRef = useRef(AppState.currentState);
  const hasInitializedRef = useRef(false);

  const MAIN_TOOLBAR_BUTTONS = [
    ...(currentCameraGranted ? ["camera"] : []),
    ...(currentMicrophoneGranted ? ["microphone"] : []),
    "chat",
  ];

  const jitsiConfig = {
    ...baseJitsiConfig,
    // When microphone permission is denied, start with audio muted
    // This tells Jitsi to mute audio, but it may still try to get the track
    startWithAudioMuted: shouldStartMicrophone
      ? false
      : !currentMicrophoneGranted
        ? true
        : !joinWithMicrophone,

    startWithVideoMuted: shouldStartVideo
      ? false // If user went to allow the camera permissions  - start with video unmuted
      : !currentCameraGranted
        ? true // If no camera permissions - start with video muted
        : !joinWithVideo, // Default to joinWithVideo(coming from JoinConsultation backdrop)

    startAudioOnly: !currentCameraGranted,
    toolbarButtons: [
      ...(currentCameraGranted ? ["camera"] : []),
      ...(currentMicrophoneGranted ? ["microphone"] : []),
    ],
    mainToolbarButtons: MAIN_TOOLBAR_BUTTONS,
  };

  const jitsiFlags = {
    ...baseJitsiFlags,
    "audioMute.enabled": currentMicrophoneGranted ? true : false,
    "audioOnly.enabled":
      !currentMicrophoneGranted || !currentCameraGranted ? true : false,
    "video-mute.enabled": currentCameraGranted ? true : false,
  };

  useEffect(() => {
    let timeout;
    if (isChatShown) {
      timeout = setTimeout(() => {
        setShrinkVideo(isChatShown);
      }, 550);
    } else {
      setShrinkVideo(false);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isChatShown]);

  // Recheck permissions when app comes back from settings
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        // App is coming back to foreground from background/inactive
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          // Recheck permissions if modals were open
          if (isCameraPermissionModalOpen || isMicrophonePermissionModalOpen) {
            const cameraGranted = await checkCameraPermission();
            const micGranted = await checkMicrophonePermission();

            // Close modals if permissions are now granted
            if (isCameraPermissionModalOpen && cameraGranted) {
              setIsCameraPermissionModalOpen(false);
              // Reset initialization flag so Jitsi events are ignored during remount
              hasInitializedRef.current = false;
              setShouldStartVideo(true); // Make sure jitsi initializes the camera
              setIsVideoEnabled(true); // Update the camera icon
              setRoomKey((prev) => prev + 1);
            }
            if (isMicrophonePermissionModalOpen && micGranted) {
              console.log("ENTER HERE TO UNMUTE MICROPHONE");
              setIsMicrophonePermissionModalOpen(false);
              // Reset initialization flag so Jitsi events are ignored during remount
              hasInitializedRef.current = false;

              setShouldStartMicrophone(true);
              setIsAudioEnabled(true);
              setRoomKey((prev) => prev + 1);
            }
          }
        }

        appStateRef.current = nextAppState;
      }
    );

    return () => {
      subscription?.remove();
    };
  }, [isCameraPermissionModalOpen, isMicrophonePermissionModalOpen]);

  const onReadyToClose = useCallback(() => {
    // @ts-ignore
    jitsiMeeting.current.close();
    leaveConsultation();
  }, []);

  const eventListeners = {
    onConferenceJoined: () => {
      // Mark as initialized after a delay to ignore initial muted change events
      setTimeout(() => {
        hasInitializedRef.current = true;
        sendJoinConsultationMessage();
      }, 1000);
    },
    onReadyToClose,
    onVideoMutedChanged: (data) => {
      // Only update state from Jitsi events after initialization
      // This prevents Jitsi from overriding our initial joinWithVideo setting
      if (hasInitializedRef.current && currentCameraGranted) {
        setIsVideoEnabled(!data);
        setShowCameraInControls(true);
        setShouldStartVideo(!data);
      }
    },
    onAudioMutedChanged: (data) => {
      // Only update state from Jitsi events after initialization
      // This prevents Jitsi from overriding our initial joinWithMicrophone setting
      if (hasInitializedRef.current && currentMicrophoneGranted) {
        setIsAudioEnabled(!data);
        setShouldStartMicrophone(!data);
      }
    },
    onConferenceLeft: () => {
      leaveConsultation();
    },
  };

  const handleControlsToggle = () => {
    const value = areControlsShown ? -appStyles.screenWidth : 0;
    controlsPosition.value = withSpring(value, appStyles.springConfig);
    setAreControlsShown(!areControlsShown);
  };
  const controlsPosition = useSharedValue(0);
  const controlsStyles = useAnimatedStyle(() => {
    return {
      zIndex: 11,
      elevation: 11,
      position: "absolute",
      top: 0,
      left: controlsPosition.value,
      width: "100%",
    };
  });

  const disconnect = () => {
    setIsCancelConfirmationOpen(false);
    leaveConsultation();
    jitsiMeeting.current?.close();
  };

  const checkMicrophonePermission = async () => {
    try {
      const { status } = await Camera.getMicrophonePermissionsAsync();
      const granted = status === "granted";
      setCurrentMicrophoneGranted(granted);
      return granted;
    } catch (error) {
      console.error("Error checking microphone permission:", error);
      return false;
    }
  };

  const checkCameraPermission = async () => {
    try {
      const { status } = await Camera.getCameraPermissionsAsync();
      const granted = status === "granted";
      setCurrentCameraGranted(granted);
      return granted;
    } catch (error) {
      console.error("Error checking camera permission:", error);
      return false;
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const { status } = await Camera.requestMicrophonePermissionsAsync();
      const granted = status === "granted";
      setCurrentMicrophoneGranted(granted);
      return granted;
    } catch (error) {
      console.error("Error requesting microphone permission:", error);
      return false;
    }
  };

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const granted = status === "granted";
      setCurrentCameraGranted(granted);
      return granted;
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      return false;
    }
  };

  const toggleAudio = async () => {
    // Check current permission status

    const hasPermission = await checkMicrophonePermission();

    if (!hasPermission) {
      setIsMicrophonePermissionModalOpen(true);
      return;
    }

    // if (!hasPermission) {
    //   // Try to request permission again
    //   const granted = await requestMicrophonePermission();

    //   if (!granted) {
    //     // Show settings modal if permission still not granted
    //     setIsMicrophonePermissionModalOpen(true);
    //     return;
    //   }
    // }

    // Permission is granted, proceed with toggle
    const newAudioState = !isAudioEnabled;
    jitsiMeeting.current?.setAudioMuted(!newAudioState);
    setIsAudioEnabled(newAudioState);

    // Send system message about microphone state change
    const content = newAudioState
      ? "client_microphone_on"
      : "client_microphone_off";
    handleSendMessage(content, "system");
  };

  const toggleVideo = async () => {
    // Check current permission status
    const hasPermission = await checkCameraPermission();

    if (!hasPermission) {
      setIsCameraPermissionModalOpen(true);
      return;
    }

    // if (!hasPermission) {
    //   // Try to request permission again
    //   const granted = await requestCameraPermission();

    //   if (!granted) {
    //     // Show settings modal if permission still not granted
    //     setIsCameraPermissionModalOpen(true);
    //     return;
    //   }
    // }

    // Permission is granted, proceed with toggle
    const newVideoState = !isVideoEnabled;
    jitsiMeeting.current?.setVideoMuted(!newVideoState);
    setIsVideoEnabled(newVideoState);

    // Send system message about camera state change
    const content = newVideoState ? "client_camera_on" : "client_camera_off";
    handleSendMessage(content, "system");
  };

  return (
    <>
      <TransparentModal
        isOpen={isCancelConfirmationOpen}
        handleClose={() => setIsCancelConfirmationOpen(false)}
        heading={t("cancel_confirmation_heading")}
        ctaLabel={t("cancel_confirmation_cta")}
        ctaHandleClick={disconnect}
        secondaryCtaLabel={t("cancel_confirmation_secondary_cta")}
        secondaryCtaHandleClick={() => setIsCancelConfirmationOpen(false)}
        secondaryCtaType="secondary"
      />
      <MicrophonePermissionModal
        isMicrophonePermissionModalOpen={isMicrophonePermissionModalOpen}
        setIsMicrophonePermissionModalOpen={setIsMicrophonePermissionModalOpen}
        t={t}
      />
      <CameraPermissionModal
        isCameraPermissionModalOpen={isCameraPermissionModalOpen}
        setIsCameraPermissionModalOpen={setIsCameraPermissionModalOpen}
        t={t}
      />
      <View
        style={[
          styles.container,
          Platform.OS === "android" ? { paddingBottom: bottomInset } : null,
        ]}
      >
        {areControlsShown ? (
          <TouchableOpacity
            onPress={handleControlsToggle}
            style={[styles.controlsToggle, { top: 15 + topInset }]}
          >
            <Icon name="arrow-chevron-back" size="md" color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleControlsToggle}
            style={[styles.controlsToggle, { top: 20 + topInset }]}
          >
            <Icon name="arrow-chevron-forward" size="md" color="#ffffff" />
          </TouchableOpacity>
        )}
        <Animated.View style={controlsStyles}>
          <Controls
            consultation={consultation}
            isMicrophoneOn={isAudioEnabled}
            isCameraOn={isVideoEnabled}
            toggleMicrophone={toggleAudio}
            toggleCamera={toggleVideo}
            toggleChat={toggleChat}
            leaveConsultation={() => setIsCancelConfirmationOpen(true)}
            handleClose={handleControlsToggle}
            isRoomConnecting={false}
            hasUnread={hasUnread}
            isProviderInSession={isProviderInSession}
            showCamera={showCameraInControls}
            t={t}
            style={[styles.controls, { marginTop: topInset }]}
          />
        </Animated.View>
        <View style={styles.chatIconView}>
          <TouchableOpacity onPress={toggleChat}>
            {hasUnread && <View style={styles.unread} />}
            <Icon
              style={styles.chatIcon}
              name="comment"
              size="md"
              color={"white"}
            />
          </TouchableOpacity>
        </View>
        <JitsiMeetingRoom
          userInfo={{
            displayName,
          }}
          config={jitsiConfig}
          eventListeners={eventListeners}
          flags={jitsiFlags}
          ref={jitsiMeeting}
          key={roomKey}
          style={isChatShown ? styles.meetingShrunk : styles.meetingFull}
          room={consultation.consultationId}
          serverURL={"https://jitsi.usupport.online"}
        >
          <TouchableOpacity onPress={toggleChat}>
            {hasUnread && <View style={styles.unread} />}

            <Icon
              style={styles.messageIcon}
              name="comment"
              size="md"
              color={"white"}
            />
          </TouchableOpacity>
        </JitsiMeetingRoom>
      </View>
    </>
  );
};

const MicrophonePermissionModal = ({
  isMicrophonePermissionModalOpen,
  setIsMicrophonePermissionModalOpen,
  t,
}) => {
  return (
    <TransparentModal
      isOpen={isMicrophonePermissionModalOpen}
      handleClose={() => setIsMicrophonePermissionModalOpen(false)}
      heading={t("permissions_error_microphone")}
    >
      <AppText>{t("permissions_error_microphone_subheading")}</AppText>
      <AppButton
        label={t("open_settings")}
        onPress={() => {
          Linking.openSettings();
        }}
        style={{ marginTop: 16 }}
      />
    </TransparentModal>
  );
};

const CameraPermissionModal = ({
  isCameraPermissionModalOpen,
  setIsCameraPermissionModalOpen,
  t,
}) => {
  return (
    <TransparentModal
      isOpen={isCameraPermissionModalOpen}
      handleClose={() => setIsCameraPermissionModalOpen(false)}
      heading={t("permissions_error_camera")}
    >
      <AppText>{t("permissions_error_camera_subheading")}</AppText>
      <AppButton
        label={t("open_settings")}
        onPress={() => {
          Linking.openSettings();
        }}
        style={{ marginTop: 16 }}
      />
    </TransparentModal>
  );
};

const styles = StyleSheet.create({
  chatIcon: {
    alignItems: "center",
    backgroundColor: appStyles.colorPrimary_20809e,
    borderColor: appStyles.colorBlue_3d527b,
    borderRadius: 45 / 2,
    borderWidth: 0.5,
    height: 45,
    justifyContent: "center",
    padding: 10,
    width: 45,
  },
  chatIconView: {
    bottom: 125,
    left: 10,
    position: "absolute",
    zIndex: 3,
  },
  container: {
    flex: 1,
  },
  controls: {
    elevation: 10,
    zIndex: 10,
  },
  controlsToggle: {
    left: 20,
    position: "absolute",
    zIndex: 999,
  },
  meetingFull: {
    flex: 1,
  },
  meetingShrunk: {
    flex: 0.5,
  },
  messageIcon: {
    alignItems: "center",
    height: 25,
    justifyContent: "center",
    width: 25,
  },
  unread: {
    backgroundColor: appStyles.colorRed_eb5757,
    borderRadius: 12 / 2,
    height: 12,
    left: 2,
    position: "absolute",
    width: 12,
    zIndex: 999,
  },
});

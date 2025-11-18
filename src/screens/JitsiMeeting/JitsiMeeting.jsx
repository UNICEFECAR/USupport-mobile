import React, { useRef, useCallback, useState, useEffect } from "react";
import { JitsiMeeting as JitsiMeetingRoom } from "@jitsi/react-native-sdk";
import {
  BackHandler,
  StyleSheet,
  Platform,
  View,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Controls, Icon, TransparentModal } from "#components";
import { appStyles } from "#styles";

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
  // setIsProviderInSession,
  isChatShown,
  // isKeyboardShown,
  // keyboardHeight,
  t,
}) => {
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const jitsiMeeting = useRef(null);

  const [isAudioEnabled, setIsAudioEnabled] = useState(joinWithMicrophone);
  const [isVideoEnabled, setIsVideoEnabled] = useState(joinWithVideo);
  const [shrinkVideo, setShrinkVideo] = useState(false);
  const [areControlsShown, setAreControlsShown] = useState(true);
  const [isCancelConfirmationOpen, setIsCancelConfirmationOpen] =
    useState(false);

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

  // Initialize audio and video state when conference is joined
  // useEffect(() => {
  //   if (status === "connected" && jitsiMeeting.current) {
  //     // Add a small delay to ensure Jitsi is fully initialized
  //     setTimeout(() => {
  //       // Set initial audio state
  //       if (!joinWithMicrophone) {
  //         jitsiMeeting.current?.setAudioMuted(true);
  //         setIsAudioEnabled(false);
  //       } else {
  //         jitsiMeeting.current?.setAudioMuted(false);
  //         setIsAudioEnabled(true);
  //       }

  //       // Set initial video state
  //       if (!joinWithVideo) {
  //         jitsiMeeting.current?.setVideoMuted(true);
  //         setIsVideoEnabled(false);
  //       } else {
  //         jitsiMeeting.current?.setVideoMuted(false);
  //         setIsVideoEnabled(true);
  //       }
  //     }, 1000);
  //   }
  // }, [status, joinWithMicrophone, joinWithVideo]);

  const onReadyToClose = useCallback(() => {
    // @ts-ignore
    jitsiMeeting.current.close();
    leaveConsultation();
  }, []);

  const eventListeners = {
    onConferenceJoined: () => {
      setTimeout(() => {
        sendJoinConsultationMessage();
      }, 1000);
    },
    onReadyToClose,
    onVideoMutedChanged: (data) => {
      setIsVideoEnabled(!data.muted);
    },
    onAudioMutedChanged: (data) => {
      setIsAudioEnabled(!data.muted);
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

  const toggleAudio = () => {
    jitsiMeeting.current?.setAudioMuted(!isAudioEnabled);
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleVideo = () => {
    if (isVideoEnabled) {
      jitsiMeeting.current?.setVideoMuted(true);
    } else {
      jitsiMeeting.current?.setVideoMuted(false);
    }
    setIsVideoEnabled(!isVideoEnabled);
  };

  return (
    <>
      <TransparentModal
        isOpen={isCancelConfirmationOpen}
        handleClose={() => setIsCancelConfirmationOpen(false)}
        heading={t("cancel_confirmation_heading")}
        ctaLabel={t("cancel_confirmation_cta")}
        ctaHandleClick={disconnect}
        ctaColor="red"
        secondaryCtaLabel={t("cancel_confirmation_secondary_cta")}
        secondaryCtaHandleClick={() => setIsCancelConfirmationOpen(false)}
        secondaryCtaType="secondary"
      />
      <View
        style={[
          styles.container,
          Platform.OS === "android" ? { paddingBottom: bottomInset } : null,
        ]}
      >
        {!areControlsShown ? (
          <TouchableOpacity
            onPress={handleControlsToggle}
            style={[styles.controlsToggle, { top: 20 + topInset }]}
          >
            <Icon name="arrow-chevron-forward" size="lg" color="#ffffff" />
          </TouchableOpacity>
        ) : null}
        <Animated.View style={controlsStyles}>
          <Controls
            consultation={consultation}
            isMicrophoneOn={isAudioEnabled}
            isCameraOn={isVideoEnabled}
            toggleMicrophone={toggleAudio}
            toggleCamera={toggleVideo}
            toggleChat={toggleChat}
            leaveConsultation={() => setIsCancelConfirmationOpen(true)}
            handleSendMessage={handleSendMessage}
            handleClose={handleControlsToggle}
            isRoomConnecting={false}
            hasUnread={hasUnread}
            isProviderInSession={isProviderInSession}
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
          config={{
            hideConferenceTimer: true,
            disableModeratorIndicator: true, // Ensures no "moderator" role
            enableWelcomePage: false, // Skip welcome screen
            prejoinConfig: { enabled: false }, // Users join instantly
            lobbyMode: { enabled: false }, // Prevent waiting room
            disableInviteFunctions: true, // Prevents requiring moderator approval

            startWithAudioMuted: !joinWithMicrophone,
            startWithVideoMuted: !joinWithVideo,
            toolbarButtons: [
              "camera",
              "microphone",
              // "chat",
            ],
            mainToolbarButtons: ["camera", "microphone", "chat"],
            disableChat: true,
            disableInviteFunctions: true,
            disableShareVideo: true,
          }}
          eventListeners={eventListeners}
          flags={{
            "ios.screensharing.enabled": false,
            "fullscreen.enabled": false,
            "audioMute.enabled": true,
            "audioOnly.enabled": false,
            "video-mute.enabled": true,
            "android.screensharing.enabled": false,
            "pip.enabled": true,
            "pip-while-screen-sharing.enabled": true,
            "conference-timer.enabled": false,
            "close-captions.enabled": false,
            "toolbox.enabled": true,
            "prejoinpage.enabled": false,
            "lobby-mode.enabled": false,
            "meeting-name.enabled": false,
            "meeting-password.enabled": false,
            "meeting-end-enabled": false,
            "conference-end-enabled": false,
            "end-conference-enabled": false,
            "invite.enabled": false,
            "chat.enabled": false,
            "raise-hand.enabled": false,
            "share.enabled": false,
            "breakout-rooms.enabled": false,
            "recording.enabled": false,
            "share-video.enabled": false,
            "reactions.enabled": false,
            "security-options.enabled": false,
            "car-mode.enabled": false,
            "shared-video.enabled": false,
            "sharedvideo.enabled": false,
            "settings.enabled": false,
            "menu.enabled": false,
            "video-share.enabled": false,
            "participants.enabled": false,
          }}
          ref={jitsiMeeting}
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

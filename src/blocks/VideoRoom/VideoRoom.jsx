import React, { useState, useEffect, useRef } from "react";
import {
  TwilioVideo,
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
} from "react-native-twilio-video-webrtc";
import {
  StyleSheet,
  Platform,
  View,
  PermissionsAndroid,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { Controls, Icon } from "#components";
import { appStyles } from "#styles";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export const VideoRoom = ({
  joinWithVideo = true,
  joinWithMicrophone = true,
  consultation,
  toggleChat,
  leaveConsultation,
  sendJoinConsultationMessage,
  handleSendMessage,
  token,
  hasUnread,
  isProviderInSession,
  isChatShown,
  navigation,
  t,
}) => {
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const [isAudioEnabled, setIsAudioEnabled] = useState(joinWithMicrophone);
  const [isVideoEnabled, setIsVideoEnabled] = useState(joinWithVideo);
  const [status, setStatus] = useState("disconnected");
  const [participants, setParticipants] = useState(new Map());
  const [videoTracks, setVideoTracks] = useState(new Map());

  const [shrinkVideo, setShrinkVideo] = useState(false);

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

  const twilioVideo = useRef();
  const connect = async () => {
    if (Platform.OS === "android") {
      await _requestAudioPermission();
      await _requestCameraPermission();
    }
    twilioVideo.current?.connect({
      roomName: consultation.consultationId,
      accessToken: token,
      enableVideo: joinWithVideo,
      enableAudio: joinWithMicrophone,
      encodingParameters: {
        enableH264Codec: true,
        audioBitrate: 16,
        videoBitrate: 1200,
      },
    });
  };
  useEffect(() => {
    if (token) {
      connect();
    }

    return () => twilioVideo.current?.disconnect();
  }, []);

  const disconnect = async () => {
    leaveConsultation();
    twilioVideo.current?.disconnect();
  };

  const _onRoomDidConnect = () => {
    sendJoinConsultationMessage();
    setStatus("connected");
  };

  const _onRoomDidDisconnect = ({ error }) => {
    setStatus("disconnected");
  };

  const _onParticipantAddedVideoTrack = ({ participant, track }) => {
    setVideoTracks(
      new Map([
        ...videoTracks,
        [
          track.trackSid,
          { participantSid: participant.sid, videoTrackSid: track.trackSid },
        ],
      ])
    );
  };

  const _onParticipantRemovedVideoTrack = ({ participant, track }) => {
    const newVideoTracks = new Map(videoTracks);
    newVideoTracks.delete(track.trackSid);
    setVideoTracks(newVideoTracks);
  };

  const _requestAudioPermission = () => {
    return PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: "Need permission to access microphone",
        message: "",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
  };

  const _requestCameraPermission = () => {
    return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
      title: "Need permission to access camera",
      message: "",
      buttonNegative: "Cancel",
      buttonPositive: "OK",
    });
  };

  const [hasStartedCameraInitially, setHasStartedCameraInitially] =
    useState(joinWithVideo);

  const toggleVideo = async () => {
    if (isVideoEnabled) {
      await twilioVideo.current.setLocalVideoEnabled(false);
    } else {
      if (!hasStartedCameraInitially) {
        setHasStartedCameraInitially(true);
        await twilioVideo.current.setLocalVideoEnabled(true);
      } else {
        await twilioVideo.current.setLocalVideoEnabled(true);
      }
    }
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleAudio = () => {
    twilioVideo.current
      .setLocalAudioEnabled(!isAudioEnabled)
      .then((isEnabled) => setIsAudioEnabled(isEnabled));
  };

  const [areControlsShown, setAreControlsShown] = useState(true);
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

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, flex: 1 }}>
      {!areControlsShown ? (
        <TouchableOpacity
          onPress={handleControlsToggle}
          style={{
            position: "absolute",
            top: 20 + topInset,
            left: 20,
            zIndex: 999,
          }}
        >
          <Icon name="arrow-chevron-forward" size="lg" color="#ffffff" />
        </TouchableOpacity>
      ) : null}
      <Animated.View style={controlsStyles}>
        {!isChatShown ? (
          <Controls
            consultation={consultation}
            isMicrophoneOn={isAudioEnabled}
            isCameraOn={isVideoEnabled}
            toggleMicrophone={toggleAudio}
            toggleCamera={toggleVideo}
            toggleChat={toggleChat}
            leaveConsultation={disconnect}
            handleSendMessage={handleSendMessage}
            handleClose={handleControlsToggle}
            isRoomConnecting={status !== "connected"}
            hasUnread={hasUnread}
            isProviderInSession={isProviderInSession}
            t={t}
            style={{ marginTop: topInset, elevation: 10, zIndex: 10 }}
          />
        ) : null}
      </Animated.View>
      {status === "connected" && videoTracks.size !== 0 ? (
        <View>
          {Array.from(videoTracks, ([trackSid, trackIdentifier]) => {
            return (
              <TwilioVideoParticipantView
                style={[
                  styles.remoteVideo,
                  {
                    height: shrinkVideo
                      ? appStyles.screenHeight * 0.5
                      : appStyles.screenHeight,
                  },
                ]}
                key={trackSid}
                trackIdentifier={trackIdentifier}
              />
            );
          })}
        </View>
      ) : (
        <View
          style={{
            alignItems: "center",
            position: "absolute",
            justifyContent: "center",
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
          }}
        >
          <Icon name="stop-camera" size="lg" color="#ffffff" />
        </View>
      )}
      {isVideoEnabled ? (
        <TwilioVideoLocalView
          enabled={true}
          applyZOrder
          scaleType="fit"
          style={[
            styles.localVideo,
            {
              marginBottom: bottomInset,
            },
          ]}
        />
      ) : (
        <LocalVideoOff bottomInset={bottomInset} />
      )}

      <TwilioVideo
        ref={twilioVideo}
        onRoomDidConnect={_onRoomDidConnect}
        onRoomDidDisconnect={_onRoomDidDisconnect}
        onParticipantAddedVideoTrack={_onParticipantAddedVideoTrack}
        onParticipantRemovedVideoTrack={_onParticipantRemovedVideoTrack}
        onParticipantEnabledVideoTrack={_onParticipantAddedVideoTrack}
        onParticipantDisabledVideoTrack={_onParticipantRemovedVideoTrack}
        onVideoChanged={(changed) => setIsVideoEnabled(changed.videoEnabled)}
      />
    </ScrollView>
  );
};

const LocalVideoOff = ({ bottomInset }) => {
  return (
    <View style={[styles.localVideoOff, { marginBottom: bottomInset }]}>
      <Icon name="stop-camera" size="xl" color="#ffffff" />
    </View>
  );
};

const styles = StyleSheet.create({
  localVideo: {
    borderRadius: 25,
    bottom: 0,
    elevation: 20,
    height: 200,
    position: "absolute",
    right: 0,
    width: 150,
    zIndex: 20,
    overflow: "hidden",
    marginRight: 8,
  },
  remoteVideo: {
    marginLeft: 0,
    marginRight: 0,
    height: appStyles.screenHeight,
    width: "100%",
    // height: "50%",
    zIndex: 10,
    elevation: 10,
    transform: [{ rotateY: "180deg" }],
    position: "absolute",
    top: 0,
  },
  localVideoOff: {
    alignItems: "center",
    backgroundColor: appStyles.colorBlack_37,
    borderColor: appStyles.colorPrimary_20809e,
    borderRadius: 25,
    borderWidth: 1,
    bottom: 0,
    elevation: 20,
    height: 200,
    justifyContent: "center",
    marginRight: 8,
    position: "absolute",
    right: 0,
    width: 150,
    zIndex: 20,
  },
});

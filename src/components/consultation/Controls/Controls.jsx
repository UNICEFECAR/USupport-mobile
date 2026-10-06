import React, { useEffect, useState } from "react";
import { Trans } from "react-i18next";
import PropTypes from "prop-types";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Config from "react-native-config";

import { Icon } from "../../icons";
import { IconWifiOff, IconWifiOn } from "../../icons/assets/sprite";
import { Avatar } from "../../avatars";
import { AppText } from "../../texts";

import { ONE_HOUR, getTimeAsString } from "#utils";
import { appStyles } from "#styles";

const { AMAZON_S3_BUCKET } = Config;

const TIME_LEFT_REFRESH_INTERVAL = 30000;
const BUTTON_SIZE = 52;
// The video SDK places the self view in the bottom right corner: an 80px thumbnail with 8px of margins.
// The buttons sit on the same line, centered in the space to the left of it
const SELF_VIEW_SIZE = 80;
const SELF_VIEW_MARGIN = 8;
const DOCK_HEIGHT = BUTTON_SIZE + 12;
const DOCK_BOTTOM_OFFSET = SELF_VIEW_MARGIN + (SELF_VIEW_SIZE - DOCK_HEIGHT) / 2;
const DOCK_RIGHT_OFFSET = SELF_VIEW_SIZE + 2 * SELF_VIEW_MARGIN;
// With the SDK's toolbar (48px buttons with margins), which shows up when the video is tapped and moves
// the self view up, the buttons sit above the toolbar on the left
const DOCK_BOTTOM_OFFSET_WITH_TOOLBAR = 76;

// Dark gray with a light outline, so the controls stand out both over a video
// and over the black background shown when the other participant's camera is off
const SURFACE_COLOR = "rgba(40, 44, 48, 0.88)";
const SURFACE_BORDER_COLOR = "rgba(255, 255, 255, 0.12)";
// Off controls are white so they stand out, on ones are see-through
const BUTTON_ON_COLOR = "rgba(255, 255, 255, 0.16)";
const TEXT_SECONDARY_COLOR = "#c9d0d6";

/**
 * The connection chip next to the provider's name. A healthy call shows only the icon,
 * anything else is spelled out
 */
const getCallStatus = (isProviderInSession, connectionQuality) => {
  if (!isProviderInSession) {
    return {
      color: appStyles.colorRed_eb5757,
      labelKey: "call_status_waiting",
    };
  }
  if (connectionQuality === "lost") {
    return {
      color: appStyles.colorRed_eb5757,
      labelKey: "call_status_disconnected",
    };
  }
  if (connectionQuality === "poor") {
    return {
      color: appStyles.colorOrange_fb6514,
      labelKey: "call_status_weak",
    };
  }
  return { color: appStyles.colorGreen_7ec680, labelKey: null };
};

const ControlButton = ({ iconName, isOff, onPress, hasBadge, color }) => (
  <TouchableOpacity
    onPress={onPress}
    accessibilityRole="button"
    style={[
      styles.button,
      {
        backgroundColor:
          color || (isOff ? appStyles.colorWhite_ff : BUTTON_ON_COLOR),
      },
    ]}
  >
    <Icon
      name={iconName}
      size="md"
      color={isOff ? appStyles.colorBlack_37 : appStyles.colorWhite_ff}
    />
    {hasBadge && <View style={styles.unread} />}
  </TouchableOpacity>
);

/**
 * Controls
 *
 * The consultation controls over the video: the provider's details at the top
 * and the call buttons at the bottom
 *
 * @return {jsx}
 */
export const Controls = ({
  consultation,
  toggleCamera,
  toggleMicrophone,
  toggleChat,
  leaveConsultation,
  isCameraOn,
  isMicrophoneOn,
  isRoomConnecting,
  hasUnread,
  isProviderInSession,
  connectionQuality = "good",
  showCamera = true,
  isSdkToolbarEnabled = false,
  topInset = 0,
  bottomInset = 0,
  t,
}) => {
  const timestamp =
    consultation.timestamp || new Date(consultation.time).getTime();
  const startDate = new Date(timestamp);
  const endDate = new Date(timestamp + ONE_HOUR);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(
      () => setNow(Date.now()),
      TIME_LEFT_REFRESH_INTERVAL
    );
    return () => clearInterval(interval);
  }, []);

  // The time left is shown only while the consultation is running
  const minutesLeft =
    now >= startDate.getTime() && now < endDate.getTime()
      ? Math.ceil((endDate.getTime() - now) / (60 * 1000))
      : null;
  const timeRange = `${getTimeAsString(startDate)} - ${getTimeAsString(endDate)}`;
  const timeText =
    minutesLeft !== null
      ? `${timeRange} · ${t("minutes_left", { minutes: minutesLeft })}`
      : timeRange;

  const callStatus = getCallStatus(isProviderInSession, connectionQuality);

  const handleMicClick = () => {
    if (isRoomConnecting) return;
    toggleMicrophone();
  };

  const handleCameraClick = () => {
    if (isRoomConnecting) return;
    toggleCamera();
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <View style={[styles.infoPill, { top: topInset + 8 }]}>
        <Avatar
          image={{
            uri: `${AMAZON_S3_BUCKET}/${consultation.image || "default"}`,
          }}
          style={styles.avatar}
        />
        <View style={styles.infoText}>
          <AppText isSemibold numberOfLines={1} style={styles.providerName}>
            {consultation.providerName}
          </AppText>
          <AppText
            namedStyle="smallText"
            numberOfLines={1}
            style={styles.secondaryText}
          >
            {timeText}
          </AppText>
          {consultation.sponsorName ? (
            <AppText
              namedStyle="smallText"
              numberOfLines={1}
              style={styles.secondaryText}
            >
              <Trans
                components={[
                  <AppText
                    key="sponsorName"
                    namedStyle="smallText"
                    isBold
                    style={styles.secondaryText}
                  />,
                ]}
              >
                {t("sponsored_by", { sponsorName: consultation.sponsorName })}
              </Trans>
            </AppText>
          ) : null}
        </View>
        <View
          style={[styles.statusChip, { backgroundColor: callStatus.color }]}
        >
          {callStatus.labelKey ? <IconWifiOff size={18} /> : <IconWifiOn />}
          {callStatus.labelKey ? (
            <AppText
              namedStyle="smallText"
              isSemibold
              numberOfLines={1}
              style={styles.statusText}
            >
              {t(callStatus.labelKey)}
            </AppText>
          ) : null}
        </View>
      </View>

      <View
        style={[
          styles.dockArea,
          isSdkToolbarEnabled
            ? {
                alignItems: "flex-start",
                bottom: bottomInset + DOCK_BOTTOM_OFFSET_WITH_TOOLBAR,
                left: 12,
              }
            : { bottom: bottomInset + DOCK_BOTTOM_OFFSET },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.dock}>
          {showCamera && (
            <ControlButton
              iconName={isCameraOn ? "video" : "stop-camera"}
              isOff={!isCameraOn}
              onPress={handleCameraClick}
            />
          )}
          <ControlButton
            iconName={isMicrophoneOn ? "microphone" : "stop-mic"}
            isOff={!isMicrophoneOn}
            onPress={handleMicClick}
          />
          <ControlButton
            iconName="comment"
            onPress={toggleChat}
            hasBadge={hasUnread}
          />
          <ControlButton
            iconName="hang-up"
            color={appStyles.colorRed_eb5757}
            onPress={leaveConsultation}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoPill: {
    alignItems: "center",
    backgroundColor: SURFACE_COLOR,
    borderColor: SURFACE_BORDER_COLOR,
    borderRadius: 30,
    borderWidth: 1,
    flexDirection: "row",
    left: 12,
    paddingLeft: 6,
    paddingRight: 8,
    paddingVertical: 6,
    position: "absolute",
    right: 12,
  },
  avatar: {
    borderRadius: 18,
    height: 36,
    width: 36,
  },
  infoText: {
    flex: 1,
    marginHorizontal: 10,
  },
  providerName: {
    color: appStyles.colorWhite_ff,
    fontSize: 15,
  },
  secondaryText: {
    color: TEXT_SECONDARY_COLOR,
  },
  statusChip: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    flexShrink: 0,
    maxWidth: 150,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusText: {
    color: appStyles.colorWhite_ff,
    flexShrink: 1,
    marginLeft: 4,
  },
  dockArea: {
    alignItems: "center",
    left: 0,
    position: "absolute",
    right: DOCK_RIGHT_OFFSET,
  },
  dock: {
    backgroundColor: SURFACE_COLOR,
    borderColor: SURFACE_BORDER_COLOR,
    borderRadius: BUTTON_SIZE / 2 + 6,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 6,
  },
  button: {
    alignItems: "center",
    borderRadius: BUTTON_SIZE / 2,
    height: BUTTON_SIZE,
    justifyContent: "center",
    width: BUTTON_SIZE,
  },
  unread: {
    backgroundColor: appStyles.colorRed_eb5757,
    borderColor: appStyles.colorWhite_ff,
    borderRadius: 6,
    borderWidth: 1.5,
    height: 12,
    position: "absolute",
    right: 4,
    top: 4,
    width: 12,
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
   * Is camera on (single source of truth from parent)
   * */
  isCameraOn: PropTypes.bool.isRequired,

  /**
   * Is microphone on (single source of truth from parent)
   * */
  isMicrophoneOn: PropTypes.bool.isRequired,

  /**
   * Health of the call from both sides: "good" | "poor" | "lost"
   * */
  connectionQuality: PropTypes.oneOf(["good", "poor", "lost"]),

  /**
   * Show camera button (based on joinWithVideo from parent)
   * */
  showCamera: PropTypes.bool,

  /**
   * Whether the video SDK shows its own toolbar at the bottom, the buttons then sit above it
   * */
  isSdkToolbarEnabled: PropTypes.bool,

  /**
   * Safe area insets, so the controls stay clear of the notch and the home indicator
   * */
  topInset: PropTypes.number,
  bottomInset: PropTypes.number,

  /**
   * Translation function
   * */
  t: PropTypes.func.isRequired,
};

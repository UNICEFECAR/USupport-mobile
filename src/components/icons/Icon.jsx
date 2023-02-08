import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View } from "react-native";

import appStyles from "../../styles/appStyles";

import {
  IconFilter,
  IconPhoneEmergency,
  IconComment,
  IconInfo,
  IconFingerprint,
  IconStar,
  IconStarFull,
  IconDocument,
  IconNotification,
  IconNotificationUnread,
  IconShare,
  IconHangUp,
  IconStopCamera,
  IconStopMic,
  IconView,
  IconHide,
  IconArrowChevronUp,
  IconArrowChevronDown,
  IconSearch,
  IconCloseX,
  IconMicrophone,
  IconTag,
  IconHeart,
  IconPerson,
  IconTwoPeople,
  IconThreePeople,
  IconShareBack,
  IconTime,
  IconCart,
  IconBag,
  IconCalendar,
  IconCall,
  IconSchedule,
  IconReadBook,
  IconHome,
  IconTwoHands,
  IconFlash,
  IconBackArrow,
  IconForwardArrow,
  IconArrowChevronBack,
  IconArrowChevronForward,
  IconArrowCaretBack,
  IconArrowCaretForward,
  IconArrowSelect,
  IconArrowDown,
  IconArrowUp,
  IconArrowCaretUp,
  IconArrowCaretDown,
  IconExport,
  IconActionsPlus,
  IconActionsMinus,
  IconCircleActionsSuccess,
  IconCircleActionsClose,
  IconCircleActionsClosePurple,
  IconCircleActionsAlertInfo,
  IconCircleActionsAlertQuestion,
  IconCheck,
  IconMail,
  IconSoundPlaying,
  IconSoundMuted,
  IconGooglePlay,
  IconAppStore,
  IconCommunity,
  IconSelfCare,
  IconTherapy,
  IconCheckBoxCheck,
  IconCopy,
  IconWarning,
  IconExit,
  IconMood,
  IconMailAdmin,
  IconDollar,
  IconVideo,
  IconConsultation,
} from "./assets/sprite";

/**
 * Icon
 *
 * Icon component used to render different icons from the sprite file
 */
export const Icon = ({ name, size = "md", color, style }) => {
  let icon;

  switch (name) {
    case "filter":
      icon = <IconFilter color={color} />;
      break;
    case "phone-emergency":
      icon = <IconPhoneEmergency color={color} />;
      break;
    case "comment":
      icon = <IconComment color={color} />;
      break;
    case "info":
      icon = <IconInfo color={color} />;
      break;
    case "fingerprint":
      icon = <IconFingerprint color={color} />;
      break;
    case "star":
      icon = <IconStar color={color} />;
      break;
    case "star-full":
      icon = <IconStarFull color={color} />;
      break;
    case "document":
      icon = <IconDocument color={color} />;
      break;
    case "notification":
      icon = <IconNotification color={color} />;
      break;
    case "notification-unread":
      icon = <IconNotificationUnread color={color} />;
      break;
    case "share":
      icon = <IconShare color={color} />;
      break;
    case "hang-up":
      icon = <IconHangUp color={color} />;
      break;
    case "stop-camera":
      icon = <IconStopCamera color={color} />;
      break;
    case "stop-mic":
      icon = <IconStopMic color={color} />;
      break;
    case "view":
      icon = <IconView color={color} />;
      break;
    case "hide":
      icon = <IconHide color={color} />;
      break;
    case "arrow-chevron-up":
      icon = <IconArrowChevronUp color={color} />;
      break;
    case "arrow-chevron-down":
      icon = <IconArrowChevronDown color={color} />;
      break;
    case "search":
      icon = <IconSearch color={color} />;
      break;
    case "close-x":
      icon = <IconCloseX color={color} />;
      break;
    case "microphone":
      icon = <IconMicrophone color={color} />;
      break;
    case "tag":
      icon = <IconTag color={color} />;
      break;
    case "heart":
      icon = <IconHeart color={color} />;
      break;
    case "person":
      icon = <IconPerson color={color} />;
      break;
    case "two-people":
      icon = <IconTwoPeople color={color} />;
      break;
    case "three-people":
      icon = <IconThreePeople color={color} />;
      break;
    case "share-back":
      icon = <IconShareBack color={color} />;
      break;
    case "time":
      icon = <IconTime color={color} />;
      break;
    case "cart":
      icon = <IconCart color={color} />;
      break;
    case "bag":
      icon = <IconBag color={color} />;
      break;
    case "calendar":
      icon = <IconCalendar color={color} />;
      break;
    case "call":
      icon = <IconCall color={color} />;
      break;
    case "schedule":
      icon = <IconSchedule color={color} />;
      break;
    case "read-book":
      icon = <IconReadBook color={color} />;
      break;
    case "home":
      icon = <IconHome color={color} />;
      break;
    case "two-hands":
      icon = <IconTwoHands color={color} />;
      break;
    case "flash":
      icon = <IconFlash color={color} />;
      break;
    case "back-arrow":
      icon = <IconBackArrow color={color} />;
      break;
    case "forward-arrow":
      icon = <IconForwardArrow color={color} />;
      break;
    case "arrow-chevron-back":
      icon = <IconArrowChevronBack color={color} />;
      break;
    case "arrow-chevron-forward":
      icon = <IconArrowChevronForward color={color} />;
      break;
    case "arrow-caret-back":
      icon = <IconArrowCaretBack color={color} />;
      break;
    case "arrow-caret-forward":
      icon = <IconArrowCaretForward color={color} />;
      break;
    case "arrow-select":
      icon = <IconArrowSelect color={color} />;
      break;
    case "arrow-down":
      icon = <IconArrowDown color={color} />;
      break;
    case "arrow-up":
      icon = <IconArrowUp color={color} />;
      break;
    case "arrow-caret-up":
      icon = <IconArrowCaretUp color={color} />;
      break;
    case "arrow-caret-down":
      icon = <IconArrowCaretDown color={color} />;
      break;
    case "export":
      icon = <IconExport color={color} />;
      break;
    case "actions-plus":
      icon = <IconActionsPlus color={color} />;
      break;
    case "actions-minus":
      icon = <IconActionsMinus color={color} />;
      break;
    case "circle-actions-success":
      icon = <IconCircleActionsSuccess color={color} />;
      break;
    case "circle-actions-close":
      icon = <IconCircleActionsClose color={color} />;
      break;
    case "circle-actions-close-purple":
      icon = <IconCircleActionsClosePurple color={color} />;
      break;
    case "circle-actions-alert-info":
      icon = <IconCircleActionsAlertInfo color={color} />;
      break;
    case "circle-actions-alert-question":
      icon = <IconCircleActionsAlertQuestion color={color} />;
      break;
    case "check":
      icon = <IconCheck color={color} />;
      break;
    case "mail":
      icon = <IconMail color={color} />;
      break;
    case "sound-playing":
      icon = <IconSoundPlaying color={color} />;
      break;
    case "sound-muted":
      icon = <IconSoundMuted color={color} />;
      break;
    case "google-play":
      icon = <IconGooglePlay />;
      break;
    case "app-store":
      icon = <IconAppStore />;
      break;
    case "community":
      icon = <IconCommunity color={color} />;
      break;
    case "self-care":
      icon = <IconSelfCare color={color} />;
      break;
    case "therapy":
      icon = <IconTherapy color={color} />;
      break;
    case "checkbox-check":
      icon = <IconCheckBoxCheck color={color} />;
      break;
    case "copy":
      icon = <IconCopy color={color} />;
      break;
    case "warning":
      icon = <IconWarning color={color} />;
      break;
    case "exit":
      icon = <IconExit color={color} />;
      break;
    case "mood":
      icon = <IconMood color={color} />;
      break;
    case "mail-admin":
      icon = <IconMailAdmin color={color} />;
      break;
    case "dollar":
      icon = <IconDollar color={color} />;
      break;
    case "video":
      icon = <IconVideo color={color} />;
      break;
    case "consultation":
      icon = <IconConsultation color={color} />;
      break;
    default:
      icon = null;
      break;
  }

  return <View style={[styles[size], style]}>{icon}</View>;
};

const styles = StyleSheet.create({
  // Sizes:
  sm: {
    width: 16,
    height: 16,
  },
  md: {
    width: 24,
    height: 24,
  },
  lg: {
    width: 32,
    height: 32,
  },
  xl: {
    width: 40,
    height: 40,
  },
});

Icon.propTypes = {
  /**
   * The name of the icon to display.
   **/
  name: PropTypes.string.isRequired,

  /**
   * The size of the icon.
   * @default 'md'
   * @type 'sm' | 'md' | 'lg' | 'xl'
   * */
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),

  /**
   * The color of the icon.
   * @default appStyles.colorBlack_37
   **/
  color: PropTypes.string,

  /**
   * Additional styles to apply to the icon.
   **/
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

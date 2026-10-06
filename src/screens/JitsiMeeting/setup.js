// Config and flags for JitsiMeeting

export const baseJitsiConfig = {
  hideConferenceTimer: true,
  disableModeratorIndicator: true, // Ensures no "moderator" role
  enableWelcomePage: false, // Skip welcome screen
  prejoinConfig: { enabled: false }, // Users join instantly
  lobbyMode: { enabled: false }, // Prevent waiting room
  disableInviteFunctions: true, // Prevents requiring moderator approval
  requireDisplayName: false, // Don't require display name
  disableDeepLinking: true, // Disable deep linking
  disableRemoteMute: true, // Disable remote mute
  disableChat: true,
  disableInviteFunctions: true,
  disableShareVideo: true,
  // The provider's name is shown in our controls, and the label would sit behind them
  hideDisplayName: true,
};

export const baseJitsiFlags = {
  "ios.screensharing.enabled": false,
  "fullscreen.enabled": false,
  "android.screensharing.enabled": false,
  "pip.enabled": false,
  "pip-while-screen-sharing.enabled": true,
  "conference-timer.enabled": false,
  "close-captions.enabled": false,
  // "toolbox.enabled" is set in JitsiMeeting, depending on whether the camera starts on
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
  "ios.permissions.enabled": false,
  "android.permissions.enabled": false,
  // The SDK's CallKit wrapper spreads NativeModules.RNCallKit, which drops its
  // methods under the New Architecture and breaks SDK startup on iOS devices
  "call-integration.enabled": false,
};

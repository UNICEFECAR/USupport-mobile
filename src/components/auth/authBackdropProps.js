import React from "react";

import { appStyles } from "#styles";
import { AuthenticationModalsLogo } from "./AuthenticationModalsLogo";

/**
 * Shared Backdrop props for auth modals.
 * Mirrors client-ui's auth backdrop look: blurred overlay, non-dismissible,
 * logo strip header, and content starting directly under the strip.
 */
export function getAuthBackdropProps() {
  return {
    isOpen: true,
    onClose: () => {},
    disableOverlayClose: true,
    overlayVariant: "auth",
    hasHeader: false,
    hasCloseIcon: false,
    topHeaderComponent: <AuthenticationModalsLogo />,
    topHeaderStyles: {
      marginBottom: 0,
    },
    style: {
      height: "auto",
      maxHeight: appStyles.screenHeight * 0.85,
      padding: 0,
    },
    scrollViewStyle: {
      paddingTop: 0,
      paddingHorizontal: 16,
    },
  };
}


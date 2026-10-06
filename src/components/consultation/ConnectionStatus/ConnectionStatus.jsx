import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Animated, StyleSheet, View } from "react-native";

import { AppText } from "../../texts/AppText";
import { appStyles } from "#styles";

// Same colors as the connection icon in the controls
const LOST = {
  backgroundColor: appStyles.colorRed_eb5757,
  color: appStyles.colorWhite_ff,
};
const POOR = {
  backgroundColor: appStyles.colorOrange_fb6514,
  color: appStyles.colorWhite_ff,
};
// White text is hard to read on the green, so it uses dark text
const RESTORED = {
  backgroundColor: appStyles.colorGreen_7ec680,
  color: appStyles.colorBlack_37,
};

// Translation key and colors for every status that shows a notice
const NOTICES = {
  reconnecting: { key: "connection_lost", ...LOST },
  peer_lost: { key: "peer_connection_lost", ...LOST },
  poor: { key: "connection_poor", ...POOR },
  peer_poor: { key: "peer_connection_poor", ...POOR },
  restored: { key: "connection_restored", ...RESTORED },
  peer_restored: { key: "peer_connection_restored", ...RESTORED },
};

const PULSING_STATUSES = ["reconnecting", "peer_lost"];

/**
 * ConnectionStatus
 *
 * Shows a subtle notice when the connection drops or is poor during a consultation,
 * or when the other participant loses connection or has a poor connection
 *
 * @param {"online" | "reconnecting" | "peer_lost" | "poor" | "peer_poor" | "restored" | "peer_restored"} status
 * @param {function} t - translation function of the consultation page
 *
 * @return {jsx}
 */
export const ConnectionStatus = ({ status, style, t }) => {
  const notice = NOTICES[status];
  const isPulsing = PULSING_STATUSES.includes(status);
  const dotOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isPulsing) {
      dotOpacity.setValue(1);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(dotOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isPulsing]);

  if (!notice) return null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: notice.backgroundColor },
        style,
      ]}
      pointerEvents="none"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: notice.color, opacity: dotOpacity },
        ]}
      />
      <AppText isSemibold style={[styles.text, { color: notice.color }]}>
        {t(notice.key)}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 24,
    flexDirection: "row",
    maxWidth: "90%",
    paddingHorizontal: 18,
    paddingVertical: 10,
    ...appStyles.shadow2,
  },
  dot: {
    borderRadius: 5,
    height: 10,
    marginRight: 10,
    width: 10,
  },
  text: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 20,
    textAlign: "center",
  },
});

ConnectionStatus.propTypes = {
  /**
   * Displayed connection status
   */
  status: PropTypes.string.isRequired,

  /**
   * Additional styles
   */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

  /**
   * Translation function of the consultation page
   */
  t: PropTypes.func.isRequired,
};

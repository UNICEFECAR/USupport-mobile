import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet, Platform } from "react-native";

import LinearGradient from "../../LinearGradient";
import { AppText } from "../../texts/AppText";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";
import { getTimeFromDate } from "#utils";
import { DateContainer } from "../SystemMessage/SystemMessage";

const SENT_GRADIENT_LIGHT = {
  degrees: 135,
  locations: [0, 100],
  colors: ["rgba(124, 58, 237, 0.9)", "rgba(167, 139, 250, 0.85)"],
};

const SENT_GRADIENT_DARK = {
  degrees: 135,
  locations: [0, 100],
  colors: ["rgba(124, 58, 237, 0.8)", "rgba(139, 92, 246, 0.65)"],
};

const RECEIVED_GRADIENT_LIGHT = {
  degrees: 135,
  locations: [0, 100],
  colors: ["rgba(245, 243, 255, 0.9)", "rgba(237, 233, 254, 0.85)"],
};

const RECEIVED_GRADIENT_DARK = {
  degrees: 135,
  locations: [0, 100],
  colors: ["rgba(76, 61, 102, 0.7)", "rgba(88, 72, 117, 0.55)"],
};

export const Message = ({
  message,
  sent = false,
  received = false,
  date,
  style,
  showDate,
}) => {
  const { isDarkMode } = useGetTheme();

  const gradient = sent
    ? isDarkMode
      ? SENT_GRADIENT_DARK
      : SENT_GRADIENT_LIGHT
    : isDarkMode
      ? RECEIVED_GRADIENT_DARK
      : RECEIVED_GRADIENT_LIGHT;

  const borderStyle = sent
    ? isDarkMode
      ? { borderColor: "rgba(167, 139, 250, 0.35)" }
      : { borderColor: "rgba(167, 139, 250, 0.5)" }
    : isDarkMode
      ? { borderColor: "rgba(139, 92, 246, 0.25)" }
      : { borderColor: "rgba(196, 181, 253, 0.4)" };

  const shadowStyle = sent
    ? isDarkMode
      ? {
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 6,
        }
      : {
          shadowColor: "rgba(124, 58, 237, 0.35)",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.45,
          shadowRadius: 12,
          elevation: 5,
        }
    : isDarkMode
      ? {
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 4,
        }
      : {
          shadowColor: "rgba(124, 58, 237, 0.12)",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 3,
        };

  const radiusStyle = sent ? styles.radiusSent : styles.radiusReceived;

  const textColor = sent
    ? "#ffffff"
    : isDarkMode
      ? "rgba(255, 255, 255, 0.92)"
      : appStyles.colorBlack_37;

  const dateColor = sent
    ? "rgba(255, 255, 255, 0.8)"
    : isDarkMode
      ? "rgba(196, 181, 253, 0.7)"
      : "rgba(107, 79, 163, 0.7)";

  return (
    <React.Fragment>
      {showDate ? <DateContainer date={date} /> : null}
      <View
        style={[
          styles.outer,
          sent && styles.outerSent,
          received && styles.outerReceived,
          shadowStyle,
          style,
        ]}
      >
        <LinearGradient
          gradient={gradient}
          style={[styles.bubble, radiusStyle, borderStyle]}
        >
          <AppText style={[styles.bodyText, { color: textColor }]}>
            {message}
          </AppText>
          {date ? (
            <AppText style={[styles.dateText, { color: dateColor }]}>
              {getTimeFromDate(date)}
            </AppText>
          ) : null}
        </LinearGradient>
      </View>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  outer: {
    maxWidth: "85%",
    width: "auto",
    marginBottom: 12,
  },
  outerSent: {
    alignSelf: "flex-end",
  },
  outerReceived: {
    alignSelf: "flex-start",
  },
  bubble: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        borderCurve: "continuous",
      },
      default: {},
    }),
  },
  radiusSent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 16,
  },
  radiusReceived: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 4,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: appStyles.fontRegular,
    flexShrink: 1,
  },
  dateText: {
    fontSize: 11,
    lineHeight: 14,
    marginTop: 4,
    textAlign: "right",
    alignSelf: "flex-end",
    fontFamily: appStyles.fontRegular,
    opacity: 0.95,
  },
});

Message.propTypes = {
  message: PropTypes.string,
  sent: PropTypes.bool,
  received: PropTypes.bool,
  date: PropTypes.instanceOf(Date),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  showDate: PropTypes.bool,
};

Message.defaultProps = {
  sent: false,
  received: false,
  showDate: false,
};

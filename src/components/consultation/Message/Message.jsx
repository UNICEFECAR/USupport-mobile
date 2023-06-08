import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet } from "react-native";

import { AppText } from "../../texts/AppText";
import { appStyles } from "#styles";
import { getDateView, getTimeFromDate } from "#utils";

export const Message = ({
  message,
  sent = false,
  received = false,
  date,
  style,
}) => {
  return (
    <View
      style={[
        styles.message,
        sent && styles.messageSent,
        received && styles.messageReceived,
        style,
      ]}
    >
      <AppText style={styles.text}>{message}</AppText>
      <AppText style={styles.smallText}>
        {getDateView(date)},{getTimeFromDate(date)}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  message: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "85%",
    maxWidth: 280,
    borderRadius: 24,
    marginBottom: 12,
  },
  messageSent: {
    backgroundColor: appStyles.colorGreen_54cfd9,
    alignSelf: "flex-end",
  },
  messageReceived: {
    backgroundColor: appStyles.colorGreen_e6f1f4,
    alignSelf: "flex-start",
  },
  text: { color: appStyles.colorBlack_37 },
});

Message.propTypes = {
  /**
   * Message to display
   */
  message: PropTypes.string,

  /**
   * Is the message sent by the user
   * @default false
   */
  sent: PropTypes.bool,

  /**
   * Is the message received by the user
   * @default false
   */
  received: PropTypes.bool,

  /**
   * Additional styles to apply to the message
   */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

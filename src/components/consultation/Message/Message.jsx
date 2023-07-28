import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet } from "react-native";

import { AppText } from "../../texts/AppText";
import { appStyles } from "#styles";
import { getTimeAsString } from "#utils";
import { DateContainer } from "../SystemMessage/SystemMessage";

export const Message = ({
  message,
  sent = false,
  received = false,
  date,
  style,
  showDate,
}) => {
  return (
    <React.Fragment>
      <View
        style={[
          styles.message,
          sent && styles.messageSent,
          received && styles.messageReceived,
          style,
        ]}
      >
        <AppText style={styles.text}>{message}</AppText>
        <View style={styles.timeTextContainer}>
          <AppText namedStyle="smallText" style={styles.smallText}>
            {getTimeAsString(date)}
          </AppText>
        </View>
      </View>
      {showDate ? <DateContainer date={date} /> : null}
    </React.Fragment>
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
    flexDirection: "row",
    alignItems: "center",
  },
  messageSent: {
    backgroundColor: appStyles.colorGreen_54cfd9,
    alignSelf: "flex-end",
  },
  messageReceived: {
    backgroundColor: appStyles.colorGreen_e6f1f4,
    alignSelf: "flex-start",
  },
  text: {
    color: appStyles.colorBlack_37,
    alignSelf: "flex-end",
  },
  timeTextContainer: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    width: "auto",
    marginTop: "auto",
    marginLeft: "auto",
  },
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

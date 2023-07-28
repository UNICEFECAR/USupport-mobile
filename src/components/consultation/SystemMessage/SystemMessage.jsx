import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet } from "react-native";

import { AppText } from "../../texts";
import { Icon } from "../../icons";
import { appStyles } from "#styles";
import { getTimeAsString, getDateView } from "#utils";

export const SystemMessage = ({
  iconName = "consultation",
  title,
  date,
  style,
  showDate,
}) => {
  return (
    <React.Fragment>
      <View style={[styles.container, style]}>
        <View style={{ width: "10%" }}>
          <Icon
            name={iconName}
            size="md"
            color={appStyles.colorPrimary_20809e}
          />
        </View>
        <AppText namedStyle="smallText" style={styles.title}>
          {title}
        </AppText>
        <View style={styles.timeTextContainer}>
          <AppText
            style={{
              alignSelf: "flex-end",
              paddingLeft: 16,
            }}
            namedStyle="smallText"
          >
            {getTimeAsString(date)}
          </AppText>
        </View>
      </View>
      {showDate ? <DateContainer date={date} /> : null}
    </React.Fragment>
  );
};

export const DateContainer = ({ date }) => {
  return (
    <View style={styles.dateContainer}>
      <AppText isBold namedStyle="smallText">
        {getDateView(date)}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    alignSelf: "center",
    borderColor: appStyles.colorPrimary_20809e,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 12,
    maxWidth: 280,
    paddingHorizontal: 18,
    paddingVertical: 12,
    textAlign: "left",
    width: "85%",
  },
  title: {
    color: appStyles.colorPrimary_20809e,
    fontFamily: appStyles.fontBold,
    width: 250,
    marginLeft: 16,
  },
  timeTextContainer: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    marginTop: "auto",
  },
  textContainer: { marginLeft: 16 },
  dateContainer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: appStyles.colorGreen_f4f7fe,
    marginLeft: 0,
    marginRight: 0,
    width: "auto",
    alignSelf: "center",
    borderRadius: 16,
    marginBottom: 12,
  },
});

SystemMessage.propTypes = {
  /**
   * Icon name
   * @default "consultation"
   */
  iconName: PropTypes.string,

  /**
   * Title
   */
  title: PropTypes.string,

  /**
   * Date of the message
   */
  date: PropTypes.instanceOf(Date),

  /**
   * Style
   */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

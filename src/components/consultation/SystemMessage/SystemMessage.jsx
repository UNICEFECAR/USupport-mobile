import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet, Platform } from "react-native";

import { AppText } from "../../texts";
import { Icon } from "../../icons";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";
import { getTimeAsString, getDateView } from "#utils";

export const SystemMessage = ({
  iconName = "consultation",
  title,
  date,
  style,
  showDate,
}) => {
  const { isDarkMode } = useGetTheme();
  const iconColor = isDarkMode ? "#C4B5FD" : "#7C3AED";

  const surfaceStyle = isDarkMode
    ? {
        backgroundColor: "rgba(76, 61, 102, 0.55)",
        borderColor: "rgba(139, 92, 246, 0.25)",
      }
    : {
        backgroundColor: "rgba(245, 243, 255, 0.9)",
        borderColor: "rgba(196, 181, 253, 0.4)",
      };

  const shadowStyle = isDarkMode
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

  const titleColor = isDarkMode
    ? "rgba(237, 233, 254, 0.92)"
    : "rgba(107, 79, 163, 0.95)";

  const timeColor = isDarkMode
    ? "rgba(196, 181, 253, 0.75)"
    : "rgba(107, 79, 163, 0.7)";

  return (
    <React.Fragment>
      {showDate ? <DateContainer date={date} /> : null}
      <View style={[styles.pill, surfaceStyle, shadowStyle, style]}>
        <View style={styles.iconWrap}>
          <Icon name={iconName} size="sm" color={iconColor} />
        </View>
        <View style={styles.textCol}>
          <AppText
            style={[styles.title, { color: titleColor }]}
            numberOfLines={6}
          >
            {title}
          </AppText>
        </View>
        {date ? (
          <AppText style={[styles.time, { color: timeColor }]}>
            {getTimeAsString(date)}
          </AppText>
        ) : null}
      </View>
    </React.Fragment>
  );
};

export const DateContainer = ({ date }) => {
  const { isDarkMode } = useGetTheme();

  const surfaceStyle = isDarkMode
    ? {
        backgroundColor: "rgba(76, 61, 102, 0.5)",
        borderColor: "rgba(139, 92, 246, 0.25)",
      }
    : {
        backgroundColor: "rgba(245, 243, 255, 0.85)",
        borderColor: "rgba(196, 181, 253, 0.35)",
      };

  const textColor = isDarkMode
    ? "rgba(196, 181, 253, 0.8)"
    : "rgba(107, 79, 163, 0.8)";

  return (
    <View style={[styles.datePill, surfaceStyle]}>
      <AppText isBold namedStyle="smallText" style={{ color: textColor }}>
        {getDateView(date)}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    maxWidth: "92%",
    width: "auto",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9999,
    borderWidth: 1,
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        borderCurve: "continuous",
      },
      default: {},
    }),
  },
  iconWrap: {
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  textCol: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: appStyles.fontSemiBold,
    margin: 0,
  },
  time: {
    fontSize: 11,
    lineHeight: 14,
    flexShrink: 0,
    fontFamily: appStyles.fontRegular,
    margin: 0,
  },
  datePill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "center",
    marginVertical: 16,
    maxWidth: "92%",
    borderWidth: 1,
    ...Platform.select({
      ios: {
        borderCurve: "continuous",
      },
      default: {},
    }),
  },
});

SystemMessage.propTypes = {
  iconName: PropTypes.string,
  title: PropTypes.string,
  date: PropTypes.instanceOf(Date),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  showDate: PropTypes.bool,
};

SystemMessage.defaultProps = {
  iconName: "consultation",
  showDate: false,
};

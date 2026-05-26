import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import { Icon } from "../../icons";
import { AppText } from "../../texts";
import { appStyles } from "#styles";
import { getTimeFromDate, isDateToday, isDateYesterday } from "#utils";
import { useGetTheme } from "#hooks";

export const Notification = ({
  icon,
  title,
  text,
  isRead = false,
  date = new Date(),
  children,
  handleClick,
  t,
}) => {
  const { isDarkMode } = useGetTheme();
  const isYesterday = isDateYesterday(date);

  const dateText = isDateToday(date)
    ? ""
    : isYesterday
      ? t("yesterday")
      : date.toLocaleDateString();

  const hourText = getTimeFromDate(date);

  return (
    <TouchableOpacity onPress={handleClick}>
      <View
        style={[
          styles.container,
          !isRead && styles.containerNew,
          !isRead && isDarkMode && styles.containerNewDark,
        ]}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Icon
              name={icon}
              color={appStyles.colorSecondary_9749fa}
              size="md"
            />
          </View>
          <View style={styles.informationContainer}>
            <View style={styles.heading}>
              <View style={styles.nameContainer}>
                <AppText className="small-text" style={styles.nameText}>
                  {title}
                </AppText>
                {isRead ? null : <View style={styles.emptyContainer} />}
              </View>
              <AppText namedStyle="smallText">
                {dateText} {hourText}
              </AppText>
            </View>
            <AppText namedStyle="smallText" style={styles.descriptionText}>
              {text}
            </AppText>
          </View>
        </View>
        {children}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 16,
    marginBottom: 8,
    borderRadius: 13,
    overflow: "hidden",
  },
  containerNew: { backgroundColor: appStyles.colorGreen_e6f1f4 },
  containerNewDark: { backgroundColor: appStyles.colorBlue_20809E_0_3 },
  content: { flexDirection: "row", alignItems: "center" },
  iconContainer: { marginRight: 16 },
  informationContainer: { flex: 1, minWidth: 0 },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameText: {
    color: appStyles.colorSecondary_9749fa,
    fontFamily: appStyles.fontBold,
    marginRight: 4,
  },
  emptyContainer: {
    width: 9,
    height: 9,
    backgroundColor: appStyles.colorSecondary_9749fa,
    borderRadius: 16,
  },
  descriptionText: { maxWidth: "80%", marginTop: 4, textAlign: "left" },
});

Notification.propTypes = {
  /**
   * Icon name
   */
  icon: PropTypes.string,

  /**
   * Title
   * */
  title: PropTypes.string,

  /**
   *  Text
   **/
  text: PropTypes.object,

  /**
   * Read status
   * */
  isRead: PropTypes.bool,

  /**
   * Date
   * */
  date: PropTypes.instanceOf(Date),

  /**
   * Additional classes
   * */
  classes: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
};

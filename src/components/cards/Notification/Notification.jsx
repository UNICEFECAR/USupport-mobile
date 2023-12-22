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
          !isRead && isDarkMode && { backgroundColor: appStyles.colorBlack_1e },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Icon
              name={icon}
              color={isRead ? appStyles.colorGray_66768d : "#9749FA"}
              size="md"
            />
          </View>
          <View style={styles.informationContainer}>
            <View style={styles.heading}>
              <View style={styles.nameContainer}>
                <AppText
                  className="small-text"
                  style={[
                    styles.nameText,
                    isRead && { color: appStyles.colorGray_66768d },
                  ]}
                >
                  {title}
                </AppText>
                {isRead ? null : <View style={styles.emptyContainer} />}
              </View>
              <AppText namedStyle="smallText">
                {dateText} {isDateToday(date) && hourText}
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
    marginTop: 8,
  },
  containerNew: { backgroundColor: appStyles.colorGreen_e6f1f4 },
  content: { flexDirection: "row", alignItems: "center" },
  iconContainer: { marginRight: 16 },
  informationContainer: { width: "92%" },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "95%",
  },
  nameContainer: {
    display: "flex",
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
  descriptionText: { maxWidth: "75%", marginTop: 4 },
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

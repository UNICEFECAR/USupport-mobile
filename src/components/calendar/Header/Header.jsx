import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { StyleSheet, View, TouchableOpacity, Touchable } from "react-native";

import { Icon } from "../../icons/Icon";
import { AppText } from "../../texts/AppText/AppText";
import { appStyles } from "#styles";
import { getDatesInRange, getStartAndEndOfWeek } from "#utils";

/**
 * Header
 *
 * Calendar Header component
 *
 * @return {jsx}
 */
export const Header = ({ handleDayChange, startDate, style }) => {
  const currentDay = new Date();
  const [today, setToday] = useState(
    startDate ? new Date(startDate) : new Date()
  );

  const [canChangeWeekBackwards, setCanChangeWeekBackwards] = useState(false);
  const [selectedDay, setSelectedDay] = useState(today);
  const [startOfWeek, setStartOfWeek] = useState();
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [hasCalledHandleDayChange, setHasCalledHandleDayChange] =
    useState(false);

  useEffect(() => {
    if (startDate) {
      setToday(new Date(startDate));
      setSelectedDay(new Date(startDate));
    }
  }, [startDate]);

  useEffect(() => {
    const { first, last } = getStartAndEndOfWeek(today);
    const isCurrentWeek = currentDay.getTime() > first.getTime();
    setCanChangeWeekBackwards(!isCurrentWeek);
    setDaysOfWeek(getDatesInRange(first, last));
    setStartOfWeek(first);
    if (first && selectedDay && !hasCalledHandleDayChange) {
      handleDayChange(first, selectedDay);
      setHasCalledHandleDayChange(true);
    }
  }, [today]);

  useEffect(() => {
    if (startOfWeek && selectedDay) {
      handleDayChange(startOfWeek, selectedDay);
    }
  }, [selectedDay]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const handleSelectDay = (day) => {
    setSelectedDay(day);
  };

  const renderDaysOfWeek = () => {
    return daysOfWeek.map((day, index) => {
      const isToday = day.toDateString() === selectedDay.toDateString();
      return (
        <TouchableOpacity onPress={() => handleSelectDay(day)} key={index}>
          <View style={[styles.dayOfWeek, isToday && styles.selectedToday]}>
            <AppText style={styles.dayLabelText}>
              {weekDays[day.getDay()]}
            </AppText>
            <AppText
              namedStyle="smallText"
              style={[
                styles.dateText,
                (index === 6 || index === 5) && styles.dateTextWeekend,
              ]}
            >
              {day.getDate()}
            </AppText>
          </View>
        </TouchableOpacity>
      );
    });
  };

  const handleMonthChange = (direction) => {
    const newMonth = new Date(today);
    newMonth.setMonth(newMonth.getMonth() + direction);
    newMonth.setDate(1);
    setToday(newMonth);
  };

  const handleWeekChange = (direction) => {
    const newWeek = new Date(today);
    newWeek.setDate(newWeek.getDate() + direction * 7);
    setToday(newWeek);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.monthSelector}>
        <TouchableOpacity
          onPress={() => {
            if (canChangeWeekBackwards) {
              handleMonthChange(-1);
            }
          }}
        >
          <Icon
            size="md"
            name="arrow-chevron-back"
            color={appStyles.colorBlack_37}
          />
        </TouchableOpacity>
        <AppText>{months[today.getMonth()]}</AppText>
        <TouchableOpacity onPress={() => handleMonthChange(1)}>
          <Icon
            size="md"
            name="arrow-chevron-forward"
            color={appStyles.colorBlack_37}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.weekSelector}>
        <TouchableOpacity
          onPress={() => {
            if (canChangeWeekBackwards) {
              handleWeekChange(-1);
            }
          }}
        >
          <Icon
            size="md"
            name="arrow-chevron-back"
            color={appStyles.colorBlack_37}
          />
        </TouchableOpacity>
        {renderDaysOfWeek()}
        <TouchableOpacity onPress={() => handleWeekChange(1)}>
          <Icon
            size="md"
            name="arrow-chevron-forward"
            color={appStyles.colorBlack_37}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
  },
  monthSelector: {
    width: 240,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 28,
    color: appStyles.colorBlack_37,
  },
  weekSelector: {
    width: "100%",
    maxWidth: 420,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayOfWeek: {
    width: (appStyles.screenWidth - 32) / 9,
    alignItems: "center",
  },
  selectedToday: {
    borderRadius: 8,
    backgroundColor: appStyles.colorGreen_c1eaea,
  },
  dayLabelText: { color: appStyles.colorBlack_37 },
  dateText: { color: appStyles.colorBlack_37 },
  dateTextWeekend: { color: appStyles.colorGray_92989b },
});

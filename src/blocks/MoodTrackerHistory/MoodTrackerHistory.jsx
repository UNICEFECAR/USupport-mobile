import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, TouchableOpacity } from "react-native";

import { Block, Icon, AppText, Emoticon, Loading } from "#components";

import { appStyles } from "#styles";

import {
  getStartAndEndOfWeek,
  getDatesInRange,
  isDateToday,
  getDateView,
  getTimestampFromUTC,
} from "#utils";

import { useGetMoodTrackForWeek } from "#hooks";
import { MoodTrackerMoreInformation } from "#modals";

const namesOfDays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/**
 * MoodTrackHistory
 *
 * Mood track history block
 *
 * @return {jsx}
 */
export const MoodTrackerHistory = () => {
  const { t } = useTranslation("mood-tracker-history");

  const today = new Date();

  const emoticons = [
    {
      value: "happy",
      label: t("happy"),
      numericalValue: 4,
      isSelected: false,
    },
    {
      value: "good",
      label: t("good"),
      numericalValue: 3,
      isSelected: false,
    },
    {
      value: "sad",
      label: t("sad"),
      numericalValue: 2,
      isSelected: false,
    },
    {
      value: "depressed",
      label: t("depressed"),
      numericalValue: 1,
      isSelected: false,
    },
    {
      value: "worried",
      label: t("worried"),
      numericalValue: 0,
      isSelected: false,
    },
  ];

  const { first: startDate, last: endDate } = getStartAndEndOfWeek(today);
  const [weekStartDate, setWeekStartDate] = useState(startDate);
  const [weekEndDate, setWeekEndDate] = useState(endDate);

  const [overallMood, setOverallMood] = useState();

  const [selectedMoodTrack, setSelectedMoodTrack] = useState();
  const [isMoreInformationModalOpen, setIsMoreInformationModalOpen] =
    useState(false);

  const moodTrackForWeekQuery = useGetMoodTrackForWeek(
    getTimestampFromUTC(weekStartDate)
  );
  const days = getDatesInRange(new Date(startDate), new Date(endDate));
  const [weekDays, setWeekDays] = useState(days);

  useEffect(() => {
    if (moodTrackForWeekQuery.data && weekDays) {
      const moodTracks = moodTrackForWeekQuery.data;
      const weekDaysStrings = weekDays.map((x) => x.toDateString());
      const weekMoods = moodTracks.filter((moodTrack) => {
        return weekDaysStrings.includes(moodTrack.time.toDateString());
      });
      const feelingOccurances = {};

      weekMoods.forEach((mood) => {
        if (!feelingOccurances[mood.mood]) {
          feelingOccurances[mood.mood] = 1;
        } else {
          feelingOccurances[mood.mood] += 1;
        }
      });

      const highestValue = Math.max(...Object.values(feelingOccurances));
      const highestValueOccurance = Object.values(feelingOccurances).filter(
        (x) => x === highestValue
      ).length;

      if (highestValueOccurance === 1) {
        const mostFrequentFeeling = Object.keys(feelingOccurances).find(
          (key) => feelingOccurances[key] === highestValue
        );
        const mostFrequentFeelingEmoticon = emoticons.find(
          (x) => x.value === mostFrequentFeeling
        );
        setOverallMood(mostFrequentFeelingEmoticon);
        return;
      } else {
        setOverallMood(null);
      }
    }
  }, [moodTrackForWeekQuery.data, weekDays]);

  const handleWeekChange = (direction) => {
    if (direction === "next") {
      const nextWeek = getStartAndEndOfWeek(
        new Date(weekEndDate.getTime() + 24 * 60 * 60 * 1000)
      );
      setWeekStartDate(nextWeek.first);
      setWeekEndDate(nextWeek.last);
      setWeekDays(getDatesInRange(nextWeek.first, nextWeek.last));
    } else {
      const prevWeek = getStartAndEndOfWeek(
        new Date(weekStartDate.getTime() - 24 * 60 * 60 * 1000)
      );
      setWeekStartDate(prevWeek.first);
      setWeekEndDate(prevWeek.last);
      setWeekDays(getDatesInRange(prevWeek.first, prevWeek.last));
    }
  };

  const handleMoodTrackClick = (day, emoticon) => {
    const moodTrack = moodTrackForWeekQuery.data?.find(
      (x) =>
        x.time.toDateString() === day.toDateString() &&
        x.mood === emoticon.value
    );
    setSelectedMoodTrack(moodTrack);
    setIsMoreInformationModalOpen(true);
  };

  const checkDayMood = (day) => {
    const dayMood = moodTrackForWeekQuery.data?.find(
      (mood) => mood.time.toDateString() === day.toDateString()
    );

    if (dayMood) {
      return dayMood;
    }
    return null;
  };

  return (
    <>
      <Block>
        <Heading
          handleWeekChange={handleWeekChange}
          startDate={weekStartDate}
          endDate={weekEndDate}
          t={t}
        />
        {overallMood && (
          <OverallMood overallMood={overallMood} emoticons={emoticons} t={t} />
        )}
      </Block>
      <Block style={styles.calendarBlock}>
        {moodTrackForWeekQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <Loading />
          </View>
        ) : (
          <>
            <View style={styles.daysContainer}>
              {emoticons.map((emoticon) => {
                return (
                  <React.Fragment key={"week" + emoticon.value}>
                    <View style={[styles.box]}>
                      {emoticon.value === "happy" && (
                        <View style={[styles.box]} />
                      )}
                      <View style={[styles.box, styles.emoticonContainer]}>
                        <Emoticon name={`${emoticon.value}`} size={"xs"} />
                      </View>
                    </View>
                    {weekDays.map((day, weekDayIndex) => {
                      const isToday = isDateToday(day);
                      const date = getDateView(day);
                      const displayDate = date.slice(0, -3);

                      const moodForDay = checkDayMood(day);
                      const hasDoneMoodForDay =
                        moodForDay && moodForDay.mood === emoticon.value;

                      return (
                        <React.Fragment key={weekDayIndex}>
                          <View key={"single-day" + day} style={styles.box}>
                            {emoticon.value === "happy" ? (
                              <View style={[styles.box, styles.dayOfWeek]}>
                                <AppText
                                  namedStyle="smallText"
                                  underlined
                                  style={isToday && styles.textColorPrimary}
                                >
                                  {t(namesOfDays[day.getDay()])}
                                </AppText>
                                <AppText
                                  namedStyle="smallText"
                                  style={isToday && styles.textColorPrimary}
                                >
                                  {displayDate}
                                </AppText>
                              </View>
                            ) : null}
                            <TouchableOpacity
                              onPress={() => {
                                if (hasDoneMoodForDay) {
                                  handleMoodTrackClick(day, emoticon);
                                }
                              }}
                            >
                              <View
                                style={[
                                  styles.box,
                                  styles.singleDay,
                                  hasDoneMoodForDay &&
                                    styles.singleDayAvailable,
                                ]}
                              >
                                {hasDoneMoodForDay && (
                                  <Icon name="info" color="#20809e" size="md" />
                                )}
                              </View>
                            </TouchableOpacity>
                          </View>
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </View>
          </>
        )}
      </Block>
      {isMoreInformationModalOpen && selectedMoodTrack && (
        <MoodTrackerMoreInformation
          isOpen={isMoreInformationModalOpen}
          onClose={() => {
            setIsMoreInformationModalOpen(false);
            setSelectedMoodTrack(null);
          }}
          moodTrack={selectedMoodTrack}
          emoticons={emoticons}
        />
      )}
    </>
  );
};

const Heading = ({ handleWeekChange, startDate, endDate, t }) => {
  return (
    <View>
      <ChangeWeek
        startDate={startDate}
        endDate={endDate}
        handleWeekChange={handleWeekChange}
      />
    </View>
  );
};

const ChangeWeek = ({ startDate, endDate, handleWeekChange }) => {
  return (
    <View style={styles.changeWeek}>
      <TouchableOpacity onPress={() => handleWeekChange("previous")}>
        <Icon
          color={appStyles.colorSecondary_9749fa}
          name="arrow-chevron-back"
          size="lg"
        />
      </TouchableOpacity>
      <View>
        <AppText style={styles.changeWeekText}>
          {getDateView(startDate)} - {getDateView(endDate)}
        </AppText>
      </View>
      <TouchableOpacity onPress={() => handleWeekChange("next")}>
        <Icon
          color={appStyles.colorSecondary_9749fa}
          name="arrow-chevron-forward"
          size={"lg"}
        />
      </TouchableOpacity>
    </View>
  );
};

const OverallMood = ({ overallMood, emoticons, t }) => {
  return (
    <View style={styles.overallModd}>
      <AppText style={styles.overallMoodLabel}>{t("overall_mood")}</AppText>

      <View style={styles.emoticonsContainer}>
        {emoticons.map((emoticon) => {
          return (
            <View
              key={"overall" + emoticon.value}
              style={[
                styles.singleEmoticonContainer,
                emoticon.value !== overallMood?.value &&
                  styles.singleEmoticonContainerUnavailable,
              ]}
            >
              <Emoticon
                name={`${emoticon.value}`}
                size={emoticon.value === overallMood?.value ? "lg" : "sm"}
              />
              <AppText>{t(emoticon.label)}</AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarBlock: { paddingVertical: 32 },
  changeWeek: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 24,
  },
  changeWeekText: {
    color: appStyles.colorSecondary_9749fa,
    marginHorizontal: 16,
  },
  overallModd: {
    marginTop: 20,
    flexDirection: "column",
    justifyContent: "center",
  },
  overallMoodLabel: {
    textAlign: "left",
    marginBottom: 16,
    alignSelf: "center",
  },
  emoticonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  singleEmoticonContainer: { alignItems: "center" },
  singleEmoticonContainerUnavailable: { opacity: 0.5 },
  box: {
    width: appStyles.screenWidth / 9,
    minHeight: appStyles.screenWidth / 9,
    alignContent: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  daysContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    flexWrap: "wrap",
  },
  singleDay: {
    alignItems: "center",
    backgroundColor: appStyles.colorGray_ea,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "transparent",
    color: appStyles.colorPrimary_20809e,
    ...appStyles.shadow1,
    elevation: 2,
  },
  singleDayAvailable: { backgroundColor: appStyles.colorGreen_c1eaea },
  dayOfWeek: {
    alignItems: "center",
  },
  textColorPrimary: { color: appStyles.colorPrimary_20809e },
  loadingContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  emoticonContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});

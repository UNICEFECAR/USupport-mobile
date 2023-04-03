import React, { useState, useMemo } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

import {
  Block,
  Emoticon,
  Icon,
  AppText,
  Loading,
  MoodTrackLineChart,
  MoodTrackDetails,
} from "#components";
import { useGetMoodTrackEntries } from "#hooks";

/**
 * MoodTrackerHistory
 *
 * MoodTrackerHistory block
 *
 * @return {JSX.Element}
 */
export const MoodTrackHistory = ({}) => {
  const { t } = useTranslation("mood-track-history");
  const [pageNum, setPageNum] = useState(0);
  const limit = `pageNum_${pageNum}_limitToLoad_5`;

  const [loadedPages, setLoadedPages] = useState([]);
  const [moodTrackerData, setMoodTrackerData] = useState({});
  const [selectedItemId, setSelectedItemId] = React.useState(null);
  const limitToLoad = 5;

  const onSuccess = (data) => {
    const { curEntries, prevEntries, hasMore } = data;

    let dataCopy = { ...moodTrackerData };

    if (!dataCopy[limit]) {
      dataCopy[limit] = {
        entries: curEntries,
        hasMore: prevEntries.length > 0,
      };
    }
    const prevPageLimit = `pageNum_${pageNum + 1}_limitToLoad_${limitToLoad}`;

    if (prevEntries.length < limitToLoad) {
      prevEntries.push(
        ...curEntries.slice(0, limitToLoad - prevEntries.length)
      );
    }

    dataCopy[prevPageLimit] = { entries: prevEntries, hasMore };
    let loadedPagesCopy = [...loadedPages];
    loadedPagesCopy.push(pageNum);
    setLoadedPages(loadedPagesCopy);

    setMoodTrackerData(dataCopy);
  };

  const enabled = useMemo(() => {
    return !loadedPages.includes(pageNum);
  }, [loadedPages, pageNum]);

  const moodTrackEntriesQuery = useGetMoodTrackEntries(
    pageNum,
    onSuccess,
    enabled
  );

  const emoticons = [
    { name: "happy", label: "Perfect", value: 4 },
    { name: "good", label: "Happy", value: 3 },
    { name: "sad", label: "Sad", value: 2 },
    { name: "depressed", label: "Depressed", value: 1 },
    { name: "worried", label: "Worried", value: 0 },
  ];

  const renderEmoticons = () => {
    return emoticons.map((emoticon, index) => {
      return <Emoticon name={emoticon.name} key={index} size="xs" />;
    });
  };

  const renderDates = () => {
    return moodTrackerData[limit]?.entries.map((mood, index) => {
      const dateText = `${
        mood.time.getDate() > 9
          ? mood.time.getDate()
          : `0${mood.time.getDate()}`
      }.${
        mood.time.getMonth() + 1 > 9
          ? mood.time.getMonth() + 1
          : `0${mood.time.getMonth() + 1}`
      }`;
      const timeText = `${mood.time.getHours()}:${
        mood.time.getMinutes() > 9
          ? mood.time.getMinutes()
          : `0${mood.time.getMinutes()}`
      }`;

      return (
        <View key={index}>
          <AppText namedStyle="small-text">{dateText}</AppText>
          <AppText namedStyle="small-text">{timeText}</AppText>
        </View>
      );
    });
  };

  const handlePageChange = (next = false) => {
    setPageNum((prev) => (next ? prev + 1 : prev - 1));
  };

  const handleMoodClick = (index) => {
    setSelectedItemId(moodTrackerData[limit].entries[index].mood_tracker_id);
  };

  return (
    <Block style={styles.block}>
      {!moodTrackerData[limit] ? (
        <Loading />
      ) : (
        <>
          <View style={styles.chartContainer}>
            <View style={styles.emoticonsContainer}>
              <View
                style={[
                  styles.loadPreviusContainer,
                  !moodTrackerData[limit].hasMore && styles.disabled,
                ]}
              >
                <TouchableOpacity
                  onPress={() =>
                    moodTrackerData[limit].hasMore ? handlePageChange(true) : {}
                  }
                  disabled={!moodTrackerData[limit].hasMore}
                >
                  <Icon name="arrow-chevron-back" size="sm" color="#20809E" />
                </TouchableOpacity>
              </View>
              {renderEmoticons()}
            </View>
            <View style={styles.lineChartContainer}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                {renderDates()}
                <View
                  style={[
                    styles.loadNextContainer,
                    pageNum === 0 && styles.disabled,
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => (pageNum === 0 ? {} : handlePageChange())}
                    disabled={pageNum === 0}
                  >
                    <Icon
                      name="arrow-chevron-forward"
                      size="sm"
                      color="#20809E"
                      style={{ marginRight: 16 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <MoodTrackLineChart
                data={moodTrackerData[limit]?.entries || []}
                handleSelectItem={handleMoodClick}
                selectedItemId={selectedItemId}
              />
            </View>
          </View>
          {moodTrackerData[limit]?.entries.find(
            (x) => x.mood_tracker_id === selectedItemId
          ) ? (
            <MoodTrackDetails
              mood={moodTrackerData[limit]?.entries.find(
                (x) => x.mood_tracker_id === selectedItemId
              )}
              handleClose={() => setSelectedItemId(null)}
              t={t}
            />
          ) : null}
        </>
      )}
    </Block>
  );
};

const styles = StyleSheet.create({
  block: {
    paddingBottom: 40,
  },
  chartContainer: {
    marginTop: 20,
    flexDirection: "row",
  },
  emoticonsContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    height: 240,
  },
  lineChartContainer: {
    flexDirection: "column",
  },
  datesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 6,
    width: "92%",
  },
  loadPreviusContainer: {
    height: 40,
    width: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.4,
  },
  loadNextContainer: {
    height: 40,
    justifyContent: "center",
  },
  icon: { marginRight: 16 },
});

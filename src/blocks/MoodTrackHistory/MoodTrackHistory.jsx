import React, { useState, useMemo, useContext } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

import {
  AppText,
  Block,
  Emoticon,
  Icon,
  Loading,
  MoodTrackLineChart,
  MoodTrackDetails,
  CardMedia,
} from "#components";
import {
  useGetMoodTrackEntries,
  useSwipe,
  useGetMoodTrackerRecommendations,
} from "#hooks";
import { Context } from "#services";

/**
 * MoodTrackerHistory
 *
 * MoodTrackerHistory block
 *
 * @return {JSX.Element}
 */
export const MoodTrackHistory = ({ navigation }) => {
  const { t, i18n } = useTranslation("blocks", {
    keyPrefix: "mood-track-history",
  });
  const language = i18n.language;
  const { country } = useContext(Context);
  const IS_RO = country === "RO";

  const [pageNum, setPageNum] = useState(0);
  const limit = `pageNum_${pageNum}_limitToLoad_5`;

  const [loadedPages, setLoadedPages] = useState([]);
  const [moodTrackerData, setMoodTrackerData] = useState({});
  const [selectedItemId, setSelectedItemId] = React.useState(null);
  const [lastMood, setLastMood] = useState(null);

  const limitToLoad = 5;

  const onSuccess = (data) => {
    const { curEntries, prevEntries, hasMore } = data;

    let dataCopy = { ...moodTrackerData };

    if (!dataCopy[limit] || pageNum === 0) {
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

    if (curEntries.length > 0 && !lastMood && IS_RO) {
      setLastMood(curEntries[curEntries.length - 1]?.mood);
    }

    setMoodTrackerData(dataCopy);
  };

  const {
    data: moodTrackerRecommendations,
    isFetching: moodTrackerRecommendationsIsFetching,
  } = useGetMoodTrackerRecommendations(lastMood, language);

  const enabled = useMemo(() => {
    return !loadedPages.includes(pageNum);
  }, [loadedPages, pageNum]);

  useGetMoodTrackEntries(pageNum, onSuccess, enabled);
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

      return (
        <View key={index}>
          <AppText namedStyle="small-text">{dateText}</AppText>
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

  const onSwipeLeft = () => {
    if (pageNum > 0) {
      handlePageChange();
    }
  };
  const onSwipeRight = () => {
    if (moodTrackerData[limit].hasMore) {
      handlePageChange(true);
    }
  };

  const { onTouchStart, onTouchEnd } = useSwipe(onSwipeLeft, onSwipeRight, 30);

  return (
    <Block style={styles.block}>
      {!moodTrackerData[limit] ? (
        <View style={styles.loadingContainer}>
          <Loading />
        </View>
      ) : moodTrackerData[limit].entries.length === 0 ? (
        <View style={styles.loadingContainer}>
          <AppText>{t("no_result")}</AppText>
        </View>
      ) : (
        <>
          <View onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
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
                      moodTrackerData[limit].hasMore
                        ? handlePageChange(true)
                        : {}
                    }
                    disabled={!moodTrackerData[limit].hasMore}
                  >
                    <Icon name="arrow-chevron-back" size="sm" color="#20809E" />
                  </TouchableOpacity>
                </View>
                {renderEmoticons()}
              </View>
              <View style={styles.lineChartContainer}>
                <View style={styles.datesContainer}>
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
                        style={styles.icon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <MoodTrackLineChart
                  data={moodTrackerData[limit]?.entries || []}
                  handleSelectItem={handleMoodClick}
                  selectedItemId={selectedItemId}
                  hidePointsAtIndex={[1, 2, 3, 4, 5]}
                />
              </View>
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
      {IS_RO && lastMood && (
        <React.Fragment>
          {moodTrackerRecommendations?.hasRecommendations && (
            <View style={{ paddingTop: 18 }}>
              <AppText namedStyle="h3">{t("recommendations")}</AppText>
            </View>
          )}

          {moodTrackerRecommendationsIsFetching ? (
            <View style={[styles.loadingContainer, { height: 100 }]}>
              <Loading />
            </View>
          ) : !moodTrackerRecommendations?.hasRecommendations ? (
            <View style={{ paddingTop: 16 }}>
              <AppText style={{ textAlign: "center" }} namedStyle="h4">
                {t("no_recommendations")}
              </AppText>
            </View>
          ) : null}

          {moodTrackerRecommendations?.articles?.length > 0 && (
            <View style={{ paddingTop: 16 }}>
              <AppText namedStyle="h4">{t("articles")}</AppText>
              <View style={{ paddingTop: 10 }}>
                {moodTrackerRecommendations.articles.map((article) => (
                  <CardMedia
                    style={{ marginTop: 12 }}
                    key={"article-" + article.id}
                    type="portrait"
                    size="md"
                    title={article.title}
                    image={
                      article.imageMedium ||
                      article.imageSmall ||
                      article.imageThumbnail
                    }
                    description={article.description}
                    labels={article.labels}
                    creator={article.creator}
                    readingTime={article.readingTime}
                    categoryName={article.categoryName}
                    contentType="articles"
                    // isLikedByUser={isLikedByUser}
                    // isDislikedByUser={isDislikedByUser}
                    likes={article.likes}
                    dislikes={article.dislikes}
                    // isRead={readArticleIds.includes(article.id)}
                    t={t}
                    onPress={() => {
                      navigation.push("ArticleInformation", {
                        articleId: article.id,
                      });
                    }}
                  />
                ))}
              </View>
            </View>
          )}
          {moodTrackerRecommendations?.podcasts?.length > 0 && (
            <View style={{ paddingTop: 16 }}>
              <AppText namedStyle="h4">{t("podcasts")}</AppText>
              <View style={{ paddingTop: 10 }}>
                {moodTrackerRecommendations.podcasts.map((podcast) => (
                  <CardMedia
                    style={{ marginTop: 12 }}
                    key={"podcast-" + podcast.id}
                    type="portrait"
                    size="md"
                    title={podcast.title}
                    image={podcast.imageMedium || podcast.imageSmall}
                    description={podcast.description}
                    labels={podcast.labels}
                    creator={podcast.creator}
                    readingTime={podcast.readingTime}
                    categoryName={podcast.categoryName}
                    contentType="podcasts"
                    // isLikedByUser={isLikedByUser}
                    // isDislikedByUser={isDislikedByUser}
                    likes={podcast.likes}
                    dislikes={podcast.dislikes}
                    // isRead={readArticleIds.includes(article.id)}
                    t={t}
                    onPress={() => {
                      navigation.push("PodcastInformation", {
                        podcastId: podcast.id,
                      });
                    }}
                  />
                ))}
              </View>
            </View>
          )}
          {moodTrackerRecommendations?.videos?.length > 0 && (
            <View style={{ paddingTop: 16 }}>
              <AppText namedStyle="h4">{t("videos")}</AppText>
              <View style={{ paddingTop: 10 }}>
                {moodTrackerRecommendations.videos.map((video) => (
                  <CardMedia
                    style={{ marginTop: 12 }}
                    key={"video-" + video.id}
                    type="portrait"
                    size="md"
                    title={video.title}
                    image={video.imageMedium || video.imageSmall}
                    description={video.description}
                    labels={video.labels}
                    creator={video.creator}
                    readingTime={video.readingTime}
                    categoryName={video.categoryName}
                    contentType="videos"
                    // isLikedByUser={isLikedByUser}
                    // isDislikedByUser={isDislikedByUser}
                    likes={video.likes}
                    dislikes={video.dislikes}
                    t={t}
                    onPress={() => {
                      navigation.push("VideoInformation", {
                        videoId: video.id,
                      });
                    }}
                  />
                ))}
              </View>
            </View>
          )}
        </React.Fragment>
      )}
    </Block>
  );
};

const styles = StyleSheet.create({
  block: {
    paddingBottom: 40,
  },
  chartContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  datesContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  disabled: {
    opacity: 0.4,
  },
  emoticonsContainer: {
    flexDirection: "column",
    height: 240,
    justifyContent: "space-between",
  },
  icon: { marginRight: 16 },
  lineChartContainer: {
    flexDirection: "column",
  },
  loadNextContainer: {
    height: 40,
    justifyContent: "center",
  },
  loadPreviusContainer: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 15,
  },
  loadingContainer: {
    alignItems: "center",
    height: 200,
    justifyContent: "center",
    width: "100%",
  },
});

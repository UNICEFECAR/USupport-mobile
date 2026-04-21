import React, { useState, useMemo, useContext } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useTranslation } from "react-i18next";

import {
  AppText,
  Emoticon,
  Icon,
  Loading,
  MoodTrackLineChart,
  MoodTrackDetails,
  CardMedia,
  TransparentModal,
  NotFoundCard,
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
export const MoodTrackHistory = ({ navigation, header, onHowItWorksPress }) => {
  const { width: windowWidth } = useWindowDimensions();
  const { t, i18n } = useTranslation("blocks", {
    keyPrefix: "mood-track-history",
  });
  const language = i18n.language;
  const { country } = useContext(Context);
  const IS_RO = country === "RO";

  const chartWidth = useMemo(() => {
    const blockHorizontalPadding = 32;
    const emoticonRail = 56;
    return Math.max(
      160,
      Math.floor(windowWidth - blockHorizontalPadding - emoticonRail)
    );
  }, [windowWidth]);

  const [pageNum, setPageNum] = useState(0);
  const [loadedPages, setLoadedPages] = useState([]);
  const limitToLoad = 6;
  const limit = `pageNum_${pageNum}_limitToLoad_${limitToLoad}`;
  const [moodTrackerData, setMoodTrackerData] = useState({});
  const [selectedItemId, setSelectedItemId] = React.useState(null);
  const [lastMood, setLastMood] = useState(null);

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

  useGetMoodTrackEntries(limitToLoad, pageNum, onSuccess, enabled);
  const emoticons = ["happy", "good", "sad", "depressed", "worried"];

  const renderEmoticons = () => {
    return emoticons.map((name, index) => {
      return (
        <View style={styles.emoticonItem} key={index}>
          <Emoticon name={name} size="sm" style={styles.emoticon} />
        </View>
      );
    });
  };

  const renderDates = () => {
    return moodTrackerData[limit]?.entries.map((mood, index) => {
      const dateText = `${
        mood.time.getDate() > 9
          ? mood.time.getDate()
          : `0${mood.time.getDate()}`
      } ${t(`month_${mood.time.getMonth() + 1}`)}`;
      const hourText = `${mood.time.getHours()}:${
        mood.time.getMinutes() > 9
          ? mood.time.getMinutes()
          : `0${mood.time.getMinutes()}`
      }`;

      return (
        <View style={styles.dateItem} key={index}>
          <AppText namedStyle="small-text">{dateText}</AppText>
          <AppText namedStyle="small-text">{hourText}</AppText>
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
    <View style={styles.block}>
      {header}
      {!moodTrackerData[limit] ? (
        <View style={styles.loadingContainer}>
          <Loading />
        </View>
      ) : moodTrackerData[limit].entries.length === 0 ? (
        <View style={styles.loadingContainer}>
          <NotFoundCard
            mode="illustrated"
            headingText={t("no_result")}
            descriptionLine1={t("no_result_line1")}
            descriptionLine2={t("no_result_line2")}
            primaryLabel={t("no_result_primary")}
            secondaryLabel={t("no_result_secondary")}
            onPrimaryClick={() => navigation.goBack()}
            onSecondaryClick={onHowItWorksPress}
            style={{ width: "100%" }}
          />
        </View>
      ) : (
        <>
          <View onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <View style={styles.chartContainer}>
              <View style={styles.emoticonsContainer}>
                {renderEmoticons()}
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
                    <Icon name="arrow-chevron-back" size="md" color="#20809E" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.lineChartContainer}>
                <MoodTrackLineChart
                  data={moodTrackerData[limit]?.entries || []}
                  handleSelectItem={handleMoodClick}
                  selectedItemId={selectedItemId}
                  width={chartWidth}
                  paddingLeft={0}
                  paddingRight={0}
                />
                <View style={styles.datesContainer}>
                  <View style={styles.datesRow}>{renderDates()}</View>
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
                        size="md"
                        color="#20809E"
                        style={styles.icon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
          {(() => {
            const selectedMood = moodTrackerData[limit]?.entries.find(
              (x) => x.mood_tracker_id === selectedItemId
            );

            if (!selectedMood) return null;

            const dateText = `${
              selectedMood.time.getDate() > 9
                ? selectedMood.time.getDate()
                : `0${selectedMood.time.getDate()}`
            } ${t(`month_${selectedMood.time.getMonth() + 1}`)}`;
            const hourText = `${selectedMood.time.getHours()}:${
              selectedMood.time.getMinutes() > 9
                ? selectedMood.time.getMinutes()
                : `0${selectedMood.time.getMinutes()}`
            }`;

            return (
              <TransparentModal
                isOpen={!!selectedMood}
                handleClose={() => setSelectedItemId(null)}
                heading={`${dateText} ${hourText}`}
                hasCloseIcon={true}
              >
                <MoodTrackDetails
                  mood={selectedMood}
                  handleClose={() => setSelectedItemId(null)}
                  t={t}
                />
              </TransparentModal>
            );
          })()}
        </>
      )}
      {IS_RO && (
        <React.Fragment>
          {lastMood && (
            <View style={{ paddingTop: 18 }}>
              <AppText namedStyle="h3">{t("recommendations")}</AppText>
            </View>
          )}

          {moodTrackerRecommendationsIsFetching ? (
            <View style={[styles.loadingContainer, { height: 100 }]}>
              <Loading />
            </View>
          ) : moodTrackerRecommendations?.hasRecommendations ? null : (
            <View style={{ paddingTop: 16 }}>
              <AppText style={{ textAlign: "center" }} namedStyle="h4">
                {t("no_recommendations")}
              </AppText>
            </View>
          )}

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
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  chartContainer: {
    flexDirection: "row",
    marginTop: 16,
    width: "100%",
  },
  dateItem: {
    alignItems: "center",
  },
  datesContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    position: "relative",
    marginLeft: -12,
  },
  datesRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 40,
  },
  disabled: {
    opacity: 0.5,
  },
  emoticon: {
    transform: [{ scale: 0.73 }],
  },
  emoticonItem: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  emoticonsContainer: {
    flexDirection: "column",
    height: 240,
    justifyContent: "space-between",
    marginRight: 8,
  },
  icon: { marginRight: 8 },
  lineChartContainer: {
    flex: 1,
    flexDirection: "column",
    minWidth: 0,
  },
  loadNextContainer: {
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  loadPreviusContainer: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 16,
    minHeight: 200,
  },
});

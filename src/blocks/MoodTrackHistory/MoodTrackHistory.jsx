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
  CHART_PADDING_TOP,
  CHART_GRIDLINE_SPACING,
  CHART_BOTTOM_GRIDLINE_Y,
} from "#components";
import {
  useGetMoodTrackEntries,
  useSwipe,
  useGetMoodTrackerRecommendations,
} from "#hooks";
import { Context } from "#services";

const EMOTICON_ITEM_HEIGHT = 40;

export const MoodTrackHistory = ({ navigation, header, onHowItWorksPress }) => {
  const { width: windowWidth } = useWindowDimensions();
  const { t, i18n } = useTranslation("blocks", {
    keyPrefix: "mood-track-history",
  });
  const language = i18n.language;
  const { country } = useContext(Context);
  const isRomania = country === "RO";

  const chartWidth = useMemo(() => {
    const blockHorizontalPadding = 32;
    const emoticonRailWidth = 36;
    const emoticonRailGap = 8;
    return Math.max(
      160,
      Math.floor(
        windowWidth -
          blockHorizontalPadding -
          emoticonRailWidth -
          emoticonRailGap
      )
    );
  }, [windowWidth]);

  const [pageNum, setPageNum] = useState(0);
  const [loadedPageNumbers, setLoadedPageNumbers] = useState([]);
  const pageSize = 6;
  const pageCacheKey = `pageNum_${pageNum}_pageSize_${pageSize}`;
  const [entriesByPageKey, setEntriesByPageKey] = useState({});
  const [selectedItemId, setSelectedItemId] = React.useState(null);
  const [lastMood, setLastMood] = useState(null);

  const onSuccess = (data) => {
    const { curEntries, prevEntries, hasMore } = data;

    let dataCopy = { ...entriesByPageKey };

    if (!dataCopy[pageCacheKey]) {
      dataCopy[pageCacheKey] = {
        entries: curEntries,
        hasMore: prevEntries.length > 0,
      };
    }
    const prevPageCacheKey = `pageNum_${pageNum + 1}_pageSize_${pageSize}`;

    if (prevEntries.length < pageSize) {
      prevEntries.push(...curEntries.slice(0, pageSize - prevEntries.length));
    }

    dataCopy[prevPageCacheKey] = { entries: prevEntries, hasMore };
    let loadedPagesCopy = [...loadedPageNumbers];
    loadedPagesCopy.push(pageNum);
    setLoadedPageNumbers(loadedPagesCopy);

    if (curEntries.length > 0 && !lastMood && isRomania) {
      setLastMood(curEntries[curEntries.length - 1]?.mood);
    }

    setEntriesByPageKey(dataCopy);
  };

  const {
    data: moodTrackerRecommendations,
    isFetching: moodTrackerRecommendationsIsFetching,
  } = useGetMoodTrackerRecommendations(lastMood, language);

  const enabled = useMemo(() => {
    return !loadedPageNumbers.includes(pageNum);
  }, [loadedPageNumbers, pageNum]);

  useGetMoodTrackEntries(pageSize, pageNum, onSuccess, enabled);
  const emoticons = ["happy", "good", "sad", "depressed", "worried"];

  const renderEmoticons = () => {
    return emoticons.map((name, index) => {
      const centerY = CHART_PADDING_TOP + CHART_GRIDLINE_SPACING * index;
      const top = centerY - EMOTICON_ITEM_HEIGHT / 2;
      return (
        <View
          style={[styles.emoticonItem, { top, height: EMOTICON_ITEM_HEIGHT }]}
          key={index}
        >
          <Emoticon name={name} size="sm" style={styles.emoticon} />
        </View>
      );
    });
  };

  const renderDates = () => {
    const entries = entriesByPageKey[pageCacheKey]?.entries || [];

    const dateItems = entries.map((mood, index) => {
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
          <AppText namedStyle="small-text" style={styles.dateText}>
            {dateText}
          </AppText>
          <AppText namedStyle="small-text" style={styles.dateText}>
            {hourText}
          </AppText>
        </View>
      );
    });

    const shouldIncludeLeadingSpacer = entries.length > 1;
    return shouldIncludeLeadingSpacer
      ? [<View style={styles.dateItem} key="placeholder" />, ...dateItems]
      : dateItems;
  };

  const handlePageChange = (next = false) => {
    setPageNum((prev) => (next ? prev + 1 : prev - 1));
  };

  const handleMoodClick = (index) => {
    setSelectedItemId(
      entriesByPageKey[pageCacheKey].entries[index].mood_tracker_id
    );
  };

  const onSwipeLeft = () => {
    if (pageNum > 0) {
      handlePageChange();
    }
  };
  const onSwipeRight = () => {
    if (entriesByPageKey[pageCacheKey].hasMore) {
      handlePageChange(true);
    }
  };

  const { onTouchStart, onTouchEnd } = useSwipe(onSwipeLeft, onSwipeRight, 30);

  return (
    <View style={styles.block}>
      {header}
      {!entriesByPageKey[pageCacheKey] ? (
        <View style={styles.loadingContainer}>
          <Loading />
        </View>
      ) : entriesByPageKey[pageCacheKey].entries.length === 0 ? (
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
              <View style={styles.emoticonsContainer}>{renderEmoticons()}</View>
              <View style={styles.lineChartContainer}>
                <MoodTrackLineChart
                  data={entriesByPageKey[pageCacheKey]?.entries || []}
                  handleSelectItem={handleMoodClick}
                  selectedItemId={selectedItemId}
                  width={chartWidth}
                />
                <View
                  style={[
                    styles.datesTrack,
                    { width: chartWidth },
                    (entriesByPageKey[pageCacheKey]?.entries?.length || 0) >=
                      6 && {
                      marginLeft: -20,
                    },
                  ]}
                  pointerEvents="none"
                >
                  {renderDates()}
                </View>
              </View>
            </View>
            <View style={styles.navRow}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  !entriesByPageKey[pageCacheKey].hasMore && styles.disabled,
                ]}
                onPress={() =>
                  entriesByPageKey[pageCacheKey].hasMore
                    ? handlePageChange(true)
                    : null
                }
                disabled={!entriesByPageKey[pageCacheKey].hasMore}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="arrow-chevron-back" size="md" color="#20809E" />
                <AppText namedStyle="small-text" style={styles.navButtonLabel}>
                  {t("previous")}
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navButton, pageNum === 0 && styles.disabled]}
                onPress={() => (pageNum === 0 ? null : handlePageChange())}
                disabled={pageNum === 0}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppText namedStyle="small-text" style={styles.navButtonLabel}>
                  {t("next")}
                </AppText>
                <Icon name="arrow-chevron-forward" size="md" color="#20809E" />
              </TouchableOpacity>
            </View>
          </View>
          {(() => {
            const selectedMood = entriesByPageKey[pageCacheKey]?.entries.find(
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
      {isRomania && (
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
                    likes={article.likes}
                    dislikes={article.dislikes}
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
                    likes={podcast.likes}
                    dislikes={podcast.dislikes}
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
    flex: 1,
    alignItems: "center",
  },
  dateText: {
    textAlign: "center",
    fontSize: 14,
  },
  datesTrack: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-start",
    marginTop: 8,
  },
  disabled: {
    opacity: 0.4,
  },
  emoticon: {
    transform: [{ scale: 0.73 }],
  },
  emoticonItem: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 0,
    right: 0,
  },
  emoticonsContainer: {
    height: Math.ceil(CHART_BOTTOM_GRIDLINE_Y + EMOTICON_ITEM_HEIGHT / 2 + 4),
    marginRight: 8,
    position: "relative",
    width: 36,
  },
  lineChartContainer: {
    flex: 1,
    flexDirection: "column",
    minWidth: 0,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 16,
    minHeight: 200,
  },
  navRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingHorizontal: 8,
  },
  navButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  navButtonLabel: {
    color: "#20809E",
  },
});

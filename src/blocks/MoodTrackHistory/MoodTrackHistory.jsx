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
  LinearGradient,
  Loading,
  MoodTrackLineChart,
  MoodTrackDetails,
  CardMedia,
  TransparentModal,
  NotFoundCard,
  CHART_BOTTOM_GRIDLINE_Y,
  getDotXPositions,
  getMoodChartHorizontalLineY,
} from "#components";
import {
  useGetMoodTrackEntries,
  useSwipe,
  useGetMoodTrackerRecommendations,
  useGetTheme,
} from "#hooks";
import { Context } from "#services";
import { appStyles } from "#styles";

const EMOTICON_ITEM_HEIGHT = 44;

export const MoodTrackHistory = ({ navigation, header, onHowItWorksPress }) => {
  const { width: windowWidth } = useWindowDimensions();
  const { t, i18n } = useTranslation("blocks", {
    keyPrefix: "mood-track-history",
  });
  const language = i18n.language;
  const { country } = useContext(Context);
  const { colors, isDarkMode, isHighContrast } = useGetTheme();
  const isLightTheme = colors.background === appStyles.colorWhite_ff;
  const isRomania = country === "RO";

  const chartGlassGradient = useMemo(
    () => ({
      degrees: 145,
      locations: [0, 100],
      colors:
        isLightTheme && !isHighContrast
          ? ["rgba(255, 255, 255, 0.72)", "rgba(245, 248, 255, 0.58)"]
          : colors.cardMediaGradient,
    }),
    [isLightTheme, isHighContrast, colors.cardMediaGradient]
  );

  const chartWidth = useMemo(() => {
    const blockHorizontalPadding = 32;
    const cardHorizontalPadding = 24;
    const emoticonRailWidth = 42;
    const emoticonRailGap = 12;
    return Math.max(
      160,
      Math.floor(
        windowWidth -
          blockHorizontalPadding -
          cardHorizontalPadding -
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
      const centerY = getMoodChartHorizontalLineY(index);
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
    if (!entries.length) {
      return null;
    }

    const dotXPositions = getDotXPositions(entries.length, chartWidth);
    const labelWidth = Math.min(
      76,
      Math.max(44, Math.floor(chartWidth / Math.max(entries.length * 1.35, 1)))
    );

    return entries.map((mood, index) => {
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
      const dotX = dotXPositions[index] ?? chartWidth / 2;

      return (
        <View
          style={[
            styles.dateItem,
            {
              position: "absolute",
              left: dotX - labelWidth / 2,
              width: labelWidth,
            },
          ]}
          key={index}
        >
          <AppText
            namedStyle="small-text"
            style={[styles.dateLine, { color: colors.textSecondary }]}
          >
            {dateText}
          </AppText>
          <AppText
            namedStyle="small-text"
            style={[styles.timeLine, { color: colors.text }]}
          >
            {hourText}
          </AppText>
        </View>
      );
    });
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

  const navActionColor =
    isHighContrast || isDarkMode
      ? colors.text
      : colors.primary || appStyles.colorPrimary_20809e;

  const chartHasMore = !!(entriesByPageKey[pageCacheKey]?.hasMore ?? false);
  const showChartNavPrev = chartHasMore;
  const showChartNavNext = pageNum > 0;
  const showChartNavRow = showChartNavPrev || showChartNavNext;

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
            <View
              style={[
                styles.chartCardOuter,
                isLightTheme && !isHighContrast
                  ? styles.liquidGlassShadowLight
                  : appStyles.cardMediaShadowDark,
              ]}
            >
              <LinearGradient
                gradient={chartGlassGradient}
                style={[
                  styles.chartCardInner,
                  {
                    borderColor: isHighContrast
                      ? colors.textSecondary
                      : colors.cardMediaGradientBorder,
                  },
                  isHighContrast && styles.chartCardHC,
                ]}
              >
                <View style={styles.chartContainer}>
                  <View
                    style={[
                      styles.emoticonsContainer,
                      {
                        backgroundColor: isDarkMode
                          ? "rgba(255,255,255,0.04)"
                          : "rgba(104, 77, 253, 0.06)",
                      },
                    ]}
                  >
                    {renderEmoticons()}
                  </View>
                  <View style={styles.lineChartContainer}>
                    <MoodTrackLineChart
                      data={entriesByPageKey[pageCacheKey]?.entries || []}
                      handleSelectItem={handleMoodClick}
                      selectedItemId={selectedItemId}
                      width={chartWidth}
                    />
                    <View
                      style={[styles.datesTrack, { width: chartWidth }]}
                      pointerEvents="none"
                    >
                      {renderDates()}
                    </View>
                  </View>
                </View>
                {showChartNavRow ? (
                  <View
                    style={[
                      styles.chartNavRow,
                      {
                        borderTopColor: isHighContrast
                          ? colors.textSecondary
                          : colors.cardMediaSeparator ||
                            "rgba(15, 32, 47, 0.12)",
                      },
                    ]}
                  >
                    <View style={styles.chartNavSideStart}>
                      {showChartNavPrev ? (
                        <TouchableOpacity
                          style={[
                            styles.navButton,
                            isDarkMode && styles.navButtonDark,
                            isHighContrast && styles.navButtonHC,
                          ]}
                          onPress={() =>
                            entriesByPageKey[pageCacheKey].hasMore
                              ? handlePageChange(true)
                              : null
                          }
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Icon
                            name="arrow-chevron-back"
                            size="md"
                            color={navActionColor}
                          />
                          <AppText
                            namedStyle="small-text"
                            style={[
                              styles.navButtonLabel,
                              { color: navActionColor },
                            ]}
                          >
                            {t("previous")}
                          </AppText>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    <View style={styles.chartNavSideEnd}>
                      {showChartNavNext ? (
                        <TouchableOpacity
                          style={[
                            styles.navButton,
                            isDarkMode && styles.navButtonDark,
                            isHighContrast && styles.navButtonHC,
                          ]}
                          onPress={() => handlePageChange()}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <AppText
                            namedStyle="small-text"
                            style={[
                              styles.navButtonLabel,
                              { color: navActionColor },
                            ]}
                          >
                            {t("next")}
                          </AppText>
                          <Icon
                            name="arrow-chevron-forward"
                            size="md"
                            color={navActionColor}
                          />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                ) : null}
              </LinearGradient>
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
  liquidGlassShadowLight: {
    shadowColor: "rgb(95, 108, 145)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  chartCardOuter: {
    width: "100%",
    marginTop: 16,
    overflow: "visible",
  },
  chartCardInner: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  chartCardHC: {
    borderWidth: 2,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
  },
  dateItem: {
    alignItems: "center",
  },
  dateLine: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  timeLine: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
    letterSpacing: 0.15,
  },
  datesTrack: {
    position: "relative",
    alignSelf: "flex-start",
    marginTop: 4,
    minHeight: 42,
  },
  emoticon: {
    transform: [{ scale: 0.82 }],
  },
  emoticonItem: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 0,
    right: 0,
  },
  emoticonsContainer: {
    height: Math.ceil(CHART_BOTTOM_GRIDLINE_Y + EMOTICON_ITEM_HEIGHT / 2 + 8),
    marginRight: 12,
    position: "relative",
    width: 42,
    borderRadius: 14,
    overflow: "hidden",
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
  chartNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
    paddingTop: 12,
    paddingBottom: 2,
    paddingHorizontal: 2,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
  },
  chartNavSideStart: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  chartNavSideEnd: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  navButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  navButtonLabel: {
    color: appStyles.colorPrimary_20809e,
  },
  navButtonDark: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 8,
  },
  navButtonHC: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: appStyles.colorHighContrast_ffff00,
  },
});

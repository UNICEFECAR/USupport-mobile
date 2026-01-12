import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";

import {
  Box,
  AppText,
  ProgressBar,
  Loading,
  CardMedia,
  Icon,
  AppButton,
} from "#components";

import { useGetTheme, useGetAssessmentResult } from "#hooks";

import { createArticleSlug } from "#utils";

import appStyles from "../../styles/appStyles";

/**
 * BaselineAssesmentResult
 *
 * Baseline assessment result summary
 *
 * @return {jsx}
 */
export const BaselineAssesmentResult = ({ result, redirectToDashboard }) => {
  const { t } = useTranslation("blocks", {
    keyPrefix: "baseline-assesment-result",
  });
  const navigation = useNavigation();
  const { colors, isDarkMode } = useGetTheme();

  // const result = {
  //   psychological: "moderate",
  //   biological: "moderate",
  //   social: "high",
  //   psychologicalScore: 30,
  //   biologicalScore: 23,
  //   socialScore: 27,
  //   comparePrevious: {
  //     psychological: "lower",
  //     biological: "equal",
  //     social: "higher",
  //   },
  // };

  // Use the hook if provided, otherwise return mock data
  const { isFetching, data } = useGetAssessmentResult({
    ...result,
    language: "en",
  });

  const handleArticlePress = (articleData) => {
    navigation.navigate("ArticleInformation", {
      articleId: articleData.id,
      slug: createArticleSlug(articleData.title),
    });
  };

  const handleVideoPress = (videoData) => {
    navigation.navigate("VideoInformation", {
      videoId: videoData.id,
      slug: createArticleSlug(videoData.title),
    });
  };

  const handlePodcastPress = (podcastData) => {
    navigation.navigate("PodcastInformation", {
      podcastId: podcastData.id,
      slug: createArticleSlug(podcastData.title),
    });
  };

  const renderIcon = (result) => {
    const color =
      result === "higher" ? "#eb5757" : result === "lower" ? "#7ec680" : "";
    const name =
      result === "higher" ? "arrow-up" : result === "lower" ? "arrow-down" : "";
    return <Icon color={color} name={name} />;
  };

  function generateKey(result) {
    const map = {
      higher: "inc",
      lower: "dec",
      equal: "same",
    };

    return [
      map[result.psychological],
      map[result.biological],
      map[result.social],
    ].join("_");
  }

  let resultText = "";
  if (result?.comparePrevious) {
    const key = generateKey(result.comparePrevious);
    if (key !== "same_same_same") {
      resultText = t(key);
    }
  }

  const renderContentGrid = (contentData, onPress, contentType) => {
    if (!contentData || contentData.length === 0) return null;

    return (
      <FlatList
        data={contentData}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        contentContainerStyle={{
          gap: 20,
        }}
        renderItem={({ item, index }) => {
          const isFirst = index === 0;
          const isLast = index === contentData.length - 1;
          return (
            <View
              style={[
                styles.cardContainer,
                isFirst && { marginLeft: 22 },
                isLast && { marginRight: 22 },
              ]}
            >
              <CardMedia
                image={item.imageMedium || item.imageSmall}
                title={item.title}
                creator={item.creator}
                readingTime={item.readingTime}
                description={item.description}
                categoryName={item.categoryName}
                likes={item.likes}
                dislikes={item.dislikes}
                contentType={contentType}
                onPress={() => onPress(item)}
                t={t}
                style={styles.card}
              />
            </View>
          );
        }}
      />
    );
  };

  console.log(result);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.resultContainer}>
        <View style={styles.completedSection}>
          <TouchableOpacity
            style={{ marginLeft: "auto" }}
            onPress={redirectToDashboard}
          >
            <Icon name="close-x" color={colors.text} />
          </TouchableOpacity>
          <AppText namedStyle="h2" style={styles.completedTitle}>
            {t("assessment_completed")}
          </AppText>
          <View style={styles.statsContainer}>
            <ProgressBar progress={100} height="lg" showPercentage />
          </View>
        </View>

        {result && (
          <View
            style={{
              flexDirection: "column",
              gap: 16,
              alignItems: "center",
            }}
          >
            {resultText && <AppText namedStyle="h4">{resultText}</AppText>}
            {result.psychologicalScore !== undefined && (
              <Box boxShadow={2} style={styles.factor}>
                <AppText>
                  {t("psychological")}: {result.psychologicalScore}
                </AppText>
                {result?.comparePrevious?.psychological &&
                  renderIcon(result.comparePrevious.psychological)}
              </Box>
            )}
            {result.biologicalScore !== undefined && (
              <Box boxShadow={2} style={styles.factor}>
                <AppText>
                  {t("biological")}: {result.biologicalScore}
                </AppText>
                {result?.comparePrevious?.biological &&
                  renderIcon(result.comparePrevious.biological)}
              </Box>
            )}
            {result.socialScore !== undefined && (
              <Box boxShadow={2} style={styles.factor}>
                <AppText>
                  {t("social")}: {result.socialScore}
                </AppText>
                {result?.comparePrevious?.social &&
                  renderIcon(result.comparePrevious.social)}
              </Box>
            )}
          </View>
        )}

        {isFetching && (
          <View style={styles.loadingSection}>
            <AppText namedStyle="text" style={styles.loadingText}>
              {t("loading_results")}
            </AppText>
            <Loading style={styles.loading} />
          </View>
        )}

        {data && (
          <View style={styles.summarySection}>
            <AppText namedStyle="h3" style={styles.summaryTitle}>
              {t("summary_heading")}
            </AppText>
            <AppText namedStyle="text" style={styles.summaryText}>
              {data.summary}
            </AppText>
            <AppButton
              label={t("organizations")}
              onPress={() =>
                navigation.navigate("Organizations", {
                  triggerPersonalization: true,
                })
              }
              style={styles.organizationsButton}
            />
          </View>
        )}

        {/* Recommended Articles */}
        {data?.articles?.length > 0 && (
          <View style={styles.contentSection}>
            <AppText namedStyle="h3" style={styles.sectionTitle}>
              {t("recommended_articles")}
            </AppText>
            {renderContentGrid(data.articles, handleArticlePress, "articles")}
          </View>
        )}

        {/* Recommended Videos */}
        {data?.videos?.length > 0 && (
          <View style={styles.contentSection}>
            <AppText namedStyle="h3" style={styles.sectionTitle}>
              {t("recommended_videos")}
            </AppText>
            {renderContentGrid(data.videos, handleVideoPress, "videos")}
          </View>
        )}

        {/* Recommended Podcasts */}
        {data?.podcasts?.length > 0 && (
          <View style={styles.contentSection}>
            <AppText namedStyle="h3" style={styles.sectionTitle}>
              {t("recommended_podcasts")}
            </AppText>
            {renderContentGrid(data.podcasts, handlePodcastPress, "podcasts")}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  resultContainer: {
    alignSelf: "center",
    width: "100%",
  },

  completedSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  completedTitle: {
    textAlign: "center",
    marginBottom: 24,
    marginTop: 18,
  },
  statsContainer: {
    width: "100%",
    maxWidth: 400,
  },

  loadingSection: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 32,
  },
  loadingText: {
    textAlign: "center",
    marginBottom: 16,
  },
  loading: {
    width: 60,
    height: 60,
  },

  summarySection: {
    marginBottom: 32,
    marginTop: 32,
    paddingHorizontal: 16,
  },
  summaryTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  summaryText: {
    textAlign: "center",
    lineHeight: 24,
  },
  organizationsButton: {
    marginTop: 24,
    alignSelf: "center",
  },

  // Content sections
  contentSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    textAlign: "center",
    marginBottom: 24,
  },

  // Content grid
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  cardContainer: {
    // flex: 0.48, // Slightly less than 0.5 to account for spacing
    marginBottom: 16,
  },
  card: {
    width: "100%",
    minWidth: appStyles.screenWidth * 0.75,
    maxWidth: appStyles.screenWidth * 0.9,
  },
  factor: {
    width: "90%",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
});

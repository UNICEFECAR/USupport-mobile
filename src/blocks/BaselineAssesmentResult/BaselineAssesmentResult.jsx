import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import Share from "react-native-share";

import {
  Box,
  AppText,
  ProgressBar,
  Loading,
  CardMedia,
  Icon,
  CKRenderer,
  NewButton,
} from "#components";

import { useGetTheme, useGetAssessmentResult } from "#hooks";

import {
  createArticleSlug,
  generateBaselineAssessmentResultPDF,
  showToast,
} from "#utils";

import { logoVertical, logoVerticalDark } from "../../assets";

import appStyles from "../../styles/appStyles";

/**
 * BaselineAssesmentResult
 *
 * Baseline assessment result summary
 *
 * @return {jsx}
 */
export const BaselineAssesmentResult = ({
  result,
  redirectToDashboard,
  assessmentDate,
}) => {
  const { t, i18n } = useTranslation("blocks", {
    keyPrefix: "baseline-assesment-result",
  });
  const { t: tScreen } = useTranslation("screens", { keyPrefix: "screen" });
  const navigation = useNavigation();
  const { colors, isDarkMode, isHighContrast } = useGetTheme();
  const language = i18n.language;
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const { isFetching, data } = useGetAssessmentResult({
    ...result,
    language: language,
  });

  const actionColor = isHighContrast ? "#fff" : appStyles.colorPrimary_20809e;

  const formattedDate = useMemo(() => {
    const rawDate =
      assessmentDate ??
      result?.assessmentDate ??
      result?.assessment_date ??
      result?.createdAt ??
      result?.created_at;
    if (!rawDate) return "";
    const d = new Date(rawDate);
    if (Number.isNaN(d.getTime())) return "";
    try {
      return new Intl.DateTimeFormat(language, {
        year: "numeric",
        month: "long",
        day: "2-digit",
      }).format(d);
    } catch {
      return d.toLocaleDateString();
    }
  }, [
    assessmentDate,
    language,
    result?.assessmentDate,
    result?.assessment_date,
    result?.createdAt,
    result?.created_at,
  ]);

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

  const handleExportPDF = async () => {
    try {
      setIsPdfLoading(true);
      const logoSource = isDarkMode ? logoVerticalDark : logoVertical;
      const logoUri = Image.resolveAssetSource(logoSource)?.uri;
      const file = await generateBaselineAssessmentResultPDF({
        result: { ...result, comparePreviousText: resultText || "" },
        assessmentData: data,
        t,
        logoUri,
      });

      if (file && (file.base64 || file.filePath)) {
        if (Platform.OS === "android") {
          showToast({
            message: t("download_success", {
              defaultValue: "PDF downloaded successfully",
            }),
            type: "success",
          });
        }

        let url;
        if (Platform.OS === "ios") {
          if (file.filePath) {
            url = file.filePath.startsWith("file://")
              ? file.filePath
              : `file://${file.filePath}`;
          } else if (file.base64) {
            url = `data:application/pdf;base64,${file.base64}`;
          }
        } else {
          if (file.base64) {
            url = `data:application/pdf;base64,${file.base64}`;
          } else if (file.filePath) {
            url = file.filePath.startsWith("file://")
              ? file.filePath
              : `file://${file.filePath}`;
          }
        }

        const shareOptions = {
          title: t("assessment_completed", {
            defaultValue: "Assessment result",
          }),
          subject: t("assessment_completed", {
            defaultValue: "Assessment result",
          }),
          url,
          type: "application/pdf",
          saveToFiles: Platform.OS === "ios",
          failOnCancel: Platform.OS === "ios",
        };

        try {
          await Share.open(shareOptions);
          if (Platform.OS === "ios") {
            showToast({
              message: t("download_success", {
                defaultValue: "PDF downloaded successfully",
              }),
              type: "success",
            });
          }
        } catch (shareError) {
          if (
            shareError?.message &&
            !shareError.message.includes("User did not share")
          ) {
            console.log("Share PDF error:", shareError);
          }
        }
      } else {
        console.error("PDF file path is missing");
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      if (error?.message && error.message.includes("User did not share")) {
        return;
      }
    } finally {
      setIsPdfLoading(false);
    }
  };

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
                image={
                  item.imageMedium || item.imageThumbnail || item.imageSmall
                }
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.resultContainer}>
        <View style={styles.headerSection}>
          <TouchableOpacity
            onPress={redirectToDashboard}
            style={styles.goBackRow}
          >
            <Icon
              style={styles.goBackIcon}
              name="arrow-chevron-back"
              color={actionColor}
            />
            <AppText namedStyle="text" isBold style={styles.goBackText}>
              {tScreen("go_back")}
            </AppText>
          </TouchableOpacity>
          <AppText namedStyle="h2" style={styles.completedTitle}>
            {t("assessment_completed")}
          </AppText>
          {!!formattedDate && (
            <AppText namedStyle="text" style={styles.dateText}>
              {t("date", { defaultValue: "Date" })}: {formattedDate}
            </AppText>
          )}
          <View style={styles.statsContainer}>
            <ProgressBar progress={100} height="lg" showPercentage />
          </View>
        </View>

        {result && (
          <View style={styles.compareSection}>
            {!!resultText && (
              <AppText namedStyle="h4" style={styles.compareTitle}>
                {resultText}
              </AppText>
            )}
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

        <View style={styles.downloadSection}>
          <NewButton
            label={t("download_pdf", {
              defaultValue: "Download results (PDF)",
            })}
            onPress={handleExportPDF}
            style={styles.downloadButton}
            size="lg"
            disabled={isPdfLoading || isFetching}
            loading={isPdfLoading}
          />
        </View>

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
            {data.summary_ck ? (
              <CKRenderer data={data.summary_ck} />
            ) : (
              <AppText namedStyle="text" style={styles.summaryText}>
                {data.summary}
              </AppText>
            )}
            <NewButton
              label={t("organizations")}
              onPress={() =>
                navigation.navigate("Organizations", {
                  triggerPersonalization: true,
                })
              }
              style={styles.organizationsButton}
              size="lg"
            />
          </View>
        )}

        {/* Recommended Articles */}
        {data?.articles?.length > 0 && (
          <View style={styles.contentSection}>
            <AppText namedStyle="h4" style={styles.sectionTitle}>
              {t("recommended_articles")}
            </AppText>
            {renderContentGrid(data.articles, handleArticlePress, "articles")}
          </View>
        )}

        {/* Recommended Videos */}
        {data?.videos?.length > 0 && (
          <View style={styles.contentSection}>
            <AppText namedStyle="h4" style={styles.sectionTitle}>
              {t("recommended_videos")}
            </AppText>
            {renderContentGrid(data.videos, handleVideoPress, "videos")}
          </View>
        )}

        {/* Recommended Podcasts */}
        {data?.podcasts?.length > 0 && (
          <View style={styles.contentSection}>
            <AppText namedStyle="h4" style={styles.sectionTitle}>
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
    maxWidth: 640,
  },

  headerSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 22,
  },
  goBackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  goBackIcon: {
    marginRight: 8,
  },
  goBackText: {
    textTransform: "none",
  },
  completedTitle: {
    textAlign: "center",
    marginBottom: 24,
    marginTop: 18,
  },
  dateText: {
    marginTop: -12,
    marginBottom: 12,
    textAlign: "center",
  },
  downloadButton: {
    alignSelf: "center",
  },
  downloadSection: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 22,
  },
  statsContainer: {
    width: "100%",
    maxWidth: 400,
  },

  compareSection: {
    flexDirection: "column",
    gap: 16,
    alignItems: "center",
    paddingHorizontal: 22,
  },
  compareTitle: {
    textAlign: "center",
  },

  loadingSection: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 32,
    paddingHorizontal: 22,
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
    paddingHorizontal: 22,
  },
  summaryTitle: {
    marginBottom: 16,
    textAlign: "left",
  },
  summaryText: {
    textAlign: "left",
    lineHeight: 24,
  },
  organizationsButton: {
    marginTop: 24,
    alignSelf: "flex-start",
    marginHorizontal: "auto",
  },

  // Content sections
  contentSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    textAlign: "left",
    marginBottom: 24,
    paddingHorizontal: 22,
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
    width: "100%",
    maxWidth: 480,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
});

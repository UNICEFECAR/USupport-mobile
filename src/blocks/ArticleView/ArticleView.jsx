import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import Share from "react-native-share";
import { useTranslation } from "react-i18next";
import Config from "react-native-config";

import {
  AudioPlayer,
  Icon,
  Label,
  AppText,
  Like,
  Loading,
  CKRenderer,
} from "#components";
import LinearGradient from "../../components/LinearGradient";
import { appStyles } from "#styles";

import {
  useGetTheme,
  useAddContentRating,
  useAddContentEngagement,
  useRemoveContentEngagement,
} from "#hooks";
import { cmsSvc } from "#services";
import { constructShareUrl, generatePDF, showToast } from "#utils";

const { AMAZON_S3_BUCKET } = Config;

/**
 * ArticleView
 *
 * Layout and styling aligned with client-ui article-view.scss (glass card, meta, actions, image order).
 *
 * @return {jsx}
 */
export const ArticleView = ({ articleData, isTmpUser }) => {
  const { t } = useTranslation("screens", {
    keyPrefix: "article-information",
  });
  const { colors, isHighContrast, isDarkMode } = useGetTheme();
  const queryClient = useQueryClient();

  const isLightTheme = colors.background === appStyles.colorWhite_ff;

  const [contentRating, setContentRating] = React.useState({
    likes: articleData.likes || 0,
    dislikes: articleData.dislikes || 0,
    isLikedByUser: articleData.contentRating?.isLikedByUser || false,
    isDislikedByUser: articleData.contentRating?.isDislikedByUser || false,
  });

  // Match ConsultationsDashboard / BaselineAssessmentDashboard liquid glass
  const glassGradient = useMemo(
    () => ({
      degrees: 145,
      locations: [0, 100],
      colors:
        isLightTheme && !isHighContrast
          ? Platform.OS === "android"
            ? ["#ffffff", "#f5f8ff"]
            : ["rgba(255, 255, 255, 0.99)", "rgba(245, 248, 255, 0.85)"]
          : colors.cardMediaGradient,
    }),
    [isLightTheme, isHighContrast, colors.cardMediaGradient]
  );

  const metaAccentColor = isHighContrast
    ? appStyles.colorOrangeArticleCreatorHC_ffc18c
    : colors.cardMediaMetaText;

  const timeIconColor = isHighContrast
    ? appStyles.colorHighContrast_ffff00
    : colors.text;

  const actionIconColor =
    isLightTheme && !isHighContrast
      ? appStyles.colorGray_66768d
      : appStyles.colorWhite_ff;

  const categoryBadgeStyle = useMemo(() => {
    if (isDarkMode && !isHighContrast) {
      return {
        backgroundColor: appStyles.colorGray_66768d,
        borderColor: "transparent",
      };
    }
    return {
      backgroundColor: appStyles.colorBlue_20809E_0_3,
      borderColor: "transparent",
    };
  }, [isDarkMode, isHighContrast]);

  const categoryTextColor = useMemo(() => {
    if (isDarkMode && !isHighContrast) {
      return appStyles.color_blue_c1d7e0;
    }
    return appStyles.colorBlue_3d527b;
  }, [isDarkMode, isHighContrast]);

  const onMutate = (data) => {
    const prevData = JSON.parse(JSON.stringify(contentRating));

    const likes = prevData.likes;
    const dislikes = prevData.dislikes;
    const isLikedByUser = prevData.isLikedByUser;
    const isDislikedByUser = prevData.isDislikedByUser;

    const newData = { ...contentRating };

    if (isLikedByUser && data.positive === null) {
      newData.likes = likes - 1;
      newData.isLikedByUser = false;

      cmsSvc.addRating({
        id: articleData.id,
        action: "remove-like",
        contentType: "article",
      });
    }
    if (isDislikedByUser && data.positive === null) {
      newData.dislikes = dislikes - 1;
      newData.isDislikedByUser = false;
      cmsSvc.addRating({
        id: articleData.id,
        action: "remove-dislike",
        contentType: "article",
      });
    }

    if (data.positive === true) {
      newData.likes = likes + 1;
      newData.isLikedByUser = true;
      cmsSvc.addRating({
        id: articleData.id,
        action: "add-like",
        contentType: "article",
      });
      if (isDislikedByUser) {
        newData.dislikes = dislikes - 1;
        newData.isDislikedByUser = false;
        cmsSvc.addRating({
          id: articleData.id,
          action: "remove-dislike",
          contentType: "article",
        });
      }
    }

    if (data.positive === false) {
      newData.dislikes = dislikes + 1;
      newData.isDislikedByUser = true;
      cmsSvc.addRating({
        id: articleData.id,
        action: "add-dislike",
        contentType: "article",
      });
      if (isLikedByUser) {
        newData.likes = likes - 1;
        newData.isLikedByUser = false;
        cmsSvc.addRating({
          id: articleData.id,
          action: "remove-like",
          contentType: "article",
        });
      }
    }

    setContentRating(newData);

    return () => {
      setContentRating(prevData);
    };
  };
  const onError = (error, rollback) => {
    rollback();
    showToast({ message: error, type: "error" });
  };

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["userContentRatings"] });
    queryClient.invalidateQueries({ queryKey: ["userContentEngagements"] });
    queryClient.invalidateQueries({ queryKey: ["articles-ratings"] });
  };

  const addContentRatingMutation = useAddContentRating(
    onMutate,
    onError,
    onSuccess
  );

  const addContentEngagementMutation = useAddContentEngagement();
  const removeContentEngagementMutation = useRemoveContentEngagement();

  useQuery(
    ["article-view-tracking", articleData.id],
    async () => {
      addContentEngagementMutation({
        contentId: articleData.id,
        contentType: "article",
        action: "view",
      });
      return true;
    },
    {
      enabled: !!articleData?.id && !isTmpUser,
    }
  );

  const handleAddRating = (action) => {
    if (isTmpUser) return;

    const isRemovingReaction =
      action === "remove-like" || action === "remove-dislike";

    if (isRemovingReaction) {
      removeContentEngagementMutation({
        contentId: articleData.id,
        contentType: "article",
      });
    } else {
      addContentEngagementMutation({
        contentId: articleData.id,
        contentType: "article",
        action: action === "like" ? "like" : "dislike",
      });
    }

    addContentRatingMutation({
      contentId: articleData.id,
      positive: action === "like" ? true : isRemovingReaction ? null : false,
      contentType: "article",
    });
  };

  const handleShare = async () => {
    try {
      const url = await constructShareUrl({
        contentType: "article",
        id: articleData.id,
        name: articleData.title,
      });
      await Share.open({
        title: articleData.title,
        message: `${t("check_article")}\n\n${url}`,
      });
      showToast({ message: t("share_success"), type: "success" });
      if (!isTmpUser) {
        addContentEngagementMutation({
          contentId: articleData.id,
          contentType: "article",
          action: "share",
        });
      }
    } catch (error) {
      if (error.message && !error.message.includes("User did not share")) {
        console.log("Share error:", error);
      }
    }
  };

  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const handleExportPDF = async () => {
    try {
      setIsPdfLoading(true);
      const file = await generatePDF({
        articleData,
        t,
      });

      if (file && (file.base64 || file.filePath)) {
        if (Platform.OS === "android") {
          showToast({
            message: t("download_success"),
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
          title: articleData.title,
          subject: articleData.title,
          url,
          type: "application/pdf",
          saveToFiles: Platform.OS === "ios",
          failOnCancel: Platform.OS === "ios",
        };
        try {
          await Share.open(shareOptions);
          if (Platform.OS === "ios") {
            showToast({
              message: t("download_success"),
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
      }
      if (!isTmpUser) {
        addContentEngagementMutation({
          contentId: articleData.id,
          contentType: "article",
          action: "download",
        });
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      if (error?.message && error.message.includes("User did not share")) {
        return;
      }
      console.error("Failed to export/share PDF:", error);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const articleImageUri =
    articleData.imageMedium ||
    articleData.imageThumbnail ||
    articleData.imageSmall;

  const markdownStyles = useMemo(
    () => ({
      heading3: {
        fontSize: 20,
        lineHeight: 24,
        fontFamily: appStyles.fontSemiBold,
        color: colors.text,
        marginTop: 20,
        marginBottom: 8,
      },
      heading4: {
        fontSize: 16,
        lineHeight: 24,
        fontFamily: appStyles.fontSemiBold,
        color: colors.text,
        marginTop: 12,
      },
      paragraph: {
        color: colors.textSecondary,
        fontSize: 16,
        fontFamily: appStyles.fontRegular,
        lineHeight: 28,
      },
      list_item: {
        color: colors.textSecondary,
        fontSize: 16,
        fontFamily: appStyles.fontRegular,
        lineHeight: 28,
      },
    }),
    [colors.text, colors.textSecondary]
  );

  const renderGlassCard = (children) => (
    <LinearGradient
      gradient={glassGradient}
      style={[
        styles.glassCard,
        isLightTheme && !isHighContrast
          ? styles.liquidGlassShadowLight
          : appStyles.cardMediaShadowDark,
        { borderColor: colors.cardMediaGradientBorder },
      ]}
    >
      {children}
    </LinearGradient>
  );

  const creator = articleData.creator;
  const labelPaletteIndices = useMemo(() => {
    const count = articleData.labels?.length ?? 0;
    const paletteSize = 6; // keep in sync with `Label` palettes
    if (count <= 0) return [];

    const shuffle = (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const base = Array.from({ length: paletteSize }, (_, i) => i);
    const out = [];
    let last = null;

    while (out.length < count) {
      let chunk = shuffle(base);
      if (last !== null && chunk[0] === last && chunk.length > 1) {
        [chunk[0], chunk[1]] = [chunk[1], chunk[0]];
      }
      for (let i = 0; i < chunk.length && out.length < count; i += 1) {
        out.push(chunk[i]);
        last = chunk[i];
      }
    }

    return out;
  }, [articleData.labels]);

  return (
    <View style={styles.screen}>
      {renderGlassCard(
        <>
          <AppText namedStyle="h2" style={styles.title}>
            {articleData.title}
          </AppText>

          <View style={styles.metaRow}>
            {articleData.categoryName ? (
              <View style={[styles.categoryBadge, categoryBadgeStyle]}>
                <AppText
                  namedStyle="smallText"
                  style={[
                    styles.categoryBadgeText,
                    { color: categoryTextColor },
                  ]}
                >
                  {articleData.categoryName}
                </AppText>
              </View>
            ) : null}
            {creator ? (
              <AppText
                namedStyle="smallText"
                style={[styles.creatorText, { color: metaAccentColor }]}
                numberOfLines={1}
              >
                {t("by", { creator })}
              </AppText>
            ) : null}
            {creator ? (
              <View
                style={[styles.metaDot, { backgroundColor: metaAccentColor }]}
              />
            ) : null}
            <Icon name="time" size="sm" color={timeIconColor} />
            <AppText namedStyle="smallText" style={{ color: metaAccentColor }}>
              {articleData.readingTime} {t("min_read")}
            </AppText>
          </View>

          {articleData.labels?.length > 0 ? (
            <View style={styles.labelsRow}>
              {articleData.labels.map((label, index) => (
                <Label
                  key={label.id ?? index}
                  text={label.name}
                  paletteIndex={labelPaletteIndices[index] ?? index}
                  style={styles.labelChip}
                  textStyle={styles.labelChipText}
                  textProps={{ numberOfLines: 1, ellipsizeMode: "tail" }}
                />
              ))}
            </View>
          ) : null}

          <View
            style={[
              styles.separator,
              { backgroundColor: colors.cardMediaSeparator },
            ]}
          />

          <View style={styles.actionsRow}>
            <View style={styles.actionsLeft}>
              <Like
                size={30}
                handleClick={handleAddRating}
                likes={contentRating?.likes || 0}
                isLiked={contentRating?.isLikedByUser || false}
                dislikes={contentRating?.dislikes || 0}
                isDisliked={contentRating?.isDislikedByUser || false}
                answerId={articleData.id}
              />
            </View>
            <View style={styles.actionsRight}>
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={handleExportPDF}
                accessibilityRole="button"
              >
                {isPdfLoading ? (
                  <Loading style={styles.loadingIcon} />
                ) : (
                  <Icon name="download" size="sm" color={actionIconColor} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={handleShare}
                accessibilityRole="button"
              >
                <Icon name="share" size="sm" color={actionIconColor} />
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={[
              styles.separator,
              { backgroundColor: colors.cardMediaSeparator },
            ]}
          />

          <Image
            source={
              articleImageUri
                ? { uri: articleImageUri }
                : { uri: `${AMAZON_S3_BUCKET}/article-placeholder` }
            }
            style={styles.heroImage}
            resizeMode="cover"
          />

          {articleData?.ttsUrl ? (
            <AudioPlayer
              sourceUrl={articleData.ttsUrl}
              style={styles.audioPlayer}
            />
          ) : null}

          <View style={styles.body}>
            {articleData.bodyCK ? (
              <CKRenderer data={articleData.bodyCK} />
            ) : (
              <Markdown style={markdownStyles}>{articleData.body}</Markdown>
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  glassCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    padding: 16,
  },
  liquidGlassShadowLight: {
    shadowColor: "rgb(95, 108, 145)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    marginBottom: 16,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    alignItems: "center",
    borderRadius: 25,
    height: 24,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  categoryBadgeText: {
    fontFamily: appStyles.fontBold,
  },
  creatorText: {
    flexShrink: 1,
    maxWidth: "60%",
  },
  metaDot: {
    borderRadius: 2,
    height: 3,
    width: 3,
  },
  labelsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  labelChip: {
    marginBottom: 0,
    marginRight: 0,
    borderRadius: 4,
    paddingVertical: 0,
    paddingHorizontal: 16,
    maxHeight: 20,
    minHeight: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  labelChipText: {
    includeFontPadding: false,
    textAlignVertical: "center",
    lineHeight: 20,
  },
  separator: {
    height: 1,
    width: "100%",
  },
  actionsRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  actionsLeft: {
    alignItems: "center",
    flexDirection: "row",
  },
  actionsRight: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  actionIconBtn: {
    alignItems: "center",
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  loadingIcon: { height: 16, width: 16 },
  heroImage: {
    aspectRatio: 16 / 9,
    borderRadius: 12,
    marginTop: 20,
    maxHeight: 400,
    width: "100%",
  },
  audioPlayer: {
    marginBottom: 8,
    marginTop: 16,
  },
  body: {
    overflow: "hidden",
    paddingBottom: 16,
    paddingTop: 32,
  },
});

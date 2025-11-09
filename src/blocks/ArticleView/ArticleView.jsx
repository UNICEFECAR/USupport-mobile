import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { useQueryClient } from "@tanstack/react-query";
import Share from "react-native-share";
import { useTranslation } from "react-i18next";
import Config from "react-native-config";

import { Icon, Label, Block, AppText, Like, Loading } from "#components";
import { appStyles } from "#styles";

import { useGetTheme, useAddContentRating } from "#hooks";
import { cmsSvc } from "#services";
import { constructShareUrl, generatePDF, showToast } from "#utils";

const { AMAZON_S3_BUCKET } = Config;

/**
 * ArticleView
 *
 * ArticleView block
 *
 * @return {jsx}
 */
export const ArticleView = ({ articleData, isTmpUser }) => {
  const { t } = useTranslation("screens", { keyPrefix: "article-information" });
  const { colors } = useGetTheme();
  const queryClient = useQueryClient();

  const [contentRating, setContentRating] = React.useState(
    articleData.contentRating
  );
  useEffect(() => {
    setContentRating(articleData.contentRating);
  }, [articleData.contentRating]);

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
  };

  const addContentRatingMutation = useAddContentRating(
    onMutate,
    onError,
    onSuccess
  );

  const handleAddRating = (action) => {
    if (isTmpUser) return;
    addContentRatingMutation({
      contentId: articleData.id,
      positive:
        action === "like"
          ? true
          : action === "remove-like" || action === "remove-dislike"
            ? null
            : false,
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
      // If Share.open resolves without throwing, the share was successful
      showToast({ message: t("share_success"), type: "success" });
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

      console.log("PDF file object:", file);

      if (file && (file.base64 || file.filePath)) {
        // Android: consider PDF generated => downloaded; show toast now.
        if (Platform.OS === "android") {
          showToast({
            message: t("download_success"),
            type: "success",
          });
        }
        // Prefer file path on iOS, base64 on Android if available
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
          // iOS: detect cancel as an error so we can avoid showing the toast
          // Android: do not fail on cancel to avoid false negatives
          failOnCancel: Platform.OS === "ios",
        };
        try {
          await Share.open(shareOptions);
          // iOS: show toast only after user completes a share/save action
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
      } else {
        console.error("PDF file path is missing");
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

  return (
    <>
      <View style={styles.imageContainer}>
        <Image
          source={
            articleData.imageMedium
              ? { uri: articleData.imageMedium }
              : { uri: `${AMAZON_S3_BUCKET}/article-placeholder` }
          }
          style={styles.image}
        />
      </View>

      <Block style={styles.block}>
        <AppText namedStyle="h3" style={styles.articleTitleText}>
          {articleData.title}
        </AppText>

        <View style={styles.categoryContainer}>
          <AppText
            namedStyle="smallText"
            style={[styles.categoryText, { color: colors.text }]}
          >
            {articleData.categoryName}
          </AppText>
        </View>

        <View style={styles.creatorContainer}>
          <AppText namedStyle="smallText">
            {t("by", { creator: articleData.creator })}
          </AppText>
          <Icon
            size="sm"
            name="time"
            color={appStyles.colorGray_66768d}
            style={styles.iconTime}
          />
          <AppText namedStyle="smallText">
            {[articleData.readingTime, t("min_read")].join(" ")}
          </AppText>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleExportPDF}
              disabled={isPdfLoading}
            >
              {isPdfLoading ? (
                <Loading style={styles.loading} />
              ) : (
                <Icon name="download" size="sm" color={colors.text} />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Icon name="share" size="sm" color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.rowStart}>
          <View style={styles.labelsContainer}>
            {articleData.labels.map((label, index) => {
              return (
                <Label style={styles.label} text={label.name} key={index} />
              );
            })}
          </View>
          <Like
            handleClick={handleAddRating}
            likes={contentRating?.likes || 0}
            isLiked={contentRating?.isLikedByUser || false}
            dislikes={contentRating?.dislikes || 0}
            isDisliked={contentRating?.isDislikedByUser || false}
            answerId={articleData.id}
          />
        </View>

        <Markdown
          style={{
            ...styles,
            heading3: {
              fontSize: 20,
              lineHeight: 24,
              fontFamily: "Nunito-SemiBold",
              color: colors.text,
              marginTop: 20,
              marginBottom: 8,
            },
            heading4: {
              fontSize: 16,
              lineHeight: 24,
              fontFamily: "Nunito-SemiBold",
              color: colors.text,
              marginTop: 12,
            },
            paragraph: {
              color: colors.textSecondary,
              fontSize: 16,
              fontFamily: "Nunito-Regular",
              lineHeight: 24,
            },
            list_item: {
              color: colors.textSecondary,
              fontSize: 16,
              fontFamily: "Nunito-Regular",
              lineHeight: 24,
            },
          }}
        >
          {articleData.body}
        </Markdown>
      </Block>
    </>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    borderColor: appStyles.colorBlue_3d527b,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  actionButtons: {
    flexDirection: "row",
    marginLeft: "auto",
    marginRight: 16,
  },
  block: { paddingBottom: 40, paddingTop: 16 },
  categoryContainer: {
    alignSelf: "flex-start",
    backgroundColor: appStyles.colorBlue_20809E_0_3,
    borderRadius: 25,
    justifyContent: "center",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  categoryText: {
    color: appStyles.colorBlue_3d527b,
    fontFamily: appStyles.fontBold,
  },
  creatorContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 8,
  },
  iconTime: { marginLeft: 16, marginRight: 5 },
  image: { flex: 1 },
  imageContainer: { height: 264, position: "relative", width: "100%" },
  label: { marginBottom: 8, marginRight: 8, paddingVertical: 0 },
  labelsContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    width: "70%",
  },
  loading: { height: 16, width: 16 },
  rowStart: { alignItems: "flex-start", flexDirection: "row" },
});

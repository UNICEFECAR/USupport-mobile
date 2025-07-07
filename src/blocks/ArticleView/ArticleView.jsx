import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import Markdown from "react-native-markdown-display";
import { useQueryClient } from "@tanstack/react-query";
import Share from "react-native-share";
import { useTranslation } from "react-i18next";
import Config from "react-native-config";

import { Icon, Label, Block, AppText, Like, Loading } from "#components";
import { appStyles } from "#styles";

import { useGetTheme, useAddContentRating } from "#hooks";
import { cmsSvc } from "#services";
import { constructShareUrl, generatePDF } from "#utils";

const { AMAZON_S3_BUCKET } = Config;

/**
 * ArticleView
 *
 * ArticleView block
 *
 * @return {jsx}
 */
export const ArticleView = ({ articleData }) => {
  const { t } = useTranslation("article-information");
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
    toast.error(error);
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
    const url = await constructShareUrl({
      contentType: "article",
      id: articleData.id,
      name: articleData.title,
    });
    Share.open({
      title: articleData.title,
      message: `${t("check_article")}\n\n${url}`,
    });
  };
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const handleExportPDF = async () => {
    try {
      setIsPdfLoading(true);
      const file = await generatePDF({
        articleData,
        t,
      });
      if (file.filePath) {
        Share.open({
          title: articleData.title,
          message: "Here's the PDF version of the article",
          url: `file://${file.filePath}`,
          saveToFiles: true,
          type: "application/pdf",
        });
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
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
          <AppText namedStyle="smallText">By {articleData.creator}</AppText>
          <Icon
            size="sm"
            name="time"
            color={appStyles.colorGray_66768d}
            style={styles.iconTime}
          />
          <AppText namedStyle="smallText">
            {articleData.readingTime} min read
          </AppText>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleExportPDF}
              disabled={isPdfLoading}
            >
              {isPdfLoading ? (
                <Loading style={{ width: 16, height: 16 }} />
              ) : (
                <Icon name="download" size="sm" color={colors.text} />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Icon name="share" size="sm" color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
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
  block: { paddingBottom: 40, paddingTop: 16 },
  imageContainer: { width: "100%", height: 264, position: "relative" },
  image: { flex: 1 },

  labelsContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    width: "70%",
  },
  label: { marginRight: 8, marginBottom: 8, paddingVertical: 0 },
  creatorContainer: {
    flexDirection: "row",
    marginVertical: 8,
    alignItems: "center",
  },
  iconTime: { marginLeft: 16, marginRight: 5 },
  categoryContainer: {
    alignSelf: "flex-start",
    marginTop: 12,
    backgroundColor: appStyles.colorBlue_20809E_0_3,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 25,
    justifyContent: "center",
  },
  categoryText: {
    fontFamily: appStyles.fontBold,
    color: appStyles.colorBlue_3d527b,
  },
  actionButtons: {
    flexDirection: "row",
    marginLeft: "auto",
    marginRight: 16,
  },
  actionButton: {
    marginLeft: 16,
    borderWidth: 1,
    borderColor: appStyles.colorBlue_3d527b,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});

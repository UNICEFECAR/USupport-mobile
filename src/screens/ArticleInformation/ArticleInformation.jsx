import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { Screen, CardMedia, Block, Loading, AppText, Icon } from "#components";

import { ArticleView } from "#blocks";

import { cmsSvc, adminSvc, userSvc, clientSvc } from "#services";

import { destructureArticleData, checkIsLikedAndDisliked } from "#utils";

import { useGetUserContentRatings } from "#hooks";

import { appStyles } from "#styles";

/**
 * ArticleInformation
 *
 * ArticleInformation screen
 *
 * @return {jsx}
 */
export const ArticleInformation = ({ navigation, route }) => {
  const id = route.params.articleId;

  const { i18n, t } = useTranslation("screens", {
    keyPrefix: "article-information",
  });
  const { data: userContentRatings } = useGetUserContentRatings();
  const getArticlesIds = async () => {
    // Request articles ids from the master DB based for website platform
    const articlesIds = await adminSvc.getArticles();

    return articlesIds;
  };

  const articleIdsQuerry = useQuery(["articleIds"], getArticlesIds);

  const getArticleData = async () => {
    let articleIdToFetch = id;

    const contentRatings = await userSvc.getRatingsForContent({
      contentType: "article",
      contentId: articleIdToFetch,
    });
    const { data } = await cmsSvc.getArticleById(
      articleIdToFetch,
      i18n.language
    );

    const finalData = destructureArticleData(data);
    finalData.contentRating = contentRatings.data;
    return finalData;
  };

  const { data: articleData, isFetching: isFetchingArticleData } = useQuery(
    ["article", i18n.language, id],
    getArticleData,
    {
      enabled: !!id,
      onSuccess: (data) => {
        // Add category interaction when article is successfully fetched
        if (data && data.categoryId) {
          clientSvc
            .addClientCategoryInteraction({
              categoryId: data.categoryId,
              articleId: data.id,
              tagIds: data.labels?.map((label) => label.id) || [],
            })
            .catch((error) => {
              console.error("Failed to track category interaction:", error);
            });
        }
      },
    }
  );

  const getSimilarArticles = async () => {
    if (!articleData?.categoryId) return [];

    try {
      // If no results in current category, get category interactions to try other categories
      const { data: categoryInteractions } =
        await clientSvc.getCategoryInteractions();
      const readArticleIds = [
        ...categoryInteractions.map((x) => Number(x.article_id)),
        Number(articleData.id),
      ];

      const articles = [];

      // First try current category
      const currentCategoryResult =
        await cmsSvc.getRecommendedArticlesForCategory({
          categoryId: articleData.categoryId,
          categoryWeight: 1,
          page: 1,
          limit: 3,
          language: i18n.language,
          excludeIds: readArticleIds,
          countryArticleIds: articleIdsQuerry.data,
          tagIds: articleData.labels.map((label) => label.id),
          ageGroupId: articleData.ageGroupId,
        });

      if (
        currentCategoryResult.success &&
        currentCategoryResult.data?.length > 0
      ) {
        articles.push(...currentCategoryResult.data);
      }

      if (articles.length >= 3) {
        return articles;
      }

      if (categoryInteractions?.data?.length > 0) {
        // Build category interaction map and sort by weight
        const categoryInteractionMap = new Map();
        categoryInteractions.data.forEach((interaction) => {
          const {
            category_id: categoryId,
            count,
            tag_ids: tagIds,
          } = interaction;
          if (categoryId !== articleData.categoryId) {
            // Skip current category
            if (categoryInteractionMap.has(categoryId)) {
              categoryInteractionMap.set(categoryId, {
                count: categoryInteractionMap.get(categoryId).count + count,
                tagIds: [
                  ...categoryInteractionMap.get(categoryId).tagIds,
                  ...tagIds,
                ],
              });
            } else {
              categoryInteractionMap.set(categoryId, {
                count: count,
                tagIds: tagIds,
              });
            }
          }
        });

        // Sort categories by interaction count
        const sortedCategories = Array.from(categoryInteractionMap.entries())
          .map(([categoryId, data]) => ({
            categoryId,
            categoryWeight: data.count,
            tagIds: data.tagIds,
          }))
          .sort((a, b) => b.categoryWeight - a.categoryWeight);

        // Try each category in order of interaction weight
        for (const category of sortedCategories) {
          const result = await cmsSvc.getRecommendedArticlesForCategory({
            categoryId: category.categoryId,
            categoryWeight: category.categoryWeight,
            page: 1,
            limit: 3 - articles.length,
            language: i18n.language,
            excludeIds: readArticleIds,
            countryArticleIds: articleIdsQuerry.data,
            tagIds: category.tagIds,
            ageGroupId: articleData.ageGroupId,
          });

          if (result.success && result.data?.length > 0) {
            articles.push(...result.data);
            readArticleIds.push(...result.data.map((x) => x.id));
            console.log(readArticleIds, "READ");
            if (articles.length >= 3) {
              return articles;
            }
          }
        }
      }

      // If still no results, fall back to newest articles
      const { data: newest } = await cmsSvc.getArticles({
        limit: 3 - articles.length,
        sortBy: "createdAt",
        sortOrder: "desc",
        locale: i18n.language,
        excludeIds: readArticleIds,
        populate: true,
        ids: articleIdsQuerry.data,
        ageGroupId: articleData.ageGroupId,
      });
      return [...articles, ...newest.data];
    } catch (error) {
      console.error("Error fetching similar articles:", error);
      return [];
    }
  };

  const {
    data: moreArticles,
    isLoading: isMoreArticlesLoading,
    isFetched: isMoreArticlesFetched,
  } = useQuery(["more-articles", id, i18n.language], getSimilarArticles, {
    enabled:
      !isFetchingArticleData &&
      !articleIdsQuerry.isLoading &&
      articleIdsQuerry.data?.length > 0 &&
      articleData &&
      articleData.categoryId
        ? true
        : false,
  });

  return (
    <Screen>
      <TouchableOpacity
        style={styles.goBackIconContainer}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-chevron-back" color={appStyles.colorPrimary_20809e} />
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false}>
        {articleData ? (
          <ArticleView articleData={articleData} navigation={navigation} />
        ) : (
          <View style={styles.loadingContainer}>
            <Loading size="lg" />
          </View>
        )}

        {!isMoreArticlesLoading && moreArticles.length > 0 && (
          <Block classes="page__article-information__more-articles">
            <AppText namedStyle="h3" style={styles.moreArticlesHeading}>
              {t("heading")}
            </AppText>
            {moreArticles.map((article, index) => {
              const articleData = destructureArticleData(
                article.data ? article.data : article
              );
              const { isLikedByUser, isDislikedByUser } =
                checkIsLikedAndDisliked(userContentRatings, article.id);
              return (
                <CardMedia
                  title={articleData.title}
                  image={articleData.imageMedium}
                  description={articleData.description}
                  labels={articleData.labels}
                  creator={articleData.creator}
                  readingTime={articleData.readingTime}
                  categoryName={articleData.categoryName}
                  likes={articleData.likes}
                  dislikes={articleData.dislikes}
                  isLikedByUser={isLikedByUser}
                  isDislikedByUser={isDislikedByUser}
                  onPress={() => {
                    navigation.push("ArticleInformation", {
                      articleId: articleData.id,
                    });
                  }}
                  t={t}
                  key={index}
                  style={styles.cardMedia}
                />
              );
            })}
            {!moreArticles && isMoreArticlesLoading && <Loading size="lg" />}
            {!moreArticles?.length &&
              !isMoreArticlesLoading &&
              isMoreArticlesFetched && (
                <AppText
                  namedStyle="h3"
                  className="page__article-information__no-results"
                >
                  {t("no_results")}
                </AppText>
              )}
          </Block>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  goBackIconContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: 2,
    backgroundColor: appStyles.colorWhite_ff,
    borderRadius: 50,
    borderWidht: 1,
    borderColor: "transparent",
    ...appStyles.shadow_1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  moreArticlesHeading: {
    marginTop: 40,
    marginBottom: 24,
    alignSelf: "center",
  },
  cardMedia: { marginBottom: 24, alignSelf: "center" },
  loadingContainer: {
    height: 264,
    justifyContent: "center",
    alignItems: "center",
  },
});

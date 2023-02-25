import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ScrollView, StyleSheet, View } from "react-native";

import { Screen, CardMedia, Block, Loading, AppText } from "#components";

import { ArticleView } from "#blocks";

import { cmsSvc, adminSvc } from "#services";

import { destructureArticleData } from "#utils";

/**
 * ArticleInformation
 *
 * ArticleInformation screen
 *
 * @return {jsx}
 */
export const ArticleInformation = ({ navigation, route }) => {
  const id = route.params.articleId;

  const { i18n, t } = useTranslation("article-information");

  const getArticlesIds = async () => {
    // Request articles ids from the master DB based for website platform
    const articlesIds = await adminSvc.getArticles();

    return articlesIds;
  };

  const articleIdsQuerry = useQuery(["articleIds"], getArticlesIds);

  const getArticleData = async () => {
    let articleIdToFetch = id;

    const { data } = await cmsSvc.getArticleById(
      articleIdToFetch,
      i18n.language
    );

    const finalData = destructureArticleData(data);
    return finalData;
  };

  const { data: articleData, isFetching: isFetchingArticleData } = useQuery(
    ["article", i18n.language, id],
    getArticleData,
    {
      enabled: !!id,
    }
  );

  const getSimilarArticles = async () => {
    let { data } = await cmsSvc.getArticles({
      limit: 3,
      categoryId: articleData.categoryId,
      locale: i18n.language,
      excludeId: articleData.id,
      populate: true,
      ids: articleIdsQuerry.data,
    });

    if (data.length === 0) {
      let { data: newest } = await cmsSvc.getArticles({
        limit: 3,
        sortBy: "createdAt", // Sort by created date
        sortOrder: "desc", // Sort in descending order
        locale: i18n.language,
        excludeId: articleData.id,
        populate: true,
        ids: articleIdsQuerry.data,
      });
      return newest.data;
    }
    return data.data;
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
              const articleData = destructureArticleData(article);
              return (
                <CardMedia
                  title={articleData.title}
                  image={articleData.imageMedium}
                  description={articleData.description}
                  labels={articleData.labels}
                  creator={articleData.creator}
                  readingTime={articleData.readingTime}
                  categoryName={articleData.categoryName}
                  onPress={() => {
                    navigation.push("ArticleInformation", {
                      articleId: articleData.id,
                    });
                  }}
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

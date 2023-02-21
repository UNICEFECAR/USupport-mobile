import React, { useCallback, useState, useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { Block, AppText, Loading, CardMedia } from "#components";

import { appStyles } from "#styles";

import { destructureArticleData } from "#utils";

import { useEventListener } from "#hooks";

import { localStorage, adminSvc, cmsSvc } from "#services";

/**
 * InformationPortal
 *
 * Information Portal block
 *
 * @returns {JSX.Element}
 */
export const InformationalPortal = ({ navigation }) => {
  const { t, i18n } = useTranslation("information-portal");

  //--------------------- Country Change Event Listener ----------------------//
  const [currentCountry, setCurrentCountry] = useState();
  useEffect(() => {
    localStorage.getItem("country").then((country) => {
      setCurrentCountry(country || "KZ");
    });
  }, []);

  const handler = useCallback(() => {
    localStorage
      .getItem("country")
      .then((country) => setCurrentCountry(country || "KZ"));
  }, []);

  // Add event listener
  useEventListener("countryChanged", handler);

  //--------------------- Articles ----------------------//

  const getArticlesIds = async () => {
    // Request articles ids from the master DB based for website platform
    const articlesIds = await adminSvc.getArticles();

    return articlesIds;
  };

  const articleIdsQuerry = useQuery(
    ["articleIds", currentCountry],
    getArticlesIds,
    {
      enabled: !!currentCountry,
    }
  );
  //--------------------- Newest Article ----------------------//

  const getNewestArticle = async () => {
    let { data } = await cmsSvc.getArticles({
      limit: 2, // Only get the newest article
      sortBy: "createdAt", // Sort by created date
      sortOrder: "desc", // Sort in descending order
      locale: i18n.language,
      populate: true,
      ids: articleIdsQuerry.data,
    });
    for (let i = 0; i < data.data.length; i++) {
      data.data[i] = destructureArticleData(data.data[i]);
    }

    return data.data;
  };

  const {
    data: newestArticles,
    isLoading: newestArticlesLoading,
    isFetched: isNewestArticlesFetched,
  } = useQuery(
    ["newestArticle", i18n.language, articleIdsQuerry.data],
    getNewestArticle,
    {
      enabled: !articleIdsQuerry.isLoading && articleIdsQuerry.data?.length > 0,

      refetchOnWindowFocus: false,
    }
  );

  //--------------------- Most Read Articles ----------------------//

  const getMostReadArticles = async () => {
    let { data } = await cmsSvc.getArticles({
      limit: 2, // Only get the newest article
      sortBy: "read_count", // Sort by created date
      sortOrder: "desc", // Sort in descending order
      locale: i18n.language,
      populate: true,
      ids: articleIdsQuerry.data,
    });

    for (let i = 0; i < data.data.length; i++) {
      data.data[i] = destructureArticleData(data.data[i]);
    }
    return data.data;
  };

  const {
    data: mostReadArticles,
    isLoading: mostReadArticlesLoading,
    isFetched: isMostReadArticlesFetched,
  } = useQuery(
    ["mostReadArticles", i18n.language, articleIdsQuerry.data],
    getMostReadArticles,
    {
      enabled: !articleIdsQuerry.isLoading && articleIdsQuerry.data?.length > 0,

      refetchOnWindowFocus: false,
    }
  );

  const handleRedirect = (sort) =>
    sort === "createdAt"
      ? navigation.push("Articles", { sort: "createdAt" })
      : navigation.push("Articles", { sort: "read_count" });

  return (
    <Block style={styles.informationalPortalBlock}>
      {isNewestArticlesFetched &&
      isMostReadArticlesFetched &&
      newestArticles?.length === 0 &&
      mostReadArticles?.length === 0 ? (
        <AppText namedStyle="h3">{t("heading_no_language_results")}</AppText>
      ) : null}

      <View style={styles.headingContainer}>
        <AppText namedStyle="h3">{t("heading_newest")}</AppText>
        <AppText
          style={styles.viewAllText}
          onPress={() => handleRedirect("createdAt")}
        >
          {t("view_all")}
        </AppText>
      </View>

      {newestArticlesLoading ? (
        <View style={styles.loadingContainer}>
          <Loading style={styles.loading} />
        </View>
      ) : null}

      {!newestArticlesLoading && newestArticles?.length > 0 ? (
        <View style={styles.articlesContainer}>
          {newestArticles?.map((article, index) => {
            return (
              <CardMedia
                title={article.title}
                image={article.imageMedium}
                description={article.description}
                labels={article.labels}
                creator={article.creator}
                readingTime={article.readingTime}
                categoryName={article.categoryName}
                onPress={() => {
                  navigation.push("ArticleInformation", {
                    articleId: article.id,
                  });
                }}
                key={index}
                style={styles.article}
              />
            );
          })}
        </View>
      ) : null}

      <View style={styles.headingContainer}>
        <AppText namedStyle="h3">{t("heading_popular")}</AppText>
        <AppText
          style={styles.viewAllText}
          onPress={() => handleRedirect("read_count")}
        >
          {t("view_all")}
        </AppText>
      </View>

      {mostReadArticlesLoading ? (
        <View style={styles.loadingContainer}>
          <Loading style={styles.loading} />
        </View>
      ) : null}

      {!mostReadArticlesLoading && mostReadArticles?.length > 0 ? (
        <View style={styles.articlesContainer}>
          {mostReadArticles?.map((article, index) => {
            return (
              <CardMedia
                title={article.title}
                image={article.imageMedium}
                description={article.description}
                labels={article.labels}
                creator={article.creator}
                readingTime={article.readingTime}
                categoryName={article.categoryName}
                onPress={() => {
                  navigation.push("ArticleInformation", {
                    articleId: article.id,
                  });
                }}
                key={index}
                style={styles.article}
              />
            );
          })}
        </View>
      ) : null}
    </Block>
  );
};

const styles = StyleSheet.create({
  informationalPortalBlock: { paddingTop: 40 },
  headingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewAllText: {
    color: appStyles.colorSecondary_9749fa,
  },
  loading: { alignSelf: "center" },
  articlesContainer: { alignItems: "center", paddingTop: 16 },
  article: { marginBottom: 24 },
  loadingContainer: {
    minHeight: 220,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

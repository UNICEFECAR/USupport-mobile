import React, {
  useState,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Keyboard,
  useWindowDimensions,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Screen,
  AppText,
  TabsUnderlined,
  CardMedia,
  Loading,
} from "#components";
import {
  GiveSuggestion,
  InformationPortalHero,
  Articles as ArticlesBlock,
  Videos as VideosBlock,
  Podcasts as PodcastsBlock,
} from "#blocks";
import { appStyles } from "#styles";
import { useDebounce, useGetTheme } from "#hooks";
import { adminSvc, cmsSvc, Context } from "#services";
import { destructureArticleData, getLikesAndDislikesForContent } from "#utils";

/**
 * InformationPortal
 *
 * Information Portal screen
 *
 * @returns {JSX.Element}
 */
export const InformationalPortal = ({ navigation, route }) => {
  const { isDarkMode } = useGetTheme();
  const { t } = useTranslation("screens", {
    keyPrefix: "informational-portal-screen",
  });
  const { t: tArticlesScreen } = useTranslation("screens", {
    keyPrefix: "articles-screen",
  });
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef(null);
  const [giveSuggestionLayout, setGiveSuggestionLayout] = useState(null);
  const { height: windowHeight } = useWindowDimensions();

  const { isPodcastsActive, isVideosActive } = useContext(Context);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500);

  // Content type tabs — same order as client-ui InformationPortal: articles, videos, podcasts
  const [contentTabs, setContentTabs] = useState([
    { label: "articles", value: "articles", isSelected: true },
  ]);

  useEffect(() => {
    const requestedTab = route?.params?.tab;
    const tabs = [{ label: "articles", value: "articles", isSelected: false }];
    if (isVideosActive) {
      tabs.push({ label: "videos", value: "videos", isSelected: false });
    }
    if (isPodcastsActive) {
      tabs.push({ label: "podcasts", value: "podcasts", isSelected: false });
    }

    let selected = "articles";
    if (
      requestedTab === "videos" &&
      isVideosActive &&
      tabs.some((x) => x.value === "videos")
    ) {
      selected = "videos";
    } else if (
      requestedTab === "podcasts" &&
      isPodcastsActive &&
      tabs.some((x) => x.value === "podcasts")
    ) {
      selected = "podcasts";
    } else if (requestedTab === "articles") {
      selected = "articles";
    }

    tabs.forEach((tab) => {
      tab.isSelected = tab.value === selected;
    });
    setContentTabs(tabs);
  }, [isPodcastsActive, isVideosActive, route?.params?.tab]);

  const handleTabSelect = (index) => {
    const tabsCopy = [...contentTabs];
    tabsCopy.forEach((tab, i) => {
      tab.isSelected = i === index;
    });
    setContentTabs(tabsCopy);
    setSearchValue("");
    const nextTab = tabsCopy[index]?.value;
    if (nextTab && navigation?.setParams) {
      navigation.setParams({ tab: nextTab });
    }
  };

  const selectedContentType =
    contentTabs.find((tab) => tab.isSelected)?.value || "articles";

  const mostReadArticleQuery = useQuery({
    queryKey: [
      "information-portal-most-read-article",
      selectedContentType,
      debouncedSearchValue,
    ],
    queryFn: async () => {
      if (debouncedSearchValue?.trim()) return null;

      const ids = await adminSvc.getArticles();
      if (!ids?.length) return null;

      const { data } = await cmsSvc.getArticles({
        limit: 1,
        sortBy: "read_count",
        sortOrder: "desc",
        locale: "en",
        populate: true,
        ids,
      });

      const raw = data?.data?.[0];
      if (!raw) return null;

      const article = destructureArticleData(raw);
      const { likes, dislikes } = await getLikesAndDislikesForContent(
        [article.id],
        "article"
      );

      return {
        ...article,
        likes: likes.get(article.id) ?? 0,
        dislikes: dislikes.get(article.id) ?? 0,
      };
    },
    enabled:
      selectedContentType === "articles" && !debouncedSearchValue?.trim(),
    refetchOnWindowFocus: false,
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    queryClient.invalidateQueries().finally(() => {
      setRefreshing(false);
    });
  }, [queryClient]);

  const heading = (
    <View>
      <AppText
        namedStyle="h3"
        style={[styles.heading, isDarkMode && styles.darkModeText]}
      >
        {t("heading")}
      </AppText>
      <AppText style={[styles.subheading, isDarkMode && styles.darkModeText]}>
        {t("subheading")}
      </AppText>
    </View>
  );

  const handleGiveSuggestionFocus = () => {
    if (
      Platform.OS !== "android" ||
      !giveSuggestionLayout ||
      !scrollViewRef.current
    ) {
      return;
    }

    const subscription = Keyboard.addListener("keyboardDidShow", (e) => {
      subscription.remove();
      const keyboardHeight = e.endCoordinates.height;
      const visibleHeight = windowHeight - keyboardHeight;
      const scrollY = Math.max(
        0,
        giveSuggestionLayout.y +
          giveSuggestionLayout.height -
          visibleHeight +
          56
      );
      scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
    });
  };

  return (
    <Screen hasHeaderNavigation t={t} hasEmergencyButton={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "position" : "height"}
        keyboardVerticalOffset={64}
      >
        <ScrollView
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          <InformationPortalHero
            navigation={navigation}
            showSearch={true}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            placeholder={t("search")}
          />

          {/* <View style={styles.headingBlock}>{heading}</View> */}

          {contentTabs.length > 1 && (
            <View style={styles.tabsContainer}>
              <TabsUnderlined
                options={contentTabs.map((x) => ({
                  ...x,
                  label: t(x.label),
                }))}
                handleSelect={handleTabSelect}
              />
            </View>
          )}

          {selectedContentType === "articles" && (
            <>
              {!searchValue?.trim() && (
                <View style={styles.mostReadContainer}>
                  {mostReadArticleQuery.isLoading ? (
                    <View style={styles.mostReadLoadingContainer}>
                      <Loading />
                    </View>
                  ) : mostReadArticleQuery.data ? (
                    <>
                      <AppText namedStyle="h2" style={styles.mostReadHeading}>
                        {tArticlesScreen("heading_most_read", {
                          defaultValue: "Most read Articles",
                        })}
                      </AppText>
                      <View style={styles.mostReadCardContainer}>
                        <CardMedia
                          title={mostReadArticleQuery.data.title}
                          image={
                            mostReadArticleQuery.data.imageMedium ||
                            mostReadArticleQuery.data.imageThumbnail ||
                            mostReadArticleQuery.data.imageSmall
                          }
                          description={mostReadArticleQuery.data.description}
                          labels={mostReadArticleQuery.data.labels}
                          creator={mostReadArticleQuery.data.creator}
                          readingTime={mostReadArticleQuery.data.readingTime}
                          categoryName={mostReadArticleQuery.data.categoryName}
                          likes={mostReadArticleQuery.data.likes || 0}
                          dislikes={mostReadArticleQuery.data.dislikes || 0}
                          isLikedByUser={false}
                          isDislikedByUser={false}
                          isRead={false}
                          t={t}
                          onPress={() =>
                            navigation.push("ArticleInformation", {
                              articleId: mostReadArticleQuery.data.id,
                            })
                          }
                          style={styles.mostReadCard}
                        />
                      </View>
                    </>
                  ) : null}
                </View>
              )}
              <ArticlesBlock
                navigation={navigation}
                showSearch={false}
                showCategories={true}
                externalSearchValue={debouncedSearchValue}
                topSpacing={0}
              />
            </>
          )}

          {selectedContentType === "videos" && (
            <VideosBlock
              showSearch={false}
              showCategories={true}
              externalSearchValue={debouncedSearchValue}
              topPadding={0}
            />
          )}

          {selectedContentType === "podcasts" && (
            <PodcastsBlock
              navigation={navigation}
              showSearch={false}
              showCategories={true}
              externalSearchValue={debouncedSearchValue}
              topPadding={0}
            />
          )}
          <View
            onLayout={(e) => setGiveSuggestionLayout(e.nativeEvent.layout)}
            collapsable={false}
            // style={{ marginBottom: 200 }}
          >
            <GiveSuggestion
              navigation={navigation}
              onTextareaFocus={handleGiveSuggestionFocus}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  headingBlock: { paddingTop: 18, paddingHorizontal: 16 },
  heading: { color: appStyles.colorBlue_263238 },
  subheading: { marginTop: 16, color: appStyles.colorBlue_263238 },
  darkModeText: { color: appStyles.colorWhite_ff },

  scrollView: {
    paddingTop: 30,
  },
  tabsContainer: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
  mostReadContainer: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  mostReadHeading: {
    marginBottom: 16,
    textAlign: "center",
    width: "100%",
  },
  mostReadCardContainer: {
    alignItems: "center",
  },
  mostReadCard: {
    marginBottom: 24,
  },
  mostReadLoadingContainer: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
  },
});

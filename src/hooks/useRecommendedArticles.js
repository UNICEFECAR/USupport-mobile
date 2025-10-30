import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { cmsSvc, clientSvc, adminSvc } from "#services";

export const useRecommendedArticles = ({
  enabled = true,
  limit = 10,
  page = 1,
  ageGroupId = null, // New parameter for age group filtering
  categoryIdFilter = null,
  searchValue = "", // New parameter for search
  availableCategories,
} = {}) => {
  const { i18n } = useTranslation();
  const [allFetchedArticles, setAllFetchedArticles] = useState([]);
  const [categoryResults, setCategoryResults] = useState(new Map());
  const [remainingArticles, setRemainingArticles] = useState([]);
  const [fetchingCategories, setFetchingCategories] = useState(new Set());
  const [fetchingRemaining, setFetchingRemaining] = useState(false);
  const [remainingPage, setRemainingPage] = useState(1);
  const [allArticlesPage, setAllArticlesPage] = useState(1); // Separate page tracking for when no categories exist
  const [hasMoreRemaining, setHasMoreRemaining] = useState(false);
  const [fetchedRemainingIds, setFetchedRemainingIds] = useState([]); // Track fetched remaining article IDs
  const [readArticles, setReadArticles] = useState([]); // Track already read articles when no more unread
  const [fetchedReadIds, setFetchedReadIds] = useState([]); // Track fetched read article IDs
  const [hasMoreRead, setHasMoreRead] = useState(false); // Whether there are more read articles to fetch
  const [readPage, setReadPage] = useState(1); // Page tracking for read articles
  const [categoryFilteredArticles, setCategoryFilteredArticles] = useState([]); // For category-specific filtering
  const [fetchedAllArticlesIds, setFetchedAllArticlesIds] = useState([]); // Track fetched article IDs for all articles
  const [readArticleIds, setReadArticleIds] = useState([]); // Track fetched read article IDs
  const [categorySortedData, setCategorySortedData] = useState({
    categories: undefined,
    interactedArticleIds: [],
  }); // Initialize as undefined to detect first load

  // Use ref to track if we've already initiated fetching for current category list
  const categoriesFetchKeyRef = useRef(null);

  const { data: countryArticles, isLoading: isLoadingCountryArticles } =
    useQuery(["countryArticles"], () => adminSvc.getArticles());

  // Get category interactions
  const { data: categoryInteractions, isLoading: isLoadingInteractions } =
    useQuery(
      ["categoryInteractions"],
      () => clientSvc.getCategoryInteractions(),
      {
        enabled: enabled && !isLoadingCountryArticles,
      }
    );
  console.log("availableCategories", availableCategories);
  // Process and sort categories by interaction count
  useEffect(() => {
    if (!categoryInteractions) return;

    const categoryInteractionMap = new Map();
    const interactedArticleIds = new Set();

    // If no interactions data, set empty state to trigger fallback to all articles
    if (!categoryInteractions.data || categoryInteractions.data.length === 0) {
      setCategorySortedData({
        categories: [],
        interactedArticleIds: [],
      });
      return;
    }

    const allReadArticleIds = [];
    // Build category interaction map
    categoryInteractions.data.forEach((interaction) => {
      const {
        category_id: categoryId,
        article_id: articleId,
        count,
        tag_ids: tagIds,
      } = interaction;

      if (articleId) {
        allReadArticleIds.push(articleId);
      }

      if (categoryInteractionMap.has(categoryId)) {
        categoryInteractionMap.set(categoryId, {
          count: categoryInteractionMap.get(categoryId).count + count,
          articleIds: [
            ...categoryInteractionMap.get(categoryId).articleIds,
            articleId,
          ],
          tagIds: [
            ...(categoryInteractionMap.get(categoryId)?.tagIds || []),
            ...tagIds,
          ],
        });
      } else {
        categoryInteractionMap.set(categoryId, {
          count: count,
          articleIds: [articleId],
          tagIds,
        });
      }
      if (articleId) {
        interactedArticleIds.add(articleId);
      }
    });

    setReadArticleIds(allReadArticleIds);

    // Sort categories by interaction count (descending)
    const sortedCategories = Array.from(categoryInteractionMap.entries())
      .map(([categoryId, data]) => ({
        categoryId,
        categoryWeight: data.count,
        articleIds: data.articleIds,
        tagIds: data.tagIds,
      }))
      .sort((a, b) => b.categoryWeight - a.categoryWeight)
      .filter((category) => {
        // Always filter by availableCategories if provided, regardless of categoryIdFilter
        // This ensures that when age group changes, categories are filtered correctly
        if (availableCategories && availableCategories.length > 0) {
          return availableCategories.includes(category.categoryId);
        }
        // If availableCategories is not provided or empty, include all categories
        return true;
      });

    setCategorySortedData({
      categories: sortedCategories,
      interactedArticleIds: Array.from(interactedArticleIds),
    });
  }, [categoryInteractions, availableCategories, categoryIdFilter]);

  // Fetch all articles when no category interactions exist (with pagination)
  const fetchAllArticles = async (pageNum = 1) => {
    if (!countryArticles?.length) return;

    // Prevent double fetch
    if (fetchingRemaining) {
      return;
    }

    // Build exclusion list
    const excludeIds = [
      ...(categorySortedData.categories || []).flatMap(
        (cat) => cat.articleIds || []
      ), // category-based
      ...(categorySortedData.interactedArticleIds || []), // interacted
      ...fetchedAllArticlesIds, // already fetched remaining
    ];
    const remainingIds = countryArticles.filter(
      (id) => !excludeIds.includes(Number(id))
    );
    const startIndex = (pageNum - 1) * limit;
    const endIndex = startIndex + limit;
    const idsToFetch = remainingIds.slice(startIndex, endIndex);

    if (idsToFetch.length === 0) {
      setHasMoreRemaining(false);
      setFetchingRemaining(false);
      return;
    }

    setFetchingRemaining(true);

    try {
      const { data: articlesData } = await cmsSvc.getArticles({
        ids: idsToFetch,
        locale: i18n.language,
        populate: true,
        limit: idsToFetch.length,
        ...(ageGroupId && { ageGroupId }),
        ...(searchValue && { contains: searchValue }),
      });

      if (!articlesData.data || articlesData.data.length === 0) {
        setHasMoreRemaining(false);
        setFetchingRemaining(false);
        return;
      }

      const articlesWithScore = articlesData.data.map((article) => ({
        data: {
          ...article,
          id: article.id,
        },
        categoryWeight: 0,
        recommendationScore: 0,
      }));

      if (pageNum === 1) {
        setRemainingArticles(articlesWithScore);
        setFetchedAllArticlesIds(idsToFetch);
      } else {
        setRemainingArticles((prev) => [...prev, ...articlesWithScore]);
        setFetchedAllArticlesIds((prev) => [...prev, ...idsToFetch]);
      }

      // If we fetched less than the limit, there are no more articles
      setHasMoreRemaining(idsToFetch.length === limit);
    } catch (error) {
      console.warn("[fetchAllArticles] Error fetching all articles:", error);
      setHasMoreRemaining(false);
    } finally {
      setFetchingRemaining(false);
    }
  };

  // Fetch articles for a single category
  const fetchCategoryArticles = async (category) => {
    if (!countryArticles?.length) return;

    // Prevent duplicate fetches - check if already fetching or already fetched
    if (fetchingCategories.has(category.categoryId)) {
      return;
    }
    if (categoryResults.has(category.categoryId)) {
      return;
    }

    const articlesPerCategory = Math.max(
      Math.ceil((limit * 2) / categorySortedData.categories.length),
      10
    );

    setFetchingCategories((prev) => new Set([...prev, category.categoryId]));

    try {
      const result = await cmsSvc.getRecommendedArticlesForCategory({
        categoryId: category.categoryId,
        categoryWeight: category.categoryWeight,
        page: 1,
        limit: articlesPerCategory,
        language: i18n.language,
        excludeIds: categorySortedData.interactedArticleIds,
        countryArticleIds: countryArticles,
        tagIds: category.tagIds,
        ...(ageGroupId && { ageGroupId }), // Add age group filter if provided
        ...(searchValue && { contains: searchValue }),
      });

      if (result.success && result.data) {
        setCategoryResults((prev) => {
          const newResults = new Map(prev);
          newResults.set(category.categoryId, {
            articles: result.data,
            categoryWeight: category.categoryWeight,
            categoryId: category.categoryId,
            tagIds: category.tagIds,
          });
          return newResults;
        });

        console.log(
          `Category ${category.categoryId} fetched: ${result.data.length} articles`
        );
      }
    } catch (error) {
      console.error(`Error fetching category ${category.categoryId}:`, error);
    } finally {
      setFetchingCategories((prev) => {
        const newSet = new Set(prev);
        newSet.delete(category.categoryId);
        return newSet;
      });
    }
  };

  // Fetch all articles for a specific category (with read articles at bottom)
  const fetchAllCategoryArticles = async () => {
    if (!countryArticles?.length || !categoryIdFilter) return;

    setFetchingRemaining(true);

    try {
      // Fetch all articles for this category
      const { data: allCategoryArticlesData } = await cmsSvc.getArticles({
        ids: countryArticles,
        locale: i18n.language,
        populate: true,
        categoryId: categoryIdFilter,
        tagIds: categoryResults.get(categoryIdFilter)?.tagIds || [],
        ...(ageGroupId && { ageGroupId }),
        ...(searchValue && { contains: searchValue }),
        limit: 1000, // Get all articles for this category
      });

      if (allCategoryArticlesData?.data) {
        const interactedIds = categorySortedData.interactedArticleIds || [];

        // Separate articles into read and unread
        const unreadArticles = [];
        const readArticles = [];

        allCategoryArticlesData.data.forEach((article) => {
          const articleData = {
            data: {
              ...article,
              id: article.id,
            },
            categoryWeight: 1,
            recommendationScore: interactedIds.includes(article.id) ? 0.1 : 1, // Lower score for read articles
          };

          if (interactedIds.includes(article.id)) {
            readArticles.push(articleData);
          } else {
            unreadArticles.push(articleData);
          }
        });

        // Sort unread articles by recommendation score (highest first)
        unreadArticles.sort(
          (a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0)
        );

        // Combine: unread first, then read articles at bottom
        const sortedArticles = [...unreadArticles, ...readArticles];

        setCategoryFilteredArticles(sortedArticles);
      }
    } catch (error) {
      console.warn("Error fetching category articles:", error);
    } finally {
      setFetchingRemaining(false);
    }
  };

  // Start fetching categories one by one when data is ready
  useEffect(() => {
    // Wait for categorySortedData to be initialized (can be empty array, but not undefined)
    if (categorySortedData.categories === undefined || !countryArticles?.length)
      return;

    // Create a unique key for the current category list to detect when it actually changes
    const categoriesKey = JSON.stringify(
      (categorySortedData.categories || []).map((c) => c.categoryId).sort()
    );
    const currentFetchKey = `${categoriesKey}-${categoryIdFilter}-${ageGroupId}-${searchValue}-${
      i18n.language
    }-${JSON.stringify(availableCategories || [])}`;

    // If we've already initiated fetching for this exact configuration, skip
    if (categoriesFetchKeyRef.current === currentFetchKey) {
      return;
    }

    // Mark that we're fetching for this configuration
    categoriesFetchKeyRef.current = currentFetchKey;

    // Clear previous results when configuration actually changes
    setCategoryResults(new Map());
    setRemainingArticles([]);
    setReadArticles([]);
    setCategoryFilteredArticles([]);
    setRemainingPage(1);
    setAllArticlesPage(1);
    setReadPage(1);
    setHasMoreRemaining(false);
    setHasMoreRead(false);
    setFetchedRemainingIds([]);
    setFetchedReadIds([]);
    setFetchedAllArticlesIds([]);

    // If categoryIdFilter is provided, fetch all articles for that specific category
    if (categoryIdFilter) {
      fetchAllCategoryArticles();
      return;
    }

    // If no categories (no interactions or all filtered out), skip category fetching and go straight to all articles
    if (
      !categorySortedData.categories ||
      categorySortedData.categories.length === 0
    ) {
      fetchAllArticles(1);
      return;
    }

    // Fetch categories sequentially but don't wait for each to finish
    categorySortedData.categories.forEach((category, index) => {
      // Add a small delay between requests to spread them out
      setTimeout(() => {
        fetchCategoryArticles(category);
      }, index * 100); // 100ms delay between category requests
    });
  }, [
    categorySortedData.categories,
    countryArticles,
    i18n.language,
    limit,
    ageGroupId,
    categoryIdFilter,
    searchValue,
    availableCategories,
  ]);

  // Update combined articles whenever category results change
  useEffect(() => {
    // If using category filter, use those articles directly (already sorted)
    if (categoryIdFilter && categoryFilteredArticles.length > 0) {
      setAllFetchedArticles(categoryFilteredArticles);
      return;
    }

    // Otherwise, use normal recommendation logic
    const allCategoryArticles = [];
    categoryResults.forEach((result) => {
      allCategoryArticles.push(...result.articles);
    });

    const combinedArticles = [
      ...allCategoryArticles,
      ...remainingArticles,
    ].sort(
      (a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0)
    );
    combinedArticles.push(...readArticles);

    setAllFetchedArticles(combinedArticles);
  }, [
    categoryResults,
    remainingArticles,
    readArticles,
    categoryFilteredArticles,
    categoryIdFilter,
    searchValue,
  ]);

  // Fetch remaining articles when all categories are done
  useEffect(() => {
    const allCategoriesFetched =
      categorySortedData.categories?.length > 0 &&
      fetchingCategories.size === 0 &&
      categoryResults.size === categorySortedData.categories.length;

    if (allCategoriesFetched && !fetchingRemaining) {
      fetchRemainingArticles(1);
    }
  }, [
    fetchingCategories.size,
    categoryResults.size,
    categorySortedData.categories?.length,
  ]);

  // Fetch remaining articles after categories are done (with pagination)
  const fetchRemainingArticles = async (pageNum = 1) => {
    if (!countryArticles?.length || categoryResults.size === 0) return;

    const fetchedArticleIds = new Set();
    categoryResults.forEach((result) => {
      result.articles.forEach((article) => {
        fetchedArticleIds.add(Number(article.data.id));
      });
    });

    const excludeIds = [
      ...Array.from(fetchedArticleIds), // Exclude already fetched articles from categories
      ...categorySortedData.interactedArticleIds, // Exclude interacted articles
      ...fetchedRemainingIds, // Exclude already fetched remaining articles
    ];

    // Filter countryArticles to only include articles we want
    const filteredCountryArticles = countryArticles.filter(
      (id) => !excludeIds.includes(Number(id))
    );
    if (filteredCountryArticles.length === 0) {
      setHasMoreRemaining(false);
      setFetchingRemaining(false);
      return;
    }

    setFetchingRemaining(true);

    try {
      // Send only the filtered article IDs to server - clean pagination
      const { data: remainingData } = await cmsSvc.getArticles({
        ids: filteredCountryArticles, // Pass only filtered article IDs
        locale: i18n.language,
        populate: true,
        page: pageNum,
        limit: limit,
        ...(ageGroupId && { ageGroupId }), // Add age group filter if provided
        ...(searchValue && { contains: searchValue }),
      });

      if (!remainingData.data || remainingData.data.length === 0) {
        setHasMoreRemaining(false);

        // When no more remaining articles, start fetching read articles
        if (categorySortedData.interactedArticleIds?.length > 0) {
          setHasMoreRead(true);
          fetchReadArticles(1);
        } else {
          setFetchingRemaining(false);
        }
        return;
      }

      // Use Strapi pagination response to determine if there are more articles
      const pagination = remainingData.meta?.pagination;
      let hasMorePages = false;

      if (pagination) {
        // Calculate if there are more pages based on total and current position
        const currentStart = pagination.start || 0;
        const currentLimit = pagination.limit || limit;
        const total = pagination.total || 0;

        // If current start + limit < total, there are more pages
        hasMorePages = currentStart + currentLimit < total;

        console.log(
          `Remaining Pagination calc: start=${currentStart}, limit=${currentLimit}, total=${total}, hasMore=${hasMorePages}`
        );
      } else {
        // Fallback: if we got exactly the limit, there might be more
        hasMorePages = remainingData.data.length === limit;
      }

      setHasMoreRemaining(hasMorePages);

      // If no more pages and we have interacted articles, prepare to fetch read articles
      if (
        !hasMorePages &&
        categorySortedData.interactedArticleIds?.length > 0
      ) {
        console.log(
          "No more remaining pages, will fetch read articles on next loadMore"
        );
        setHasMoreRead(true);
      }

      const remainingArticlesWithScore = remainingData.data.map((article) => ({
        data: {
          ...article,
          id: article.id,
        },
        categoryWeight: 0,
        recommendationScore: 0,
      }));

      if (pageNum === 1) {
        setRemainingArticles(remainingArticlesWithScore);
        setFetchedRemainingIds(
          remainingData.data.map((article) => Number(article.id))
        );
      } else {
        setRemainingArticles((prev) => [
          ...prev,
          ...remainingArticlesWithScore,
        ]);
        setFetchedRemainingIds((prev) => [
          ...prev,
          ...remainingData.data.map((article) => Number(article.id)),
        ]);
      }

      console.log(
        `Remaining articles fetched for page ${pageNum}: ${remainingData.data.length}`
      );
      console.log(`Strapi pagination:`, remainingData.meta?.pagination);
    } catch (error) {
      console.warn("Error fetching remaining articles:", error);
      setHasMoreRemaining(false);
    } finally {
      setFetchingRemaining(false);
    }
  };

  // Fetch read articles when no more unread articles are available
  const fetchReadArticles = async (pageNum = 1) => {
    if (!categorySortedData.interactedArticleIds?.length) {
      console.log("❌ No interacted article IDs available");
      return;
    }

    const excludeReadIds = [
      ...fetchedReadIds, // Exclude already fetched read articles
    ];

    // Filter interacted articles to only include ones we haven't fetched yet
    const filteredReadArticles = categorySortedData.interactedArticleIds.filter(
      (id) => !excludeReadIds.includes(Number(id))
    );

    if (filteredReadArticles.length === 0) {
      setHasMoreRead(false);
      setFetchingRemaining(false);
      return;
    }

    setFetchingRemaining(true);

    try {
      // Send only the filtered read article IDs to server
      const { data: readData } = await cmsSvc.getArticles({
        ids: filteredReadArticles, // Pass only filtered read article IDs
        locale: i18n.language,
        populate: true,
        page: pageNum,
        limit: limit,
        ...(ageGroupId && { ageGroupId }), // Add age group filter if provided
        ...(searchValue && { contains: searchValue }),
      });

      if (!readData.data || readData.data.length === 0) {
        setHasMoreRead(false);
        setFetchingRemaining(false);
        return;
      }

      // Use Strapi pagination response to determine if there are more read articles
      const pagination = readData.meta?.pagination;
      let hasMorePages = false;

      if (pagination) {
        const currentStart = pagination.start || 0;
        const currentLimit = pagination.limit || limit;
        const total = pagination.total || 0;

        hasMorePages = currentStart + currentLimit < total;
      } else {
        hasMorePages = readData.data.length === limit;
      }

      setHasMoreRead(hasMorePages);

      const readArticlesWithScore = readData.data.map((article) => ({
        data: {
          ...article,
          id: article.id,
        },
        categoryWeight: 0.5, // Lower weight for read articles
        recommendationScore: 0.1, // Lower score for read articles
      }));

      if (pageNum === 1) {
        setReadArticles(readArticlesWithScore);
        setFetchedReadIds(readData.data.map((article) => Number(article.id)));
      } else {
        setReadArticles((prev) => [...prev, ...readArticlesWithScore]);
        setFetchedReadIds((prev) => [
          ...prev,
          ...readData.data.map((article) => Number(article.id)),
        ]);
      }
    } catch (error) {
      console.warn("Error fetching read articles:", error);
      setHasMoreRead(false);
    } finally {
      setFetchingRemaining(false);
    }
  };

  // Calculate display data
  const totalCount = allFetchedArticles.length;

  // Determine if there are more articles to load
  const hasMore = categoryIdFilter
    ? false // Category filter shows all articles at once, no pagination needed
    : categorySortedData.categories?.length === 0
      ? hasMoreRemaining || hasMoreRead // No categories - use remaining or read pagination
      : categorySortedData.categories?.length > 0 &&
          categoryResults.size === categorySortedData.categories.length
        ? hasMoreRemaining || hasMoreRead // Categories done - use remaining or read pagination
        : false; // Still fetching categories

  const categoriesData = Array.from(categoryResults.entries()).map(
    ([categoryId, result]) => ({
      categoryId,
      categoryWeight: result.categoryWeight,
      articlesCount: result.articles.length,
      tagIds: result.tagIds,
    })
  );

  const isLoading =
    isLoadingInteractions ||
    isLoadingCountryArticles ||
    fetchingCategories.size > 0 ||
    fetchingRemaining;

  const categoryArticlesCount = Array.from(categoryResults.values()).reduce(
    (total, result) => total + result.articles.length,
    0
  );

  // Load more function
  const loadMore = () => {
    if (fetchingRemaining || !hasMore) {
      return;
    }
    if (categorySortedData.categories?.length === 0) {
      // No categories - load more all articles
      const nextPage = allArticlesPage + 1;
      setAllArticlesPage(nextPage);
      fetchAllArticles(nextPage);
    } else {
      // Categories exist
      if (hasMoreRemaining) {
        // Load more remaining articles
        const nextPage = remainingPage + 1;
        setRemainingPage(nextPage);

        fetchRemainingArticles(nextPage);
      } else if (hasMoreRead) {
        // Load more read articles
        const nextPage = readPage + 1;
        setReadPage(nextPage);

        fetchReadArticles(nextPage);
      }
    }
  };

  // Add this useEffect after all state and refetch are defined
  useEffect(() => {
    // When ageGroupId changes, reset everything
    if (ageGroupId) {
      console.log("[useEffect] ageGroupId changed, resetting state");
      if (typeof refetch === "function") refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ageGroupId]);
  const isReady =
    totalCount > 0 ||
    (!isLoading && categorySortedData.categories !== undefined);

  return {
    articles: allFetchedArticles,
    loading: isLoading,
    hasMore,
    totalCount,
    categoriesData,
    remainingArticlesCount: remainingArticles.length,
    readArticlesCount: readArticles.length,
    readArticleIds: readArticleIds,
    categoryArticlesCount,
    loadMore,
    refetch: () => {
      setCategoryResults(new Map());
      setRemainingArticles([]);
      setReadArticles([]);
      setCategoryFilteredArticles([]);
      setAllFetchedArticles([]);
      setRemainingPage(1);
      setAllArticlesPage(1);
      setReadPage(1);
      setHasMoreRemaining(false);
      setHasMoreRead(false);
      setFetchedRemainingIds([]);
      setFetchedReadIds([]);
      setFetchedAllArticlesIds([]);
    },
    error: null,
    isReady,
    fetchingCategories: Array.from(fetchingCategories),
    fetchingRemaining,
    hasMoreRemaining,
    hasMoreRead,
  };
};

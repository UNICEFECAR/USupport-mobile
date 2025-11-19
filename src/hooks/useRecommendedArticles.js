import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { cmsSvc, clientSvc, adminSvc } from "#services";

/**
 * Clean 3-Stage Recommendation System
 * -----------------------------------
 * Stage 1: Category Recommendations (ordered by interaction weight)
 * Stage 2: Remaining Unread Articles
 * Stage 3: Read Articles
 *
 * Combined ordered list:
 *   final = [...stage1, ...stage2, ...stage3]
 *
 * UI pagination:
 *   final.slice(0, page * limit)
 */

export const useRecommendedArticles = ({
  limit = 10,
  page = 1,
  ageGroupId = null,
  categoryIdFilter = null,
  searchValue = "",
  availableCategories = [],
  enabled = true,
}) => {
  const { i18n } = useTranslation();

  // Loading control
  const [initializing, setInitializing] = useState(true);
  const [pipelineLoading, setPipelineLoading] = useState(true);

  // Stages
  const [stage1, setStage1] = useState([]); // category results
  const [stage2, setStage2] = useState([]); // remaining unread
  const [stage3, setStage3] = useState([]); // read

  // UI pagination
  const [uiPage, setUiPage] = useState(page);
  if (!enabled)
    return {
      articles: [],
      total: 0,
      hasMore: false,
      loading: false,
      loadMore: () => {},
      refetch: () => {},
      isReady: false,
      readArticleIds: [],
    };

  // Base data
  const { data: countryArticles, isFetching: loadingCountry } = useQuery(
    ["countryArticles"],
    () => adminSvc.getArticles()
  );

  const { data: interactions, isFetching: loadingInteractions } = useQuery(
    ["categoryInteractions"],
    () => clientSvc.getCategoryInteractions(),
    {
      enabled: !loadingCountry,
    }
  );

  // Reset func
  const resetAll = useCallback(() => {
    setStage1([]);
    setStage2([]);
    setStage3([]);
    setUiPage(1);
  }, []);

  // ----------------------------------
  // DERIVED VALUES FROM INTERACTIONS
  // ----------------------------------

  const derived = (() => {
    if (!interactions?.data) {
      return {
        sortedCategories: [],
        interactedIds: [],
        readIds: [],
      };
    }

    const map = new Map();
    const interactedIds = new Set();
    const readIds = [];

    interactions.data.forEach((it) => {
      const catId = it.category_id;
      const artId = it.article_id;
      const weight = it.count;

      if (artId) {
        readIds.push(artId);
        interactedIds.add(artId);
      }

      if (!map.has(catId)) {
        map.set(catId, {
          categoryId: catId,
          count: 0,
          articleIds: [],
          tagIds: it.tag_ids || [],
        });
      }

      const item = map.get(catId);
      item.count += weight;
      if (artId) item.articleIds.push(artId);
    });

    const sortedCategories = Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .filter((c) =>
        availableCategories?.length > 0
          ? availableCategories.includes(c.categoryId)
          : true
      );

    return {
      sortedCategories,
      interactedIds: Array.from(interactedIds),
      readIds,
    };
  })();

  const { sortedCategories, interactedIds, readIds } = derived;

  // ----------------------------------
  // MAIN PIPELINE
  // ----------------------------------

  useEffect(() => {
    if (loadingCountry || loadingInteractions) return;
    if (!countryArticles) return;

    setPipelineLoading(true);
    setInitializing(false);
    resetAll();

    // CATEGORY FILTER MODE
    if (categoryIdFilter) {
      (async () => {
        try {
          const { data } = await cmsSvc.getArticles({
            ids: countryArticles,
            locale: i18n.language,
            populate: true,
            categoryId: categoryIdFilter,
            ...(ageGroupId && { ageGroupId }),
            ...(searchValue && { contains: searchValue }),
            limit: 5000,
          });

          const mapped = data.data.map((article) => ({
            data: { ...article, id: article.id },
            recommendationScore: interactedIds.includes(article.id) ? 0.1 : 1,
            categoryWeight: 1,
          }));

          mapped.sort((a, b) => b.recommendationScore - a.recommendationScore);
          setStage1(mapped);
        } catch (e) {
          console.warn("Specific category fetch failed:", e);
          setStage1([]);
        } finally {
          setPipelineLoading(false);
        }
      })();

      return;
    }

    // NORMAL MODE (3 STAGES)
    (async () => {
      try {
        // Stage 1 — category recommendations
        const stage1Results = [];
        for (const cat of sortedCategories) {
          try {
            const res = await cmsSvc.getRecommendedArticlesForCategory({
              categoryId: cat.categoryId,
              categoryWeight: cat.count,
              language: i18n.language,
              excludeIds: interactedIds,
              countryArticleIds: countryArticles,
              tagIds: cat.tagIds,
              ...(ageGroupId && { ageGroupId }),
              ...(searchValue && { contains: searchValue }),
            });

            if (res.success) stage1Results.push(...res.data);
          } catch {}
        }
        setStage1(stage1Results);

        // Stage 2 — unread remaining
        const exclude = new Set([
          ...stage1Results.map((x) => Number(x.data.id)),
          ...interactedIds,
        ]);

        const remainingIds = countryArticles.filter(
          (id) => !exclude.has(Number(id))
        );

        let stage2Results = [];
        if (remainingIds.length) {
          try {
            const { data } = await cmsSvc.getArticles({
              ids: remainingIds,
              locale: i18n.language,
              populate: true,
              limit: 5000,
              ...(ageGroupId && { ageGroupId }),
              ...(searchValue && { contains: searchValue }),
            });

            stage2Results = data.data.map((a) => ({
              data: { ...a, id: a.id },
              categoryWeight: 0,
              recommendationScore: 0,
            }));
          } catch {}
        }
        setStage2(stage2Results);

        // Stage 3 — read articles
        if (readIds.length) {
          try {
            const { data } = await cmsSvc.getArticles({
              ids: readIds,
              locale: i18n.language,
              populate: true,
              limit: 5000,
              ...(ageGroupId && { ageGroupId }),
              ...(searchValue && { contains: searchValue }),
            });

            const mapped = data.data.map((a) => ({
              data: { ...a, id: a.id },
              categoryWeight: 0.5,
              recommendationScore: 0.1,
            }));

            setStage3(mapped);
          } catch {}
        }
      } finally {
        setPipelineLoading(false);
      }
    })();
  }, [
    loadingCountry,
    loadingInteractions,
    categoryIdFilter,
    ageGroupId,
    searchValue,
    i18n.language,
    availableCategories,
    countryArticles,
    interactions,
  ]);

  // ----------------------------------
  // FINAL MERGED LIST
  // ----------------------------------

  const merged = [...stage1, ...stage2, ...stage3];
  const paged = merged.slice(0, uiPage * limit);

  const loadMore = () => {
    if (paged.length < merged.length) {
      setUiPage((p) => p + 1);
    }
  };

  const isReady = !pipelineLoading && !loadingCountry && !loadingInteractions;

  return {
    articles: paged,
    total: merged.length,
    hasMore: paged.length < merged.length,
    loading:
      initializing || pipelineLoading || loadingCountry || loadingInteractions,
    loadMore,
    refetch: resetAll,
    isReady,
    readArticleIds: readIds,
    stage1Count: stage1.length,
    stage2Count: stage2.length,
    stage3Count: stage3.length,
  };
};

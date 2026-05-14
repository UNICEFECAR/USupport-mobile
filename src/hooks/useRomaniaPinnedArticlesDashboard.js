import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { cmsSvc, adminSvc } from "#services";

/**
 * Romanian home dashboard: show pinned CMS articles (`pinned_articles` ∩ `article_ids`) in admin order only.
 *
 * @param {object} options
 * @param {string | null | undefined} options.country — storage country alpha2 for cache key
 * @param {boolean} options.IS_RO
 * @param {string} options.usersLanguage
 * @param {{ data?: unknown[], isLoading?: boolean, isFetching?: boolean, isSuccess?: boolean }} options.articleIdsQuerry
 * @param {boolean} options.dashboardArticleSourcesReadyForPinnedCms
 */
export const useRomaniaPinnedArticlesDashboard = ({
  country,
  IS_RO,
  usersLanguage,
  articleIdsQuerry,
  dashboardArticleSourcesReadyForPinnedCms,
}) => {
  const pinnedArticleStrapiIdsQuery = useQuery(
    ["mobileDashboardPinnedArticleStrapiIds", country],
    () => adminSvc.getPinnedArticles(),
    { enabled: IS_RO },
  );

  const adminPinnedArticleIdsUnique = useMemo(() => {
    if (!IS_RO || !Array.isArray(pinnedArticleStrapiIdsQuery.data)) return [];
    return [
      ...new Set(
        pinnedArticleStrapiIdsQuery.data.map((id) => String(id).trim())
      ),
    ].filter(Boolean);
  }, [IS_RO, pinnedArticleStrapiIdsQuery.data]);

  const romaniaPinnedIdsLoading =
    IS_RO && pinnedArticleStrapiIdsQuery.isLoading;

  const publishedArticleIdSet = useMemo(() => {
    if (!articleIdsQuerry.data?.length) return new Set();
    return new Set(
      articleIdsQuerry.data.map((id) => String(id).trim()).filter(Boolean)
    );
  }, [articleIdsQuerry.data]);

  const orderedPinnedStrapiIdsInPublishedPool = useMemo(() => {
    if (!adminPinnedArticleIdsUnique.length || !publishedArticleIdSet.size) {
      return [];
    }
    return adminPinnedArticleIdsUnique.filter((id) =>
      publishedArticleIdSet.has(String(id))
    );
  }, [adminPinnedArticleIdsUnique, publishedArticleIdSet]);

  const showRomaniaPinnedArticlesOnly =
    IS_RO &&
    pinnedArticleStrapiIdsQuery.isSuccess &&
    adminPinnedArticleIdsUnique.length > 0;

  const romanianDashboardUsesPinnedLayout =
    showRomaniaPinnedArticlesOnly || romaniaPinnedIdsLoading;

  const pinnedArticlesCmsQuery = useQuery(
    [
      "mobileArticlesDashboardPinnedCmsArticles",
      usersLanguage,
      orderedPinnedStrapiIdsInPublishedPool,
    ],
    async () => {
      const ids = orderedPinnedStrapiIdsInPublishedPool;
      if (!ids.length) return [];

      const baseRequest = {
        ids,
        populate: true,
        limit: ids.length,
      };

      const fetchForLocale = (locale) =>
        cmsSvc.getArticles({ ...baseRequest, locale });

      let { data } = await fetchForLocale(usersLanguage);
      let rows = data?.data ?? [];

      if (!rows.length && usersLanguage !== "en") {
        ({ data } = await fetchForLocale("en"));
        rows = data?.data ?? [];
      }

      const byId = new Map(rows.map((entry) => [String(entry.id), entry]));
      return ids.map((id) => byId.get(String(id))).filter(Boolean);
    },
    {
      enabled:
        IS_RO &&
        orderedPinnedStrapiIdsInPublishedPool.length > 0 &&
        dashboardArticleSourcesReadyForPinnedCms,
    }
  );

  return {
    romaniaPinnedIdsLoading,
    orderedPinnedStrapiIdsInPublishedPool,
    showRomaniaPinnedArticlesOnly,
    romanianDashboardUsesPinnedLayout,
    pinnedArticlesCmsQuery,
  };
};

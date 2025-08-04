import { useQuery } from "@tanstack/react-query";
import { cmsSvc } from "#services";
import {
  destructureArticleData,
  destructurePodcastData,
  destructureVideoData,
} from "#utils";

/**
 * Hook to get assessment result based on psychological, social, and biological scores
 * @param {object} queryObj - Query parameters object
 * @param {string} queryObj.language - Language/locale for the results
 * @param {number} queryObj.psychological - Psychological score
 * @param {number} queryObj.social - Social score
 * @param {number} queryObj.biological - Biological score
 * @param {boolean} enabled - Whether the query should be enabled
 * @returns {Object} React Query object with assessment result data
 */
export function useGetAssessmentResult(queryObj, enabled = true) {
  console.log(queryObj);
  const getAssessmentResult = async () => {
    if (
      !queryObj.language ||
      typeof queryObj.psychological === "undefined" ||
      typeof queryObj.social === "undefined" ||
      typeof queryObj.biological === "undefined"
    ) {
      throw new Error(
        "Missing required parameters: language, psychological, social, biological"
      );
    }

    const { data } = await cmsSvc.getAssessmentResult({
      locale: queryObj.language,
      psychological: queryObj.psychological,
      social: queryObj.social,
      biological: queryObj.biological,
    });

    if (data.data) {
      const attributes = data.data[0].attributes;
      console.log(attributes, "attributes");
      const articles =
        attributes?.articles?.data?.map(destructureArticleData) || [];
      const podcasts =
        attributes?.podcasts?.data?.map(destructurePodcastData) || [];
      const videos = attributes?.videos?.data?.map(destructureVideoData) || [];

      return {
        summary: attributes.summary,
        description: attributes.description,
        recommendations: attributes.recommendations,
        articles,
        podcasts,
        videos,
      };
    }
  };

  const getAssessmentResultQuery = useQuery(
    ["getAssessmentResult", queryObj],
    getAssessmentResult,
    {
      enabled:
        enabled &&
        queryObj.language &&
        typeof queryObj.psychological !== "undefined" &&
        typeof queryObj.social !== "undefined" &&
        typeof queryObj.biological !== "undefined",
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  return getAssessmentResultQuery;
}

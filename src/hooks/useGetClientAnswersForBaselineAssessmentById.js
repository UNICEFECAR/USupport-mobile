import { useQuery } from "@tanstack/react-query";

import { clientSvc } from "#services";

export function useGetClientAnswersForBaselineAssessmentById(
  baselineAssessmentId,
  enabled = true
) {
  /**
   * Fetch client answers for a specific baseline assessment
   * @param {string} baselineAssessmentId - The baseline assessment ID to fetch answers for
   * @returns {Object} React Query object with baseline assessment answers data
   */
  const getClientAnswersForBaselineAssessmentById = async () => {
    if (!baselineAssessmentId) return [];
    const { data } =
      await clientSvc.getClientAnswersForBaselineAssessmentById(
        baselineAssessmentId
      );
    return data;
  };

  const getClientAnswersForBaselineAssessmentByIdQuery = useQuery(
    ["getClientAnswersForBaselineAssessmentById", baselineAssessmentId],
    getClientAnswersForBaselineAssessmentById,
    {
      enabled: enabled && !!baselineAssessmentId,
    }
  );

  return getClientAnswersForBaselineAssessmentByIdQuery;
}

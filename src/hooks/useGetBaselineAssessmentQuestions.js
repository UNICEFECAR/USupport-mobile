import { useQuery } from "@tanstack/react-query";
import { clientSvc } from "#services";

export function useGetBaselineAssessmentQuestions() {
  /**
   * Fetch all baseline assessment questions sorted by position
   * @returns {Object} React Query object with baseline assessment questions data
   */
  const getBaselineAssessmentQuestions = async () => {
    const { data } = await clientSvc.getBaselineAssessmentQuestions();
    return data;
  };

  const getBaselineAssessmentQuestionsQuery = useQuery(
    ["getBaselineAssessmentQuestions"],
    getBaselineAssessmentQuestions
  );

  return getBaselineAssessmentQuestionsQuery;
}

import { useQuery } from "@tanstack/react-query";
import { clientSvc } from "#services";

export function useGetScreeningQuestions() {
  /**
   * Fetch all screening questions sorted by position
   * @returns {Object} React Query object with screening questions data
   */
  const getScreeningQuestions = async () => {
    const { data } = await clientSvc.getScreeningQuestions();
    return data;
  };

  const getScreeningQuestionsQuery = useQuery(
    ["getScreeningQuestions"],
    getScreeningQuestions
  );

  return getScreeningQuestionsQuery;
}

import { useQuery } from "@tanstack/react-query";
import { providerSvc } from "#services";

export function useGetQuestionsTags(languageId, onSuccess) {
  /**
   *
   *  @returns
   */

  const getQuestionsTags = async () => {
    const { data } = await providerSvc.getQuestionTags(languageId);
    return data.map((item) => {
      return { label: item.tag, id: item.tag_id };
    });
  };

  const getQuestionsTagsQuery = useQuery(
    ["getQuestionsTags", languageId],
    getQuestionsTags,
    {
      onSuccess: onSuccess,
      enabled: !!languageId,
    }
  );

  return getQuestionsTagsQuery;
}

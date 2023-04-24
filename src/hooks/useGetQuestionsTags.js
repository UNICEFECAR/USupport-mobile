import { useQuery } from "@tanstack/react-query";
import { providerSvc } from "#services";

export function useGetQuestionsTags(onSuccess) {
  /**
   *
   *  @returns
   */

  const getQuestionsTags = async () => {
    const { data } = await providerSvc.getQuestionTags();
    return data.map((item) => {
      return { label: item.tag, id: item.tag_id };
    });
  };

  const getQuestionsTagsQuery = useQuery(
    ["getQuestionsTags"],
    getQuestionsTags,
    {
      onSuccess: onSuccess,
    }
  );

  return getQuestionsTagsQuery;
}

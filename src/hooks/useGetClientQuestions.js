import { useQuery } from "@tanstack/react-query";
import { clientSvc } from "#services";

export function useGetClientQuestions(enabled) {
  /**
   *
   * @returns
   */
  const getClientQuestions = async () => {
    const { data } = await clientSvc.getClientQuestions();
    return data.map((question) => {
      return {
        answerId: question.answer_id,
        answerText: question.answer_text,
        answerTitle: question.answer_title,
        dislikes: question.dislikes,
        likes: question.likes,
        providerData: {
          providerId: question.providerData.provider_detail_id,
          ...question.providerData,
        },
        providerDetailId: question.provider_detail_id,
        question: question.question,
        tags: tags,
      };
    });
  };

  const getClientQuestionsQuery = useQuery(
    ["getClientQuestions"],
    getClientQuestions,
    { enabled: !!enabled }
  );

  return getClientQuestionsQuery;
}

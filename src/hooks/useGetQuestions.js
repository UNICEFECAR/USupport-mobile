import { useQuery } from "@tanstack/react-query";
import { clientSvc } from "#services";

export function useGetQuestions(orderBy = "all", enabled) {
  /**
   *
   * @returns
   */
  const getQuestions = async () => {
    const { data } = await clientSvc.getQuestions(orderBy);

    return data.map((question) => {
      return {
        answerCreatedAt: question.answer_created_at,
        answerId: question.answer_id,
        answerText: question.answer_text,
        answerTitle: question.answer_title,
        dislikes: question.dislikes,
        isDisliked: question.isDisliked,
        isLiked: question.isLiked,
        likes: question.likes,
        providerData: {
          providerId: question.providerData.provider_detail_id,
          ...question.providerData,
        },
        providerDetailId: question.provider_detail_id,
        question: question.question,
        questionCreatedAt: question.question_created_at,
        questionId: question.question_id,
        tags: question.tags,
      };
    });
  };

  const getQuestionsQuery = useQuery(["getQuestions", orderBy], getQuestions, {
    enabled,
  });

  return getQuestionsQuery;
}

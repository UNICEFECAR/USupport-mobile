import { useMutation } from "@tanstack/react-query";
import { clientSvc } from "#services";
import useError from "./useError";

export default function useAddQuestion(onSuccess, onError, onMutate) {
  /**
   *
   * @param {Object} data - containing the "mood" and "comment" fields
   * @returns
   */
  const addMoodTrack = async (question) => {
    const response = await clientSvc.addQuestion(question);
    return response.data;
  };

  const addMoodTrackMutation = useMutation(addMoodTrack, {
    onMutate: onMutate,
    onSuccess: onSuccess,
    onError: (error, variables, rollback) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage, variables, rollback);
    },
  });

  return addMoodTrackMutation;
}

export { useAddQuestion };

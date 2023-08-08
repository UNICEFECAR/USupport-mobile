import { useMutation } from "@tanstack/react-query";
import { clientSvc } from "#services";
import { useError } from "../hooks/useError";

export default function useAddMoodTrack(onSuccess, onError, onMutate) {
  /**
   *
   * @param {Object} data - containing the "mood" and "comment" fields
   * @returns
   */
  const addMoodTrack = async (data) => {
    const response = await clientSvc.addMoodTrack(data.mood, data.comment);
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

export { useAddMoodTrack };

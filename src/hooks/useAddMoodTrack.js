import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientSvc } from "#services";
import { useError } from "../hooks/useError";

const MOOD_TRACK_QUERY_KEYS = [
  ["getHasCompletedMoodTrackerEver"],
  ["getMoodTrackEntries"],
  ["getMoodTrackForToday"],
  ["getMoodTrackerRecommendations"],
];

export default function useAddMoodTrack(onSuccess, onError, onMutate) {
  const queryClient = useQueryClient();
  /**
   *
   * @param {Object} data - containing the "mood" and "comment" fields
   * @returns
   */
  const addMoodTrack = async (data) => {
    const response = await clientSvc.addMoodTrack(
      data.mood,
      data.comment,
      data.emergency
    );
    return response.data;
  };

  const addMoodTrackMutation = useMutation(addMoodTrack, {
    onMutate: onMutate,
    onSuccess: (data, variables, context) => {
      MOOD_TRACK_QUERY_KEYS.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, rollback) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage, variables, rollback);
    },
  });

  return addMoodTrackMutation;
}

export { useAddMoodTrack };

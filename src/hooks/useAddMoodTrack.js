import { useMutation } from "@tanstack/react-query";
import { clientSvc } from "#services";
import useError from "./useError";

export default function useAddMoodTrack(onSuccess, onError, onMutate) {
  const addMoodTrack = async (data) => {
    // const response = await clientSvc.addMoodTrack(data.date, data.mood);
    // return response.data;
    await new Promise((resolve) => setTimeout(resolve, 500));
    return true;
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

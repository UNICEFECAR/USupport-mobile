import { useMutation } from "@tanstack/react-query";
import { clientSvc } from "#services";
import { useError } from "./useError";

export default function useGenerateMoodTrackReport(onSuccess, onError) {
  const generateReport = async (data) => {
    const response = await clientSvc.generateMoodTrackReport(data);
    return response;
  };

  return useMutation({
    mutationFn: generateReport,
    mutationKey: ["generate-mood-track-report"],
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });
}

export { useGenerateMoodTrackReport };

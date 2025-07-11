import { useMutation } from "@tanstack/react-query";
import { clientSvc } from "#services";
import useError from "./useError";

export const useSendPlatformSuggestion = (onError, onSuccess) => {
  return useMutation({
    mutationFn: clientSvc.sendPlatformSuggestion,
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
    onSuccess,
  });
};

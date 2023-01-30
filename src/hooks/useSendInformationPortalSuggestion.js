import { useMutation } from "@tanstack/react-query";
import { clientSvc } from "#services";

import { useError } from "./useError";

export const useSendInformationPortalSuggestion = (onError, onSuccess) => {
  const sendSuggestion = async (suggestion) => {
    const response = await clientSvc.sendInformationPortalSuggestion(
      suggestion
    );
    return response;
  };

  const sendSuggestionMutation = useMutation(sendSuggestion, {
    onError: (error) => {
      const { error: errorMessage } = useError(error);
      onError(errorMessage);
    },
    onSuccess,
  });

  return sendSuggestionMutation;
};

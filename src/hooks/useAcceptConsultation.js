import { useMutation, useQueryClient } from "@tanstack/react-query";
import { providerSvc } from "#services";
import { useError } from "./useError";

export default function useAcceptConsultation(onSuccess, onError) {
  const queryClient = useQueryClient();

  const acceptConsultation = async (consultationId) => {
    const res = await providerSvc.acceptConsultation(consultationId);
    return res;
  };
  const acceptConsultationMutation = useMutation(acceptConsultation, {
    onSuccess: () => {
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ["all-consultations"] });
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });
  return acceptConsultationMutation;
}

export { useAcceptConsultation };

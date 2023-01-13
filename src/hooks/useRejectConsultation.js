import { useMutation, useQueryClient } from "@tanstack/react-query";
import { providerSvc } from "#services";
import { useError } from "./useError";

export default function useRejectConsultation(onSuccess, onError) {
  const queryClient = useQueryClient();

  const rejectConsultation = async (consultationId) => {
    const res = await providerSvc.rejectConsultation(consultationId);
    return res;
  };
  const rejectConsultationMutation = useMutation(rejectConsultation, {
    onSuccess: () => {
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ["all-consultations"] });
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });
  return rejectConsultationMutation;
}

export { useRejectConsultation };

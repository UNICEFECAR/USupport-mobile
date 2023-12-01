import { useMutation } from "@tanstack/react-query";
import { providerSvc } from "#services";
import { useError } from "./useError";

export default function useCancelConsultation(onSuccess, onError) {
  const cancelConsultation = async (consultation) => {
    const { consultationId, shouldRefund } = consultation;
    const res = await providerSvc.cancelConsultation(
      consultationId,
      shouldRefund
    );
    return res;
  };

  const cancelConsultationMutation = useMutation(cancelConsultation, {
    onSuccess,
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });

  return cancelConsultationMutation;
}

export { useCancelConsultation };

import { useMutation } from "@tanstack/react-query";
import { clientSvc } from "#services";
import { useError } from "./useError";

export const useUpdateSecurityCheckAnswersByConsultationId = (
  onSuccess = () => {},
  onError = () => {}
) => {
  const updateConsultationSecurityCheck = async (payload) => {
    return clientSvc.updateConsultationSecurityCheck(payload);
  };

  const updateConsultationSecurityCheckMutation = useMutation(
    updateConsultationSecurityCheck,
    {
      onSuccess: onSuccess,
      onError: (error) => {
        const { message: errorMessage } = useError(error);
        onError(errorMessage);
      },
    }
  );

  return updateConsultationSecurityCheckMutation;
};

import { useMutation } from "@tanstack/react-query";
import { clientSvc } from "#services";
import { useError } from "./useError";

export const useCreateConsultationSecurityCheck = (
  onSuccess = () => {},
  onError = () => {}
) => {
  const createConsultationSecurityCheck = async (payload) => {
    return clientSvc.createConsultationSecurityCheck(payload);
  };

  const createConsultationSecurityCheckMutation = useMutation(
    createConsultationSecurityCheck,
    {
      onSuccess: onSuccess,
      onError: (error) => {
        const { message: errorMessage } = useError(error);
        onError(errorMessage);
      },
    }
  );

  return createConsultationSecurityCheckMutation;
};

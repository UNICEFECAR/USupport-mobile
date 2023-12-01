import { providerSvc } from "#services";
import { useMutation } from "@tanstack/react-query";
import useError from "./useError";

export default function useJoinConsultation(
  onSuccess = () => {},
  onError = () => {}
) {
  const joinConsultation = async ({ consultationId, userType }) => {
    const response = await providerSvc.joinConsultation(
      consultationId,
      userType
    );
    return response.data;
  };

  const joinConsultationMutation = useMutation(joinConsultation, {
    onSuccess,
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });

  return joinConsultationMutation;
}

export { useJoinConsultation };

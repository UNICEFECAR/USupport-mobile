import { providerSvc } from "#services";
import { useMutation } from "@tanstack/react-query";
import { useError } from "./useError";

export default function useReportConsultationProblem(
  onSuccess = () => {},
  onError = () => {}
) {
  const submitProblemReport = async (payload) => {
    const response = await providerSvc.submitProblemReport(payload);
    return response.data;
  };

  return useMutation(submitProblemReport, {
    onSuccess,
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });
}

export { useReportConsultationProblem };

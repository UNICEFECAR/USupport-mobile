import { useMutation } from "@tanstack/react-query";
import { providerSvc } from "#services";
import { useError } from "./useError";

/**
 *
 * @param {function} onSuccess
 * @param {function} onError
 */
export default function useRescheduleConsultation(onSuccess, onError) {
  /**
   * @param {string} consultationId the id of the consultation that we want to reschedule
   * @param {number} newConsultationId the id of the newly created consultation
   * @returns {Promise}
   */
  const rescheduleConsultation = async ({
    consultationId,
    newConsultationId,
  }) => {
    const response = await providerSvc.rescheduleConsultation(
      consultationId,
      newConsultationId
    );
    return response.data;
  };

  const rescheduleConsultationMutation = useMutation(rescheduleConsultation, {
    onSuccess,
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });

  return rescheduleConsultationMutation;
}

export { useRescheduleConsultation };

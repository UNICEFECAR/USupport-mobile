import { useMutation } from "@tanstack/react-query";
import { providerSvc } from "#services";
import { useError } from "./useError";

/**
 *
 * @param {function} onSuccess
 * @param {function} onError
 */
export default function useScheduleConsultation(onSuccess, onError) {
  /**
   * @param {string} providerId the id of the provider
   * @param {number} slot the timestamp of the slot
   * @returns {Promise} resolving to the "consultation_id"
   */
  const scheduleConsultation = async (consultationId) => {
    const response = await providerSvc.scheduleConsultation(consultationId);
    return response.data;
  };

  const scheduleConsultationMutation = useMutation(scheduleConsultation, {
    onSuccess,
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });

  return scheduleConsultationMutation;
}

export { useScheduleConsultation };

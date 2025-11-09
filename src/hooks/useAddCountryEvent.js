import { useMutation } from "@tanstack/react-query";
import { userSvc } from "#services";

/**
 * Custom hook to track country events
 * @returns {Object} mutation object with mutate function
 */
export const useAddCountryEvent = () => {
  /**
   * @param {Object} payloada
   * @param {string} payload.eventType - Type of event (e.g., 'web_email_register_click', 'web_schedule_button_click', etc.)
   * @returns {Promise} the response of the request
   */
  const addCountryEvent = async (payload) => {
    const response = await userSvc.addCountryEvent(payload);
    return response;
  };

  return useMutation(addCountryEvent);
};

export default useAddCountryEvent;

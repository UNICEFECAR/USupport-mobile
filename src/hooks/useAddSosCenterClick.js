import { useMutation } from "@tanstack/react-query";
import { clientSvc } from "#services";

export const useAddSosCenterClick = () => {
  /**
   * @param {Object} payload
   * @param {number} payload.sosCenterId - The ID of the SOS center that was clicked
   * @param {boolean} payload.isMain - Whether this is the main SOS center
   * @param {string} payload.platform - The platform where the click occurred (web, mobile, etc.)
   * @returns {Promise} the response of the request
   */
  const addSosCenterClick = async (payload) => {
    const response = await clientSvc.addSOSCenterClick(payload);
    return response;
  };

  return useMutation(addSosCenterClick);
};

export default useAddSosCenterClick;

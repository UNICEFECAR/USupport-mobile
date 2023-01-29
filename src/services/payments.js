import http from "./http";
import { API_URL_ENDPOINT } from "@env";

const API_ENDPOINT = `${API_URL_ENDPOINT}/v1/payments`;

/**
 * used to create payment intent.
 *
 * @param {string} object - object containing the email and the amount
 *
 * @returns {Promise} - Promise object represents the response from the server containing the client secret
 */
async function createPaymentIntent(consultationId) {
  const response = await http.post(
    `${API_ENDPOINT}/one-time/create-payment-intent`,
    { consultationId: consultationId }
  );

  return response;
}

/**
 * used to create retrieve payment history for existent users.
 *
 * @returns {Promise} - Promise object represents the response from the server containing the client secret
 */
// async function getPaymentHistory() {
//   const response = await http.get(`${API_ENDPOINT}/one-time/history`);

//   return response;
// }

const exportedFunctions = {
  createPaymentIntent,
  //   getPaymentHistory,
};

export default exportedFunctions;

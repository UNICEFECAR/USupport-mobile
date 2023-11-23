import http from "./http";
import Config from "react-native-config";
const { API_URL_ENDPOINT } = Config;

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

async function cancelPaymentIntent(paymentIntentId) {
  const response = await http.put(
    `${API_ENDPOINT}/one-time/cancel-payment-intent`,
    { paymentIntentId }
  );

  return response;
}

/**
 * used to create retrieve payment history for existent users.
 *
 * @returns {Promise} - Promise object represents the response from the server containing the client secret
 */
async function getPaymentHistory({
  limit,
  startingAfterPaymentIntentId,
  signal,
}) {
  const response = await http.get(`${API_ENDPOINT}/one-time/history`, {
    params: {
      limit: limit,
      start_after_payment_intent_id: startingAfterPaymentIntentId,
    },
    signal,
  });

  return response;
}

/**
 * used to refund payment intent.
 *
 * @param {string} consultaitonId - the id of an existing consultation
 *
 * @returns {Promise} - Promise object represents the response from the server containing the client secret
 */
async function refund(consultationId) {
  const response = await http.post(`${API_ENDPOINT}/one-time/refund`, {
    consultationId: consultationId,
  });

  return response;
}

const exportedFunctions = {
  createPaymentIntent,
  cancelPaymentIntent,
  getPaymentHistory,
  refund,
};

export default exportedFunctions;

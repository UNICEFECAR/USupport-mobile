import http from "./http";
import { VITE_API_ENDPOINT } from "@env";

const API_ENDPOINT = `${VITE_API_ENDPOINT}/v1/email`;

/**
 * used to send an email
 *
 * @param {string} subject text written in the subjet of the email
 * @param {string} title the title of the email
 * @param {string} text the text of the email
 *
 * @returns {boolean} false if there was a problem with the email
 */
async function sendAdmin({ subject, title, text }) {
  const response = await http.post(`${API_ENDPOINT}/admin`, {
    subject,
    title,
    text,
  });

  return response;
}

const exportedFunctions = {
  sendAdmin,
};

export default exportedFunctions;

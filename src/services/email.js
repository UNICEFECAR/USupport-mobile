import http from "./http";
import Config from "react-native-config";
const { API_URL_ENDPOINT } = Config;

const API_ENDPOINT = `${API_URL_ENDPOINT}/v1/email`;

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

import http from "./http";
import { API_URL_ENDPOINT } from "@env";

const API_ENDPOINT = `${API_URL_ENDPOINT}/v1/messaging`;

async function getChatData(chatId) {
  const response = await http.get(`${API_ENDPOINT}/?chatId=${chatId}`);
  return response;
}

async function sendMessage(payload) {
  const response = await http.put(`${API_ENDPOINT}/`, payload);
  return response;
}

const exportedFunctions = {
  getChatData,
  sendMessage,
};

export default exportedFunctions;

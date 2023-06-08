import http from "./http";
import Config from "react-native-config";
const { API_URL_ENDPOINT } = Config;

const API_ENDPOINT = `${API_URL_ENDPOINT}/v1/messaging`;

async function getChatData(chatId) {
  const response = await http.get(`${API_ENDPOINT}/?chatId=${chatId}`);
  return response;
}

async function sendMessage(payload) {
  const response = await http.put(`${API_ENDPOINT}/`, payload);
  return response;
}

async function getAllChatData(providerDetailId, clientDetailId) {
  const response = await http.get(
    `${API_ENDPOINT}/all-chat-data?providerDetailId=${providerDetailId}&clientDetailId=${clientDetailId}`
  );
  return response;
}

const exportedFunctions = {
  getChatData,
  sendMessage,
  getAllChatData,
};

export default exportedFunctions;
